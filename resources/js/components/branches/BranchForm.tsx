import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';

interface BranchFormProps {
    editing: any;
    formData: { name: string; description: string; mac_addresses: string[] };
    errors: Record<string, string>;
    setData: (key: string, value: any) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
}

export function BranchForm({ editing, formData, errors, setData, onSubmit, onCancel }: BranchFormProps) {
    const { t } = useTranslation();

    const addMac = () => {
        setData('mac_addresses', [...formData.mac_addresses, '']);
    };

    const removeMac = (index: number) => {
        setData('mac_addresses', formData.mac_addresses.filter((_, i) => i !== index));
    };

    const updateMac = (index: number, value: string) => {
        const updated = [...formData.mac_addresses];
        updated[index] = value;
        setData('mac_addresses', updated);
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-sidebar-border dark:border-sidebar-border shadow-sm sticky top-6">
            <h3 className="text-xl font-semibold tracking-tight mb-4">
                {editing ? t('branches.edit', 'Edit Branch') : t('branches.add_new', 'Add New Branch')}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name">{t('branches.name', 'Branch Name')}</Label>
                    <Input
                        id="name"
                        placeholder={t('branches.placeholder_name', 'e.g. Main Branch')}
                        value={formData.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">{t('branches.description', 'Description')}</Label>
                    <Input
                        id="description"
                        placeholder={t('branches.placeholder_description', 'Optional')}
                        value={formData.description}
                        onChange={e => setData('description', e.target.value)}
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>

                {/* MAC Addresses */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>{t('branches.mac_addresses', 'MAC Addresses')}</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addMac} className="h-7 gap-1 text-xs">
                            <Plus className="h-3.5 w-3.5" />
                            {t('branches.add_mac', 'Add')}
                        </Button>
                    </div>
                    {formData.mac_addresses.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                            {t('branches.mac_hint', 'No MAC addresses. All devices will be accepted.')}
                        </p>
                    )}
                    <div className="space-y-2">
                        {formData.mac_addresses.map((mac, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    placeholder="AA:BB:CC:DD:EE:FF"
                                    value={mac}
                                    onChange={e => updateMac(index, e.target.value)}
                                    className="font-mono text-sm"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => removeMac(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 pt-2 items-center">
                    <Button type="submit" className="flex-1">
                        {editing ? t('branches.edit', 'Update Branch') : t('branches.save', 'Save Branch')}
                    </Button>
                    {editing && (
                        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                            {t('branches.cancel', 'Cancel')}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
