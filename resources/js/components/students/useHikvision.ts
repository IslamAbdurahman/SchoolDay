import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface HikvisionConfig {
    ipAddresses: string;
    username: string;
    password: string;
}

// ── Image normalizer ─────────────────────────────────────────────────────────
// Hikvision devices are strict about face image format. Raw PNG or large JPEG
// files often fail face recognition until the image is re-saved from the web
// panel (which normalizes the image). We replicate that normalization here:
// convert any blob to JPEG (max 640px wide, 90% quality) via Canvas.
async function normalizeForHikvision(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            // Max 640px width, keep aspect ratio
            const MAX = 640;
            let { width, height } = img;
            if (width > MAX) {
                height = Math.round((height * MAX) / width);
                width = MAX;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                out => out ? resolve(out) : reject(new Error('Canvas toBlob failed')),
                'image/jpeg',
                0.90,
            );
        };
        img.onerror = reject;
        img.src = url;
    });
}

// ── Proxy helpers ────────────────────────────────────────────────────────────
// Browser → /hikvision/proxy (same-origin) → SchoolDay → Hikvision device
// CSRF token is handled globally in app.tsx (axios.defaults).
// The proxy always returns HTTP 200; real Hikvision status is in { hik_ok, hik_status, data }.

async function proxyRequest(payload: FormData | object): Promise<any> {
    const res = await axios.post('/hikvision/proxy', payload);
    const { hik_ok, hik_status, error } = res.data;

    if (!hik_ok) {
        if (hik_status === 401) {
            throw new Error('Hikvision 401: Username yoki parol noto\'g\'ri. Sozlamalarni tekshiring.');
        }
        const data = res.data.data ?? {};
        const sub = data.subStatusCode ?? '';
        const msg = error || `Hikvision error ${hik_status}: ${JSON.stringify(data)}`;
        throw new Error(sub ? `[${sub}] ${msg}` : msg);
    }
    return res.data.data;
}

async function proxyJson(
    ip: string,
    username: string,
    password: string,
    method: 'POST' | 'PUT',
    path: string,
    body: object,
): Promise<void> {
    await proxyRequest({ ip, username, password, method, path, body });
}

async function proxyJsonWithData(
    ip: string,
    username: string,
    password: string,
    method: 'POST' | 'PUT',
    path: string,
    body: object,
): Promise<any> {
    return await proxyRequest({ ip, username, password, method, path, body });
}

/**
 * Check for duplicate faces on device using FDSearch.
 * Returns the employeeNo of the duplicate face owner, or null if no duplicate.
 */
async function checkDuplicateFace(
    ip: string,
    username: string,
    password: string,
    faceBlob: Blob,
    currentEmployeeNo: string,
): Promise<string | null> {
    try {
        const fd = new FormData();
        fd.append('ip', ip);
        fd.append('username', username);
        fd.append('password', password);
        fd.append('method', 'POST');
        fd.append('path', '/ISAPI/Intelligent/FDLib/FCSearch?format=json');
        fd.append('face_data_record', JSON.stringify({
            searchResultPosition: 0,
            maxResults: 5,
            faceLibType: 'blackFD',
            FDID: '1',
            similarity: 80, // 80% similarity threshold
        }));
        fd.append('face_image', faceBlob, 'face.jpg');
        const data = await proxyRequest(fd);

        // Check if any matches belong to a DIFFERENT employee
        const matchList = data?.MatchList || [];
        for (const match of matchList) {
            if (match.FPID && match.FPID !== currentEmployeeNo && (match.similarity ?? 0) >= 80) {
                return match.FPID; // duplicate found — return the other employee's ID
            }
        }
    } catch (e: any) {
        // FCSearch may not be supported on all devices — silently skip
        console.warn('Face duplicate check skipped:', e?.message);
    }
    return null;
}

async function proxyFace(
    ip: string,
    username: string,
    password: string,
    method: 'POST' | 'PUT',
    path: string,
    faceBlob: Blob,
    faceDataRecord: object,
): Promise<void> {
    const fd = new FormData();
    fd.append('ip', ip);
    fd.append('username', username);
    fd.append('password', password);
    fd.append('method', method);
    fd.append('path', path);
    fd.append('face_data_record', JSON.stringify(faceDataRecord));
    fd.append('face_image', faceBlob, 'face.jpg');
    await proxyRequest(fd);
}
// ─────────────────────────────────────────────────────────────────────────────

