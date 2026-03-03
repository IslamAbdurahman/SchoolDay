import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { PhoneInput } from '@/components/ui/phone-input';
import { FormEvent, useState, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

interface StudentFormProps {
    editing: any;
    formData: {
        name: string;
        phone: string;
        telegram_id: string;
        class_id: string;
        status: string;
        face_image: File | null;
        gender: string;
        user_verify_mode: string;
        local_ui_right: boolean;
        door_right: string;
        plan_template_no: string;
        valid_enabled: boolean;
        valid_begin: string;
        valid_end: string;
    };
    errors: Record<string, string>;
    formImagePreview: string | null;
    classes: any[];
    setData: (key: string, value: any) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
    onImageChange: (file: File | null) => void;
    fileInputRef?: RefObject<HTMLInputElement | null>;
}

export function StudentForm({
    editing,
    formData,
    errors,
    formImagePreview,
    classes,
    setData,
    onSubmit,
    onCancel,
    onImageChange,
    fileInputRef,
}: StudentFormProps) {
    const { t } = useTranslation();
    const [showDeviceSettings, setShowDeviceSettings] = useState(false);

    return (
        <div className="bg-card p-6 rounded-xl border border-sidebar-border dark:border-sidebar-border shadow-sm sticky top-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold tracking-tight">
                    {editing ? t('students.edit', 'Edit Student') : t('students.add_new', 'Add New Student')}
                </h3>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('students.name', 'Full Name')}</Label>
                    <Input
                        id="name"
                        placeholder={t('students.placeholder_name', 'John Doe')}
                        value={formData.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="status">{t('students.status', 'Status')}</Label>
                        <Select value={formData.status} onValueChange={val => setData('status', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('students.set_status', 'Set status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">{t('students.active', 'Active')}</SelectItem>
                                <SelectItem value="inactive">{t('students.inactive', 'Inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">{t('students.gender', 'Jins')}</Label>
                        <Select value={formData.gender} onValueChange={val => setData('gender', val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">{t('students.male', 'Erkak')}</SelectItem>
                                <SelectItem value="female">{t('students.female', 'Ayol')}</SelectItem>
                                <SelectItem value="unknown">{t('students.unknown_gender', 'Noma\'lum')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="class_id">{t('students.class', 'Class')} <span className="text-destructive">*</span></Label>
                    <Combobox
                        value={formData.class_id}
                        onChange={val => setData('class_id', val)}
                        placeholder={t('students.assign_class', 'Sinfni tanlang...')}
                        searchPlaceholder={t('common.search', 'Qidirish...')}
                        emptyText={t('common.not_found', 'Topilmadi')}
                        options={classes.map(cls => ({
                            value: String(cls.id),
                            label: `${cls.name}${cls.shift ? ` (${cls.shift.name}${cls.shift.branch ? ` - ${cls.shift.branch.name}` : ''})` : ''}`
                        }))}
                    />
                    {errors.class_id && <p className="text-xs text-destructive">{errors.class_id}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telegram_id">{t('students.telegram_id', 'Telegram Chat ID')}</Label>
                    <Input
                        id="telegram_id"
                        placeholder={t('students.placeholder_telegram', '12345678')}
                        value={formData.telegram_id}
                        onChange={e => setData('telegram_id', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">{t('students.phone', 'Phone Number')}</Label>
                    <PhoneInput
                        id="phone"
                        placeholder={t('students.placeholder_phone', '+99890XXXXXXX')}
                        value={formData.phone}
                        onChange={val => setData('phone', val || '')}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="face_image">{t('students.face_image', 'Yuz rasmi')}</Label>
                    <Input
                        id="face_image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={e => {
                            const file = e.target.files ? e.target.files[0] : null;
                            onImageChange(file ?? null);
                        }}
                    />
                    {errors.face_image && <p className="text-xs text-destructive">{errors.face_image}</p>}
                    {formImagePreview && (
                        <img
                            src={formImagePreview}
                            alt="Face Preview"
                            className="mt-2 h-20 w-20 object-cover rounded-md border"
                        />
                    )}
                </div>

                {/* ── Hikvision Device Settings (collapsible) ──────────────── */}
                <div className="border border-sidebar-border rounded-lg">
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                    >
                        <span>⚙️ {t('students.device_settings', 'Qurilma sozlamalari')}</span>
                        <span className="text-xs">{showDeviceSettings ? '▲' : '▼'}</span>
                    </button>

                    {showDeviceSettings && (
                        <div className="px-3 pb-3 space-y-3 border-t border-sidebar-border pt-3">
                            <div className="space-y-2">
                                <Label>{t('students.verify_mode', 'Tekshirish usuli')}</Label>
                                <Select value={formData.user_verify_mode} onValueChange={val => setData('user_verify_mode', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="face">{t('students.verify_face', 'Yuz')}</SelectItem>
                                        <SelectItem value="card">{t('students.verify_card', 'Karta')}</SelectItem>
                                        <SelectItem value="faceAndCard">{t('students.verify_face_and_card', 'Yuz + Karta')}</SelectItem>
                                        <SelectItem value="cardAndPw">{t('students.verify_card_and_pw', 'Karta + Parol')}</SelectItem>
                                        <SelectItem value="faceAndPw">{t('students.verify_face_and_pw', 'Yuz + Parol')}</SelectItem>
                                        <SelectItem value="cardOrFace">{t('students.verify_card_or_face', 'Karta yoki Yuz')}</SelectItem>
                                        <SelectItem value="cardOrfaceOrPw">{t('students.verify_card_or_face_or_pw', 'Karta / Yuz / Parol')}</SelectItem>
                                        <SelectItem value="faceOrPw">{t('students.verify_face_or_pw', 'Yuz yoki Parol')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="local_ui_right" className="cursor-pointer">
                                    {t('students.attendance_only', 'Faqat davomat (eshik ochilmaydi)')}
                                </Label>
                                <input
                                    id="local_ui_right"
                                    type="checkbox"
                                    checked={!formData.local_ui_right}
                                    onChange={e => setData('local_ui_right', !e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>{t('students.door_right', 'Eshik raqami')}</Label>
                                    <Input
                                        value={formData.door_right}
                                        onChange={e => setData('door_right', e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('students.plan_template', 'Rejim shabloni')}</Label>
                                    <Input
                                        value={formData.plan_template_no}
                                        onChange={e => setData('plan_template_no', e.target.value)}
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="valid_enabled" className="cursor-pointer">
                                    {t('students.set_validity', 'Muddatli ruxsat')}
                                </Label>
                                <input
                                    id="valid_enabled"
                                    type="checkbox"
                                    checked={formData.valid_enabled}
                                    onChange={e => setData('valid_enabled', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                            </div>

                            {formData.valid_enabled && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>{t('students.valid_begin', 'Boshlanishi')}</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.valid_begin}
                                            onChange={e => setData('valid_begin', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('students.valid_end', 'Tugashi')}</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.valid_end}
                                            onChange={e => setData('valid_end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-2 items-center">
                    <Button type="submit" className="flex-1">
                        {editing ? t('students.edit', 'Update Student') : t('students.save', 'Save Student')}
                    </Button>
                    {editing && (
                        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                            {t('students.cancel', 'Cancel')}
                        </Button>
                    )}
                </div>
            </form>
        </div >
    );
}

