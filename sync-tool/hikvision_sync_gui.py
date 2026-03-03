#!/usr/bin/env python3
"""
SchoolDay → Hikvision Sync Tool  (Desktop GUI)
================================================
Professional desktop application to synchronize students from the
SchoolDay web application to Hikvision access-control devices.

Build as single executable:
    pyinstaller --onefile --windowed --name hikvision_sync_gui hikvision_sync_gui.py
"""

import io
import json
import os
import sys
import threading
import time
import tkinter as tk
from tkinter import messagebox

import customtkinter as ctk
import requests
from requests.auth import HTTPDigestAuth

# ── Suppress SSL warnings ─────────────────────────────────────────────────────
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ── Theme ─────────────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Config file path (next to exe) ────────────────────────────────────────────
def config_path() -> str:
    if getattr(sys, "frozen", False):
        base = os.path.dirname(sys.executable)
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, "config.json")


def load_config() -> dict:
    try:
        with open(config_path(), "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_config(cfg: dict):
    try:
        with open(config_path(), "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=4, ensure_ascii=False)
    except Exception:
        pass


# ── Image normalization ───────────────────────────────────────────────────────
def normalize_face(image_bytes: bytes, max_width: int = 400, quality: int = 80) -> bytes:
    """
    Hikvision devices require:
    - JPEG format (not PNG)
    - Max ~200KB file size
    - Width typically 100–400px, height similar (face crop)
    """
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # Resize to max width
        if img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)
        # Save and check size — reduce quality until under 200KB
        for q in [quality, 70, 60, 50]:
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=q)
            if len(buf.getvalue()) < 200 * 1024:  # 200KB limit
                return buf.getvalue()
        return buf.getvalue()  # return smallest version
    except Exception:
        return image_bytes


# ── Hikvision device helpers ──────────────────────────────────────────────────
class HikvisionDevice:
    def __init__(self, ip, username, password):
        self.ip = ip.strip()
        self.base_url = f"http://{self.ip}"
        self.session = requests.Session()
        self.session.verify = False
        self.session.auth = HTTPDigestAuth(username, password)

    def _url(self, path):
        return f"{self.base_url}{path}"

    def json_req(self, method, path, body):
        for attempt in range(2):
            r = self.session.request(
                method, self._url(path),
                json=body,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
                timeout=15,
            )
            # 401 = Digest nonce expired — clear cached auth and retry once
            if r.status_code == 401 and attempt == 0:
                # Clear stale nonce from the auth object
                try:
                    self.session.auth._thread_local.__dict__.clear()
                except Exception:
                    pass
                time.sleep(0.3)
                continue
            break
        r.raise_for_status()
        try:
            return r.json()
        except Exception:
            return {}

    def upload_face(self, path, face_data_record, face_bytes):
        files = {
            "FaceDataRecord": ("facedata.json", json.dumps(face_data_record), "application/json"),
            "FaceImage": ("face.jpg", face_bytes, "image/jpeg"),
        }
        r = self.session.post(self._url(path), files=files, timeout=30)
        # Capture full device error before raising
        if not r.ok:
            try:
                body = r.json()
                sub = body.get("subStatusCode", "")
                err_msg = body.get("statusString", "") or str(body)
                raise Exception(f"Hikvision {r.status_code} [{sub}]: {err_msg}")
            except Exception as parse_err:
                if "Hikvision" in str(parse_err):
                    raise
                raise Exception(f"Hikvision HTTP {r.status_code}: {r.text[:200]}")
        try:
            return r.json()
        except Exception:
            return {}

    def test_connection(self) -> bool:
        try:
            r = self.session.get(self._url("/ISAPI/System/deviceInfo"), timeout=5)
            return r.status_code == 200
        except Exception:
            return False

    def get_all_users(self):
        users, position = [], 0
        while True:
            try:
                data = self.json_req("POST", "/ISAPI/AccessControl/UserInfo/Search?format=json", {
                    "UserInfoSearchCond": {"searchID": "1", "maxResults": 1000, "searchResultPosition": position}
                })
                matches = data.get("UserInfoSearch", {}).get("UserInfo", [])
                users.extend(u for u in matches if u.get("userType") == "normal")
                if len(matches) < 1000:
                    break
                position += 1000
            except Exception:
                break
        return users

    def add_user(self, info):
        return self.json_req("POST", "/ISAPI/AccessControl/UserInfo/Record?format=json", {"UserInfo": info})

    def modify_user(self, info):
        return self.json_req("PUT", "/ISAPI/AccessControl/UserInfo/Modify?format=json", {"UserInfo": info})

    def delete_users(self, employee_nos):
        return self.json_req("PUT", "/ISAPI/AccessControl/UserInfo/Delete?format=json", {
            "UserInfoDelCond": {"EmployeeNoList": [{"employeeNo": e} for e in employee_nos]}
        })

    def delete_face(self, fdid, fpid):
        return self.json_req("PUT", "/ISAPI/Intelligent/FDLib/FaceDataRecord/Delete?format=json", {
            "FaceDataRecord": [{"faceLibType": "blackFD", "FDID": fdid, "FPID": fpid}]
        })

    def add_face(self, employee_no, face_bytes):
        """Try FDID=1 first, fall back to FDID=0 (device-specific)."""
        last_err = None
        for fdid in ["1", "0"]:
            try:
                return self.upload_face(
                    "/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json",
                    {"faceLibType": "blackFD", "FDID": fdid, "FPID": str(employee_no)},
                    face_bytes,
                )
            except Exception as e:
                last_err = e
                msg = str(e).lower()
                # If device says face already exists — raise immediately for caller to handle
                if "alreadyexist" in msg or "already_exist" in msg or "deviceuseralreadyexistface" in msg:
                    raise
        raise last_err


