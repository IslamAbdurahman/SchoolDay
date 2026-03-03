import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ShiftFormProps {
    editing: any;
    formData: { name: string; start_time: string; end_time: string; branch_id: string };
    errors: Record<string, string>;
    branches: any[];
    setData: (key: string, value: any) => void;
    onTimeChange: (field: 'start_time' | 'end_time', val: string) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
}

export function ShiftForm({ editing, formData, errors, branches, setData, onTimeChange, onSubmit, onCancel }: ShiftFormProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-card p-6 rounded-xl border border-sidebar-border dark:border-sidebar-border/70 shadow-sm top-6 sticky">
            <h3 className="text-xl font-semibold mb-4 tracking-tight">
                {editing ? t('shifts.edit', 'Edit Shift') : t('shifts.add_new', 'Add New Shift')}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">{t('shifts.name', 'Shift Name')}</Label>
                    <Input
                        id="name"
                        placeholder={t('shifts.placeholder_name', 'e.g. Morning Shift')}
                        value={formData.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="branch_id">{t('shifts.branch', 'Branch')} <span className="text-destructive">*</span></Label>
                    <Combobox
                        value={formData.branch_id}
                        onChange={val => setData('branch_id', val)}
                        placeholder={t('shifts.select_branch', 'Select a branch')}
                        searchPlaceholder={t('common.search', 'Qidirish...')}
                        emptyText={t('common.not_found', 'Topilmadi')}
                        options={
                            branches.map(branch => ({ value: String(branch.id), label: branch.name }))
                        }
                    />
                    {errors.branch_id && <p className="text-xs text-destructive mt-1">{errors.branch_id}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_time">{t('shifts.start', 'Start Time')}</Label>
                        <Input
                            id="start_time"
                            type="text"
                            placeholder="HH:MM"
                            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                            maxLength={5}
                            value={formData.start_time}
                            onChange={e => onTimeChange('start_time', e.target.value)}
                            required
                        />
                        {errors.start_time && <p className="text-xs text-destructive mt-1">{errors.start_time}</p>}
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                            {t('shifts.format_hint_start', '24h format e.g. 08:30')}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_time">{t('shifts.end', 'End Time')}</Label>
                        <Input
                            id="end_time"
                            type="text"
                            placeholder="HH:MM"
                            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                            maxLength={5}
                            value={formData.end_time}
                            onChange={e => onTimeChange('end_time', e.target.value)}
                            required
                        />
                        {errors.end_time && <p className="text-xs text-destructive mt-1">{errors.end_time}</p>}
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                            {t('shifts.format_hint_end', '24h format e.g. 17:00')}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">
                        {editing ? t('shifts.update', 'Update Shift') : t('shifts.save', 'Save Shift')}
                    </Button>
                    {editing && (
                        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                            {t('shifts.cancel', 'Cancel')}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
