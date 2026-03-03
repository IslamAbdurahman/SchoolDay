import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ClassFormProps {
    editing: any;
    formData: { name: string; shift_id: string; telegram_group_id?: string };
    errors: Record<string, string>;
    shifts: any[];
    setData: (key: string, value: any) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
}

export function ClassForm({ editing, formData, errors, shifts, setData, onSubmit, onCancel }: ClassFormProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-card p-6 rounded-xl border border-sidebar-border dark:border-sidebar-border/70 shadow-sm sticky top-6">
            <h3 className="text-xl font-semibold mb-4 tracking-tight">
                {editing ? t('classes.edit', 'Edit') : t('classes.add_new', 'Add New Class')}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('classes.name', 'Class Name')}</Label>
                    <Input
                        id="name"
                        placeholder={t('classes.placeholder_name', 'e.g. 10-A')}
                        value={formData.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shift_id">{t('classes.shift', 'Shift')} <span className="text-destructive">*</span></Label>
                    <Combobox
                        value={formData.shift_id}
                        onChange={val => setData('shift_id', val)}
                        placeholder={t('classes.select_shift', 'Select a shift')}
                        searchPlaceholder={t('classes.search', 'Qidirish...')}
                        emptyText={t('classes.not_found', 'Topilmadi')}
                        options={
                            shifts.map(shift => ({
                                value: String(shift.id),
                                label: `${shift.name} (${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)})${shift.branch ? ` - ${shift.branch.name}` : ''}`,
                            }))
                        }
                    />
                    {errors.shift_id && <p className="text-xs text-destructive mt-1">{errors.shift_id}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="telegram_group_id">{t('classes.telegram_group_id', 'Telegram guruh ID')} <span className="text-muted-foreground text-xs">(ixtiyoriy)</span></Label>
                    <Input
                        id="telegram_group_id"
                        placeholder={t('classes.placeholder_telegram_group_id', 'Masalan: -1001234567890')}
                        value={formData.telegram_group_id || ''}
                        onChange={e => setData('telegram_group_id', e.target.value)}
                    />
                    {errors.telegram_group_id && <p className="text-xs text-destructive mt-1">{errors.telegram_group_id}</p>}
                </div>
                <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">
                        {editing ? t('classes.update', 'Update Class') : t('classes.save', 'Save Class')}
                    </Button>
                    {editing && (
                        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                            {t('classes.cancel', 'Cancel')}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
