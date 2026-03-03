# SchoolDay → Hikvision Sync Tool (Desktop App)

## Talablar

> ⚠️ **Muhim:** Dastur ishlashi uchun kompyuter va Hikvision qurilma **bir xil tarmoqda (LAN)** bo'lishi shart!

- Python 3.8+

## O'rnatish va ishlatish (Ubuntu/Linux)

```bash
cd sync-tool
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python hikvision_sync_gui.py
```

## Build: Linux binary

```bash
source venv/bin/activate
pyinstaller --onefile --windowed --name hikvision_sync_gui hikvision_sync_gui.py
# Tayyor fayl: dist/hikvision_sync_gui
```

## Build: Windows .exe

Windows kompyuterda:

```cmd
pip install -r requirements.txt
pyinstaller --onefile --windowed --name hikvision_sync_gui hikvision_sync_gui.py
# Tayyor fayl: dist\hikvision_sync_gui.exe
```

## Dastur interfeysi

- **Domain URL** — SchoolDay server manzili (masalan: `https://schoolday.uz`)
- **API Token** — `.env` faylidagi `SYNC_API_TOKEN` qiymati
- **Qurilma IP** — Hikvision kamera/o'quvchi qurilma IP si (masalan: `192.168.1.100`)
- **Login / Parol** — Hikvision qurilma kirish ma'lumotlari

## API Token

Laravel `.env` faylidagi `SYNC_API_TOKEN` qiymatini nusxalang:

```
SYNC_API_TOKEN=ee7ea28697d85939c0593...
```

## Sinxronizatsiya qanday ishlaydi

1. Serverdan barcha o'quvchilar, yuz rasmlari bilan yuklanadi
2. Hikvision qurilmasidagi foydalanuvchilar o'qiladi
3. Farq hisoblanadi:
   - Bazada bor, qurilmada yo'q → **Qo'shiladi**
   - Qurilmada bor, bazada yo'q → **O'chiriladi**
   - Ikkala tomonda bor → **Yangilanadi**
4. Yuz rasmlari JPEG formatiga optimize qilinib yuklanadi