export function useHikvision() {
    const { t } = useTranslation();
    const [hikvisionConfig, setHikvisionConfig] = useState<HikvisionConfig>({
        ipAddresses: '',
        username: '',
        password: '',
    });
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; message: string } | null>(null);

    useEffect(() => {
        setHikvisionConfig({
            ipAddresses: localStorage.getItem('hikvision_ips') || '',
            username: localStorage.getItem('hikvision_username') || '',
            password: localStorage.getItem('hikvision_password') || '',
        });
    }, []);

    const saveConfig = () => {
        localStorage.setItem('hikvision_ips', hikvisionConfig.ipAddresses);
        localStorage.setItem('hikvision_username', hikvisionConfig.username);
        localStorage.setItem('hikvision_password', hikvisionConfig.password);
        setIsConfigOpen(false);
    };

    const getIps = () =>
        hikvisionConfig.ipAddresses
            .split(',')
            .map(ip => ip.trim())
            .filter(ip => ip);

    // ── Sync (create / update) ───────────────────────────────────────────────
    const syncStudentToDevices = async (
        studentId: string,
        studentName: string,
        faceImage: File | string | null,
        isEdit: boolean = false,
        deviceSettings?: {
            gender?: string;
            user_verify_mode?: string;
            local_ui_right?: boolean;
            door_right?: string;
            plan_template_no?: string;
            valid_enabled?: boolean;
            valid_begin?: string;
            valid_end?: string;
        },
    ): Promise<boolean> => {
        if (!hikvisionConfig.ipAddresses) return true;
        const ips = getIps();
        if (ips.length === 0) return true;

        setStatusText(t('students.syncing', "Qurilmalarga jo'natilmoqda..."));

        const ds = deviceSettings ?? {};
        const doorRight = ds.door_right || '1';
        const planTemplateNo = ds.plan_template_no || '1';

        const userInfo: Record<string, any> = {
            employeeNo: String(studentId),
            name: studentName,
            userType: 'normal',
            Valid: ds.valid_enabled
                ? {
                    enable: true,
                    beginTime: (ds.valid_begin || '2024-01-01T00:00:00').replace('T', 'T').slice(0, 19),
                    endTime: (ds.valid_end || '2037-12-31T23:59:59').replace('T', 'T').slice(0, 19),
                }
                : { enable: false },
            // "Attendance Check Only" — DS-K1T343EWX uses 'onlyVerify' parameter.
            // onlyVerify: true  → attendance only (door does NOT open)
            // onlyVerify: false → normal access (door opens)
            // (confirmed from device capabilities: "onlyVerify": {"@opt": [true, false]})
            onlyVerify: !(ds.local_ui_right ?? false),
            localUIRight: ds.local_ui_right ?? false,
            doorRight: doorRight,
            RightPlan: [
                {
                    doorNo: Number(doorRight) || 1,
                    planTemplateNo: planTemplateNo,
                },
            ],
        };

        // Optional fields
        if (ds.gender && ds.gender !== 'unknown') {
            userInfo.gender = ds.gender;
        }
        if (ds.user_verify_mode) {
            userInfo.userVerifyMode = ds.user_verify_mode;
        }

        // Resolve face blob and normalize to Hikvision-compatible JPEG.
        // Raw PNG / large JPEG files are often not recognized by the device
        // until they are re-normalized (same as the web panel does internally).
        let faceBlob: Blob | null = null;
        if (faceImage instanceof File) {
            faceBlob = faceImage;
        } else if (typeof faceImage === 'string' && faceImage) {
            try {
                const res = await fetch(faceImage);
                if (res.ok) faceBlob = await res.blob();
            } catch (err) {
                console.error('Failed to load face image', err);
            }
        }
        // Normalize: convert to JPEG max-640px regardless of original format
        if (faceBlob) {
            try {
                faceBlob = await normalizeForHikvision(faceBlob);
            } catch (err) {
                console.warn('Image normalization failed, using original:', err);
            }
        }

        const { username, password } = hikvisionConfig;

        const promises = ips.map(async ip => {
            try {
                // 1. UserInfo — always try Modify first, fall back to Record
                const recordPath = '/ISAPI/AccessControl/UserInfo/Record?format=json';
                const modifyPath = '/ISAPI/AccessControl/UserInfo/Modify?format=json';

                let userCreated = false;
                try {
                    // Try Modify first (works for existing users)
                    await proxyJson(ip, username, password, 'PUT', modifyPath, { UserInfo: userInfo });
                } catch (modifyErr: any) {
                    // Modify failed — user likely doesn't exist, create it
                    console.warn('Modify failed, trying Record:', modifyErr?.message);
                    try {
                        await proxyJson(ip, username, password, 'POST', recordPath, { UserInfo: userInfo });
                        userCreated = true;
                    } catch (createErr: any) {
                        const msg = createErr?.message?.toLowerCase() ?? '';
                        if (msg.includes('alreadyexist') || msg.includes('already_exist')) {
                            // User exists but Modify failed for another reason — retry Modify
                            await proxyJson(ip, username, password, 'PUT', modifyPath, { UserInfo: userInfo });
                        } else {
                            throw createErr;
                        }
                    }
                }

                // 2. FaceInfo
                // Before uploading, check for duplicate faces on the device.
                // If the same face already belongs to another employee, warn the user.
                if (faceBlob) {
                    const duplicateOwner = await checkDuplicateFace(
                        ip, username, password, faceBlob, String(studentId));
                    if (duplicateOwner) {
                        const proceed = window.confirm(
                            `⚠️ Bu yuz qurilmada boshqa foydalanuvchiga tegishli (Employee №${duplicateOwner}).\n` +
                            `Davom etishni xohlaysizmi?`
                        );
                        if (!proceed) {
                            return { error: true, ip, message: 'Dublikat yuz aniqlandi — foydalanuvchi bekor qildi' };
                        }
                    }

                    const facePath = '/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json';
                    const faceDataRecord = {
                        faceLibType: 'blackFD',
                        FDID: '1',
                        FPID: String(studentId),
                    };

                    if (isEdit) {
                        // Delete old face record before uploading new one.
                        for (const fdid of ['1', '0']) {
                            try {
                                await proxyJson(ip, username, password, 'PUT',
                                    '/ISAPI/Intelligent/FDLib/FaceDataRecord/Delete?format=json',
                                    {
                                        FaceDataRecord: [{
                                            faceLibType: 'blackFD',
                                            FDID: fdid,
                                            FPID: String(studentId),
                                        }],
                                    });
                                break;
                            } catch (e: any) {
                                console.warn(`Face delete (FDID=${fdid}) failed:`, e?.message);
                            }
                        }
                    }

                    // POST the new face.
                    try {
                        await proxyFace(ip, username, password, 'POST', facePath, faceBlob, faceDataRecord);
                    } catch (facePostErr: any) {
                        const msg: string = facePostErr?.message ?? '';

                        if (msg.includes('deviceUserAlreadyExistFace')) {
                            // Nuclear option: delete entire user, re-add user + face.
                            console.warn('Face still on device, doing full user delete + recreate...');

                            await proxyJson(ip, username, password, 'PUT',
                                '/ISAPI/AccessControl/UserInfo/Delete?format=json',
                                {
                                    UserInfoDelCond: {
                                        EmployeeNoList: [{ employeeNo: String(studentId) }],
                                    },
                                });

                            await proxyJson(ip, username, password, 'POST',
                                '/ISAPI/AccessControl/UserInfo/Record?format=json',
                                { UserInfo: userInfo });

                            await proxyFace(ip, username, password, 'POST', facePath, faceBlob, faceDataRecord);
                        } else {
                            throw facePostErr;
                        }
                    }

                    // 3. CRITICAL: Send a Modify after face upload to trigger
                    //    the device to re-index and activate the face for recognition.
                    //    This replicates what the Hikvision web panel does on Save.
                    try {
                        await proxyJson(ip, username, password, 'PUT',
                            '/ISAPI/AccessControl/UserInfo/Modify?format=json',
                            { UserInfo: userInfo });
                    } catch (e: any) {
                        console.warn('Post-face Modify (re-index trigger) failed:', e?.message);
                    }
                }

                return { error: false, ip };
            } catch (err: any) {
                console.error(`Error syncing to ${ip}:`, err);
                return { error: true, ip, message: err?.message ?? '' };
            }
        });

        const results = await Promise.all(promises);
        const errs = results.filter((r: any) => r && r.error);
        setStatusText('');

        if (errs.length > 0) {
            alert(
                t('students.sync_error', 'Qurilmaga ulanishda xatolik') + ':\n' +
                errs.map((e: any) => `${e.ip}: ${e.message || 'Ulanib bo\'lmadi'}`).join('\n'),
            );
            return false;
        }
        return true;
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const deleteStudentFromDevices = async (studentId: string): Promise<boolean> => {
        if (!hikvisionConfig.ipAddresses) return true;
        const ips = getIps();
        if (ips.length === 0) return true;

        setStatusText(t('students.syncing_delete', "Qurilmalardan o'chirilmoqda..."));

        const { username, password } = hikvisionConfig;

        const promises = ips.map(async ip => {
            try {
                // Hikvision Delete: body must use UserInfoDelCond — NOT UserInfoDetail
                await proxyJson(ip, username, password, 'PUT',
                    '/ISAPI/AccessControl/UserInfo/Delete?format=json',
                    {
                        UserInfoDelCond: {
                            EmployeeNoList: [{ employeeNo: String(studentId) }],
                        },
                    });
                return { error: false, ip };
            } catch (err) {
                console.error(`Error deleting from ${ip}:`, err);
                return { error: true, ip };
            }
        });

        const results = await Promise.all(promises);
        const errs = results.filter((r: any) => r && r.error);
        setStatusText('');

        if (errs.length > 0) {
            alert(
                t('students.sync_delete_error', "Sinxronizatsiya xatosi: Quyidagi qurilmalardan o'chirishda xatolik:\n") +
                errs.map((e: any) => e.ip).join('\n'),
            );
            return false;
        }
        return true;
    };

    // ── Check & Sync All ───────────────────────────────────────────────────
    const syncAllStudents = async () => {
        if (!hikvisionConfig.ipAddresses) return;
        const ips = getIps();
        if (ips.length === 0) return;

        try {
            setSyncProgress({ current: 0, total: 100, message: t('students.sync_fetching_db', "Bazada'gi barcha o'quvchilar yuklanmoqda...") });
            const res = await axios.get('/students/all');
            const allStudents = res.data;
            const dbEmployeeNos = new Set(allStudents.map((s: any) => String(s.employeeNoString || s.id)));

            const { username, password } = hikvisionConfig;

            for (const ip of ips) {
                setSyncProgress({ current: 0, total: 100, message: `${ip}: Foydalanuvchilar tekshirilmoqda...` });
                let position = 0;
                let deviceEmployeeNos = new Set<string>();
                let hasMore = true;

                while (hasMore) {
                    try {
                        const searchRes = await proxyJsonWithData(ip, username, password, 'POST', '/ISAPI/AccessControl/UserInfo/Search?format=json', {
                            UserInfoSearchCond: {
                                searchID: "1",
                                maxResults: 1000,
                                searchResultPosition: position
                            }
                        });

                        const matches = searchRes?.UserInfoSearch?.UserInfo || [];
                        for (const u of matches) {
                            if (u.userType === 'normal') {
                                deviceEmployeeNos.add(u.employeeNo);
                            }
                        }

                        if (matches.length < 1000) {
                            hasMore = false;
                        } else {
                            position += 1000;
                        }
                    } catch (e) {
                        console.error('Failed to fetch users from device', ip, e);
                        hasMore = false;
                    }
                }

                const toDelete = Array.from(deviceEmployeeNos).filter(id => !dbEmployeeNos.has(id));
                const toAdd = allStudents.filter((s: any) => !deviceEmployeeNos.has(String(s.employeeNoString || s.id)));

                const totalOps = toDelete.length + toAdd.length;
                let currentOp = 0;

                if (totalOps === 0) {
                    continue; // Everything is synced for this device
                }

                // Delete extras
                if (toDelete.length > 0) {
                    for (let i = 0; i < toDelete.length; i += 50) {
                        const chunk = toDelete.slice(i, i + 50);
                        try {
                            await proxyJson(ip, username, password, 'PUT', '/ISAPI/AccessControl/UserInfo/Delete?format=json', {
                                UserInfoDelCond: { EmployeeNoList: chunk.map(id => ({ employeeNo: id })) }
                            });
                        } catch (e) {
                            console.error('Delete extra users failed on', ip, e);
                        }
                        currentOp += chunk.length;
                        setSyncProgress({ current: currentOp, total: totalOps, message: `${ip}: Ortiqcha o'quvchilar o'chirilmoqda...` });
                    }
                }

                // Add missing
                for (const student of toAdd) {
                    try {
                        // Pass specific IP somehow? syncStudentToDevices uses ALL ips by default.
                        // We shouldn't worry too much for now, syncStudentToDevices will resync on all.
                        // For pure efficiency we would extract the payload logic, but it's simpler to just call it.
                        await syncStudentToDevices(
                            student.employeeNoString || String(student.id),
                            student.name,
                            student.face_image || null,
                            false,
                            {
                                gender: student.gender,
                                user_verify_mode: student.user_verify_mode,
                                local_ui_right: student.local_ui_right,
                                door_right: student.door_right,
                                plan_template_no: student.plan_template_no,
                                valid_enabled: student.valid_enabled,
                                valid_begin: student.valid_begin,
                                valid_end: student.valid_end,
                            }
                        );
                    } catch (e) {
                        console.error('Add missing user failed', student.id, e);
                    }
                    currentOp++;
                    setSyncProgress({ current: currentOp, total: totalOps, message: `${ip}: O'quvchilar qo'shilmoqda (${student.name})...` });
                }
            }

            setSyncProgress(null);
            alert(t('students.sync_complete', "Barcha qurilmalar bilan sinxronizatsiya muvaffaqiyatli yakunlandi!"));

        } catch (error) {
            console.error(error);
            setSyncProgress(null);
            alert(t('students.sync_err_global', "Sinxronizatsiyada xatolik yuz berdi."));
        }
    };

    return {
        hikvisionConfig,
        setHikvisionConfig,
        isConfigOpen,
        setIsConfigOpen,
        statusText,
        saveConfig,
        syncStudentToDevices,
        deleteStudentFromDevices,
        syncAllStudents,
        syncProgress,
    };
}