def build_user_info(student: dict) -> dict:
    door_right = student.get("door_right") or "1"
    plan_template_no = student.get("plan_template_no") or "1"
    info = {
        "employeeNo": student["employeeNo"],
        "name": student["name"],
        "userType": "normal",
        "Valid": (
            {"enable": True,
             "beginTime": student.get("valid_begin") or "2024-01-01T00:00:00",
             "endTime": student.get("valid_end") or "2037-12-31T23:59:59"}
            if student.get("valid_enabled") else {"enable": False}
        ),
        "onlyVerify": not bool(student.get("local_ui_right")),
        "localUIRight": bool(student.get("local_ui_right")),
        "doorRight": door_right,
        "RightPlan": [{"doorNo": int(door_right) if door_right.isdigit() else 1,
                       "planTemplateNo": plan_template_no}],
    }
    if student.get("gender") and student["gender"] != "unknown":
        info["gender"] = student["gender"]
    if student.get("user_verify_mode"):
        info["userVerifyMode"] = student["user_verify_mode"]
    return info


# ── Main GUI App ──────────────────────────────────────────────────────────────
class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("SchoolDay → Hikvision Sync")
        self.geometry("780x680")
        self.resizable(True, True)
        self.minsize(700, 600)

        # Center window
        self.update_idletasks()
        x = (self.winfo_screenwidth() - 780) // 2
        y = (self.winfo_screenheight() - 680) // 2
        self.geometry(f"780x680+{x}+{y}")

        self._sync_thread = None
        self._stop_flag = False

        cfg = load_config()
        self._build_ui(cfg)

    # ── UI Layout ─────────────────────────────────────────────────────────────
    def _build_ui(self, cfg):
        # ── Header ───────────────────────────────────────────────────────────
        header = ctk.CTkFrame(self, fg_color=("#1a1a2e", "#0d0d1a"), corner_radius=0, height=70)
        header.pack(fill="x")
        header.pack_propagate(False)

        ctk.CTkLabel(
            header,
            text="SchoolDay  →  Hikvision Sync Tool",
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold"),
            text_color="#4fc3f7",
        ).pack(side="left", padx=24, pady=0)

        ctk.CTkLabel(
            header,
            text="v1.0",
            font=ctk.CTkFont(size=11),
            text_color="#546e7a",
        ).pack(side="right", padx=20)

        # ── Network warning banner ────────────────────────────────────────────
        warn = ctk.CTkFrame(self, fg_color=("#ff6f00", "#e65100"), corner_radius=0, height=38)
        warn.pack(fill="x")
        warn.pack_propagate(False)

        ctk.CTkLabel(
            warn,
            text="⚠️   Diqqat: Ushbu dastur ishlashi uchun kompyuter va Hikvision qurilma bir xil tarmoqda (LAN) bo'lishi shart!",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="#fff3e0",
        ).pack(expand=True)

        # ── Main content ──────────────────────────────────────────────────────
        content = ctk.CTkFrame(self, fg_color="transparent")
        content.pack(fill="both", expand=True, padx=20, pady=16)
        content.columnconfigure(0, weight=1)
        content.columnconfigure(1, weight=1)
        content.rowconfigure(1, weight=1)

        # ── Left column: Settings ─────────────────────────────────────────────
        left = ctk.CTkFrame(content, corner_radius=12)
        left.grid(row=0, column=0, sticky="nsew", padx=(0, 10), pady=0)

        ctk.CTkLabel(left, text="⚙️  Sozlamalar",
                     font=ctk.CTkFont(size=14, weight="bold")).pack(anchor="w", padx=16, pady=(14, 8))

        # Server settings
        self._section(left, "🌐  SchoolDay Server")
        self.domain_var = ctk.StringVar(value=cfg.get("domain", "schoolday.payday.uz"))
        self._field(left, "Domain URL", self.domain_var, "schoolday.uz  (https:// avtomatik qo'shiladi)")

        self.token_var = ctk.StringVar(value=cfg.get("api_token", "ee7ea28697d85939c0593ee51628a15dbb8cc5e8c8e5e77753773b85cee99cdb"))
        self._field(left, "API Token", self.token_var, "Bearer token...", show="•")

        # Hikvision settings
        self._section(left, "📷  Hikvision Qurilma")
        self.ip_var = ctk.StringVar(value=cfg.get("hikvision_ip", "192.168.1.105"))
        self._field(left, "Qurilma IP", self.ip_var, "192.168.1.100")

        self.hik_user_var = ctk.StringVar(value=cfg.get("hikvision_username", "admin"))
        self._field(left, "Login", self.hik_user_var, "admin")

        self.hik_pass_var = ctk.StringVar(value=cfg.get("hikvision_password", "hikvision"))
        self._field(left, "Parol", self.hik_pass_var, "••••••••", show="•")

        # Buttons
        btn_frame = ctk.CTkFrame(left, fg_color="transparent")
        btn_frame.pack(fill="x", padx=16, pady=(12, 16))

        self.test_btn = ctk.CTkButton(
            btn_frame, text="🔗  Ulanishni tekshir",
            fg_color="#1565c0", hover_color="#0d47a1",
            command=self._test_connection,
            font=ctk.CTkFont(size=12),
        )
        self.test_btn.pack(fill="x", pady=(0, 8))

        self.sync_btn = ctk.CTkButton(
            btn_frame, text="⚙️  Sinxronizatsiya boshlash",
            fg_color="#1b5e20", hover_color="#388e3c",
            command=self._start_sync,
            font=ctk.CTkFont(size=13, weight="bold"),
            height=42,
        )
        self.sync_btn.pack(fill="x")

        self.stop_btn = ctk.CTkButton(
            btn_frame, text="⛔  To'xtatish",
            fg_color="#b71c1c", hover_color="#d32f2f",
            command=self._stop_sync,
            font=ctk.CTkFont(size=12),
            state="disabled",
        )
        self.stop_btn.pack(fill="x", pady=(8, 0))

        # ── Right column: Progress + Log ──────────────────────────────────────
        right = ctk.CTkFrame(content, corner_radius=12)
        right.grid(row=0, column=1, sticky="nsew", padx=(10, 0), pady=0)
        right.rowconfigure(2, weight=1)
        right.columnconfigure(0, weight=1)

        ctk.CTkLabel(right, text="📊  Holat va natija",
                     font=ctk.CTkFont(size=14, weight="bold")).grid(
            row=0, column=0, sticky="w", padx=16, pady=(14, 8))

        # Stats row
        stats = ctk.CTkFrame(right, fg_color="transparent")
        stats.grid(row=1, column=0, sticky="ew", padx=12, pady=(0, 10))
        stats.columnconfigure((0, 1, 2), weight=1)

        self.stat_added = self._stat_box(stats, "Qo'shildi", "#2e7d32", 0)
        self.stat_updated = self._stat_box(stats, "Yangilandi", "#1565c0", 1)
        self.stat_deleted = self._stat_box(stats, "O'chirildi", "#b71c1c", 2)

        # Progress
        prog_frame = ctk.CTkFrame(right, fg_color="transparent")
        prog_frame.grid(row=2, column=0, sticky="ew", padx=14, pady=(0, 6))
        prog_frame.columnconfigure(0, weight=1)

        self.progress_label = ctk.CTkLabel(
            prog_frame, text="Tayyor", font=ctk.CTkFont(size=11), text_color="#78909c",
            anchor="w")
        self.progress_label.pack(fill="x")

        self.progress = ctk.CTkProgressBar(prog_frame, height=14, corner_radius=6)
        self.progress.pack(fill="x", pady=(4, 0))
        self.progress.set(0)

        self.pct_label = ctk.CTkLabel(
            prog_frame, text="0%", font=ctk.CTkFont(size=11, weight="bold"),
            text_color="#4fc3f7", anchor="e")
        self.pct_label.pack(fill="x")

        # Log box
        log_frame = ctk.CTkFrame(right, fg_color="transparent")
        log_frame.grid(row=3, column=0, sticky="nsew", padx=12, pady=(0, 14))
        log_frame.rowconfigure(0, weight=1)
        log_frame.columnconfigure(0, weight=1)
        right.rowconfigure(3, weight=1)

        self.log_box = ctk.CTkTextbox(
            log_frame,
            font=ctk.CTkFont(family="Courier New", size=11),
            fg_color=("#1a1a2e", "#0a0a1a"),
            text_color="#b0bec5",
            corner_radius=8,
            wrap="word",
            state="disabled",
        )
        self.log_box.grid(row=0, column=0, sticky="nsew")

        # Clear log button
        ctk.CTkButton(
            right, text="🗑  Logni tozalash",
            fg_color="transparent", border_width=1, border_color="#37474f",
            hover_color="#263238",
            command=self._clear_log,
            font=ctk.CTkFont(size=11),
            height=28,
        ).grid(row=4, column=0, sticky="e", padx=14, pady=(0, 12))

        # ── Status bar ────────────────────────────────────────────────────────
        status_bar = ctk.CTkFrame(self, fg_color=("#0d0d1a", "#080810"), corner_radius=0, height=30)
        status_bar.pack(fill="x", side="bottom")
        status_bar.pack_propagate(False)

        self.status_var = ctk.StringVar(value="Tayyor. Sozlamalarni kiriting va sinxronizatsiyani boshlang.")
        ctk.CTkLabel(
            status_bar, textvariable=self.status_var,
            font=ctk.CTkFont(size=11), text_color="#546e7a",
            anchor="w",
        ).pack(side="left", padx=12, pady=0)

        self._log("SchoolDay → Hikvision Sync Tool ishga tushdi.\n")
        self._log("⚠️  Kompyuter va qurilma bir tarmoqda bo'lishi shart.\n", color="#ff8f00")

    # ── Helper builders ───────────────────────────────────────────────────────
    def _section(self, parent, text):
        f = ctk.CTkFrame(parent, fg_color="#263238", corner_radius=6, height=28)
        f.pack(fill="x", padx=12, pady=(10, 4))
        f.pack_propagate(False)
        ctk.CTkLabel(f, text=text, font=ctk.CTkFont(size=11, weight="bold"),
                     text_color="#90a4ae").pack(side="left", padx=10)

    def _field(self, parent, label, var, placeholder, show=None):
        ctk.CTkLabel(parent, text=label, font=ctk.CTkFont(size=11),
                     text_color="#90a4ae").pack(anchor="w", padx=16, pady=(6, 0))
        kw = dict(textvariable=var, placeholder_text=placeholder, height=34,
                  font=ctk.CTkFont(size=12), corner_radius=6)
        if show:
            kw["show"] = show
        ctk.CTkEntry(parent, **kw).pack(fill="x", padx=14, pady=(2, 0))

    # Map main color → dark bg color (avoid 8-char hex, unsupported in old tkinter)
    _STAT_BG = {
        "#2e7d32": "#1a2e1a",
        "#1565c0": "#101a2e",
        "#b71c1c": "#2e1010",
    }

    def _stat_box(self, parent, label, color, col):
        bg = self._STAT_BG.get(color, "#1a1a2e")
        frame = ctk.CTkFrame(parent, fg_color=bg,
                             border_color=color, border_width=1, corner_radius=8)
        frame.grid(row=0, column=col, padx=4, sticky="ew")

        var = ctk.StringVar(value="0")
        ctk.CTkLabel(frame, textvariable=var, font=ctk.CTkFont(size=22, weight="bold"),
                     text_color=color).pack(pady=(6, 0))
        ctk.CTkLabel(frame, text=label, font=ctk.CTkFont(size=10),
                     text_color="#78909c").pack(pady=(0, 6))
        return var

    # ── Logging ───────────────────────────────────────────────────────────────
    def _log(self, msg, color=None):
        def _do():
            self.log_box.configure(state="normal")
            tag = f"c{hash(color)}" if color else None
            if tag and color:
                try:
                    self.log_box._textbox.tag_configure(tag, foreground=color)
                except Exception:
                    pass
            if tag:
                self.log_box.insert("end", msg, tag)
            else:
                self.log_box.insert("end", msg)
            self.log_box.see("end")
            self.log_box.configure(state="disabled")
        self.after(0, _do)

    def _clear_log(self):
        self.log_box.configure(state="normal")
        self.log_box.delete("1.0", "end")
        self.log_box.configure(state="disabled")

    def _set_status(self, msg):
        self.after(0, lambda: self.status_var.set(msg))

    def _set_progress(self, val, msg="", pct=None):
        def _do():
            self.progress.set(val)
            self.progress_label.configure(text=msg)
            self.pct_label.configure(text=f"{int(val * 100)}%" if pct is None else pct)
        self.after(0, _do)

    def _set_stats(self, added=None, updated=None, deleted=None):
        def _do():
            if added is not None:
                self.stat_added.set(str(added))
            if updated is not None:
                self.stat_updated.set(str(updated))
            if deleted is not None:
                self.stat_deleted.set(str(deleted))
        self.after(0, _do)

    def _get_fields(self):
        domain = self.domain_var.get().strip().rstrip("/")
        # Auto-add https:// if user typed just the hostname
        if domain and not domain.startswith(("http://", "https://")):
            domain = "https://" + domain
        return {
            "domain": domain,
            "api_token": self.token_var.get().strip(),
            "hikvision_ip": self.ip_var.get().strip(),
            "hikvision_username": self.hik_user_var.get().strip(),
            "hikvision_password": self.hik_pass_var.get().strip(),
        }

    def _validate(self, cfg):
        for key, label in [
            ("domain", "Domain URL"),
            ("api_token", "API Token"),
            ("hikvision_ip", "Qurilma IP"),
            ("hikvision_username", "Login"),
            ("hikvision_password", "Parol"),
        ]:
            if not cfg.get(key):
                messagebox.showerror("Xato", f"'{label}' bo'sh bo'lmasin!")
                return False
        return True

    # ── Test connection ───────────────────────────────────────────────────────
    def _test_connection(self):
        cfg = self._get_fields()
        if not self._validate(cfg):
            return

        self.test_btn.configure(state="disabled", text="Tekshirilmoqda...")
        self._log("\n🔗 Ulanishlar tekshirilmoqda...\n")

        def _do():
            # Test domain
            try:
                r = requests.get(
                    cfg["domain"].rstrip("/") + "/api/sync/students",
                    headers={"Authorization": f"Bearer {cfg['api_token']}", "Accept": "application/json"},
                    timeout=8,
                )
                if r.status_code == 200:
                    data = r.json()
                    self._log(f"  ✅ Server: OK — {data.get('count', 0)} ta o'quvchi topildi\n", "#4caf50")
                elif r.status_code == 401:
                    self._log("  ❌ Server: Token xato!\n", "#f44336")
                else:
                    self._log(f"  ❌ Server: HTTP {r.status_code}\n", "#f44336")
            except Exception as e:
                self._log(f"  ❌ Server ulanishda xato: {e}\n", "#f44336")

            # Test Hikvision
            device = HikvisionDevice(cfg["hikvision_ip"], cfg["hikvision_username"], cfg["hikvision_password"])
            if device.test_connection():
                self._log(f"  ✅ Hikvision ({cfg['hikvision_ip']}): OK\n", "#4caf50")
            else:
                self._log(f"  ❌ Hikvision ({cfg['hikvision_ip']}): Ulanib bo'lmadi!\n", "#f44336")
                self._log("     ⚠️  Qurilma bilan bir xil tarmoqda ekanligingizni tekshiring.\n", "#ff8f00")

            self.after(0, lambda: self.test_btn.configure(state="normal", text="🔗  Ulanishni tekshir"))

        threading.Thread(target=_do, daemon=True).start()

    # ── Sync ─────────────────────────────────────────────────────────────────
    def _start_sync(self):
        cfg = self._get_fields()
        if not self._validate(cfg):
            return
        if self._sync_thread and self._sync_thread.is_alive():
            return

        # Save config
        save_config(cfg)

        self._stop_flag = False
        self._set_stats(0, 0, 0)
        self._set_progress(0, "Tayyorlanmoqda...", "0%")
        self.sync_btn.configure(state="disabled", text="⏳  Ishlamoqda...")
        self.stop_btn.configure(state="normal")

        self._sync_thread = threading.Thread(target=self._sync_worker, args=(cfg,), daemon=True)
        self._sync_thread.start()

    def _stop_sync(self):
        self._stop_flag = True
        self._log("\n⛔ To'xtatish buyrug'i yuborildi...\n", "#ff8f00")
        self.stop_btn.configure(state="disabled")

    def _sync_done(self, success=True):
        def _do():
            self.sync_btn.configure(state="normal", text="⚙️  Sinxronizatsiya boshlash")
            self.stop_btn.configure(state="disabled")
            if success:
                self._set_progress(1, "Muvaffaqiyatli yakunlandi!", "100%")
                self._set_status("✅ Sinxronizatsiya muvaffaqiyatli yakunlandi.")
            else:
                self._set_status("⚠️ Sinxronizatsiya xatolar bilan yakunlandi.")
        self.after(0, _do)

    def _sync_worker(self, cfg):
        domain = cfg["domain"].rstrip("/")
        token = cfg["api_token"]
        hik_ip = cfg["hikvision_ip"]
        hik_user = cfg["hikvision_username"]
        hik_pass = cfg["hikvision_password"]

        self._log("\n══════════════════════════════════════════\n")
        self._log(f"  Sinxronizatsiya boshlandi: {time.strftime('%H:%M:%S')}\n", "#4fc3f7")
        self._log("══════════════════════════════════════════\n")

        errors = []
        n_added, n_updated, n_deleted = 0, 0, 0

        # ── Step 1: Fetch students ────────────────────────────────────────────
        self._log("\n📥  Serverdan o'quvchilar olinmoqda...\n")
        self._set_progress(0.02, "Serverdan ma'lumotlar yuklanmoqda...")
        try:
            r = requests.get(
                f"{domain}/api/sync/students",
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
                timeout=30,
            )
            if r.status_code == 401:
                self._log("  ❌ Token xato! API ruxsat bermadi.\n", "#f44336")
                self._sync_done(False)
                return
            r.raise_for_status()
            students = r.json().get("students", [])
            self._log(f"  ✅ {len(students)} ta o'quvchi yuklandi\n", "#4caf50")
        except Exception as e:
            self._log(f"  ❌ Server xato: {e}\n", "#f44336")
            self._sync_done(False)
            return

        db_employees = {s["employeeNo"]: s for s in students}

        # ── Step 2: Connect to device ─────────────────────────────────────────
        self._log(f"\n📡  Qurilmaga ulanilmoqda ({hik_ip})...\n")
        self._set_progress(0.05, "Qurilmaga ulanilmoqda...")
        device = HikvisionDevice(hik_ip, hik_user, hik_pass)
        if not device.test_connection():
            self._log(f"  ❌ Qurilmaga ulanib bo'lmadi!\n", "#f44336")
            self._log("  ⚠️  Qurilma bilan bir xil tarmoqda ekanligingizni tekshiring.\n", "#ff8f00")
            self._sync_done(False)
            return

        # ── Step 3: Fetch device users ────────────────────────────────────────
        self._log("  ✅ Qurilmaga ulandi\n", "#4caf50")
        self._log("\n🔍  Qurilmadagi foydalanuvchilar o'qilmoqda...\n")
        self._set_progress(0.08, "Qurilmadagi foydalanuvchilar o'qilmoqda...")
        device_users = device.get_all_users()
        device_enos = {u["employeeNo"] for u in device_users}
        self._log(f"  ✅ Qurilmada {len(device_users)} ta foydalanuvchi\n", "#4caf50")

        # ── Step 4: Calculate diff ────────────────────────────────────────────
        to_delete = [e for e in device_enos if e not in db_employees]
        to_add = [s for s in students if s["employeeNo"] not in device_enos]
        to_update = [s for s in students if s["employeeNo"] in device_enos]

        total = len(to_delete) + len(to_add) + len(to_update)
        self._log(f"\n📊  Rejа:\n")
        self._log(f"     🗑  O'chirish:  {len(to_delete)} ta\n", "#ef5350")
        self._log(f"     ➕  Qo'shish:   {len(to_add)} ta\n", "#66bb6a")
        self._log(f"     🔄  Yangilash:  {len(to_update)} ta\n", "#42a5f5")

        if total == 0:
            self._log("\n✅  Hamma narsa sinxron! O'zgarish yo'q.\n", "#4caf50")
            self._sync_done(True)
            return

        done = 0

        # ── Step 5: Delete extras ─────────────────────────────────────────────
        if to_delete:
            self._log(f"\n🗑  Ortiqcha {len(to_delete)} ta o'quvchi o'chirilmoqda...\n")
            for i in range(0, len(to_delete), 50):
                if self._stop_flag:
                    break
                chunk = to_delete[i:i + 50]
                try:
                    device.delete_users(chunk)
                    n_deleted += len(chunk)
                    self._set_stats(deleted=n_deleted)
                except Exception as e:
                    errors.append(f"O'chirishda xato: {e}")
                    self._log(f"  ⚠  Xato: {e}\n", "#ff8f00")
                done += len(chunk)
                self._set_progress(0.1 + 0.3 * (done / total), f"O'chirilmoqda... ({done}/{total})")

        # ── Step 6: Add missing ───────────────────────────────────────────────
        if to_add and not self._stop_flag:
            self._log(f"\n➕  {len(to_add)} ta yangi o'quvchi qo'shilmoqda...\n")
            for student in to_add:
                if self._stop_flag:
                    break
                name = student["name"]
                eno = student["employeeNo"]
                try:
                    user_info = build_user_info(student)
                    try:
                        device.add_user(user_info)
                    except Exception as e:
                        msg = str(e).lower()
                        if "alreadyexist" in msg or "already_exist" in msg:
                            device.modify_user(user_info)
                        else:
                            raise

                    face_url = student.get("face_image_url")
                    if face_url:
                        try:
                            # verify=False in case server has self-signed cert
                            fr = requests.get(face_url, timeout=15)
                            if fr.status_code == 200 and len(fr.content) > 100:
                                face_bytes = normalize_face(fr.content)
                                self._log(f"  📷  Rasm: {len(face_bytes)//1024}KB yuborilmoqda...\n", "#78909c")
                                try:
                                    device.add_face(eno, face_bytes)
                                    # Re-index trigger
                                    try:
                                        device.modify_user(user_info)
                                    except Exception:
                                        pass
                                except Exception as face_err:
                                    msg = str(face_err).lower()
                                    if "alreadyexist" in msg or "deviceuseralreadyexistface" in msg:
                                        # Nuclear: delete user fully, recreate with face
                                        self._log(f"  ♻  Yuz o'chirib qayta yozilmoqda ({name})...\n", "#ff8f00")
                                        try:
                                            device.delete_users([eno])
                                            device.add_user(user_info)
                                            device.add_face(eno, face_bytes)
                                            device.modify_user(user_info)
                                        except Exception as nuke_err:
                                            self._log(f"  ❌  Qayta yozishda xato ({name}): {nuke_err}\n", "#f44336")
                                            errors.append(f"{name} (face nuclear): {nuke_err}")
                                    else:
                                        self._log(f"  ❌  Yuz rasmi ({name}): {face_err}\n", "#f44336")
                                        errors.append(f"{name} (face): {face_err}")
                            else:
                                self._log(f"  ⚠  Rasm yuklanmadi (HTTP {fr.status_code})\n", "#ff8f00")
                        except Exception as fe:
                            self._log(f"  ⚠  Rasm yuklashda xato ({name}): {fe}\n", "#ff8f00")

                    n_added += 1
                    self._set_stats(added=n_added)
                    self._log(f"  ✅  {name}\n", "#4caf50")
                except Exception as e:
                    errors.append(f"{name}: {e}")
                    self._log(f"  ❌  {name}: {e}\n", "#f44336")

                done += 1
                self._set_progress(0.1 + 0.3 * (done / total), f"Qo'shilmoqda: {name}")

        # ── Step 7: Update existing ───────────────────────────────────────────
        if to_update and not self._stop_flag:
            self._log(f"\n🔄  {len(to_update)} ta o'quvchi yangilanmoqda...\n")
            for student in to_update:
                if self._stop_flag:
                    break
                name = student["name"]
                eno = student["employeeNo"]
                try:
                    user_info = build_user_info(student)
                    device.modify_user(user_info)

                    face_url = student.get("face_image_url")
                    if face_url:
                        try:
                            fr = requests.get(face_url, timeout=15, verify=False)
                            if fr.status_code == 200 and len(fr.content) > 100:
                                face_bytes = normalize_face(fr.content)
                                self._log(f"  📷  Rasm: {len(face_bytes)//1024}KB\n", "#78909c")
                                # Delete old face first
                                for fdid in ["1", "0"]:
                                    try:
                                        device.delete_face(fdid, eno)
                                    except Exception:
                                        pass
                                try:
                                    device.add_face(eno, face_bytes)
                                    try:
                                        device.modify_user(user_info)
                                    except Exception:
                                        pass
                                except Exception as face_err:
                                    msg = str(face_err).lower()
                                    if "alreadyexist" in msg or "deviceuseralreadyexistface" in msg:
                                        # Nuclear option
                                        self._log(f"  ♻  Qayta yozilmoqda ({name})...\n", "#ff8f00")
                                        try:
                                            device.delete_users([eno])
                                            device.add_user(user_info)
                                            device.add_face(eno, face_bytes)
                                            device.modify_user(user_info)
                                        except Exception as nuke_err:
                                            errors.append(f"{name} (face): {nuke_err}")
                                    else:
                                        self._log(f"  ❌  Yuz rasmi ({name}): {face_err}\n", "#f44336")
                                        errors.append(f"{name} (face): {face_err}")
                            else:
                                self._log(f"  ⚠  Rasm yuklanmadi (HTTP {fr.status_code})\n", "#ff8f00")
                        except Exception as fe:
                            self._log(f"  ⚠  Rasm xato ({name}): {fe}\n", "#ff8f00")

                    n_updated += 1
                    self._set_stats(updated=n_updated)
                except Exception as e:
                    errors.append(f"{name}: {e}")
                    self._log(f"  ❌  {name}: {e}\n", "#f44336")

                done += 1
                self._set_progress(0.1 + 0.9 * (done / total), f"Yangilanmoqda: {name}")

        # ── Done ──────────────────────────────────────────────────────────────
        self._log("\n══════════════════════════════════════════\n")
        if self._stop_flag:
            self._log("  ⛔  Sinxronizatsiya to'xtatildi.\n", "#ff8f00")
        elif errors:
            self._log(f"  ⚠  {len(errors)} ta xato bilan yakunlandi:\n", "#ff8f00")
            for err in errors[:5]:
                self._log(f"     • {err}\n", "#ef5350")
            if len(errors) > 5:
                self._log(f"     ... va yana {len(errors)-5} ta xato\n", "#78909c")
        else:
            self._log("  ✅  Sinxronizatsiya muvaffaqiyatli yakunlandi!\n", "#4caf50")

        self._log(f"""
  📊  Jami natija:
       Qo'shildi:  {n_added} ta
       Yangilandi:  {n_updated} ta
       O'chirildi:  {n_deleted} ta
""")
        self._log("══════════════════════════════════════════\n")
        self._sync_done(len(errors) == 0 and not self._stop_flag)


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = App()
    app.mainloop()
