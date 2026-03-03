import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HikvisionConfigProps {
    config: { ipAddresses: string; username: string; password: string };
    onChange: (config: { ipAddresses: string; username: string; password: string }) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: () => void;
}

export function HikvisionConfig({ config, onChange, isOpen, onOpenChange, onSave }: HikvisionConfigProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title={t('students.config_settings', 'Hikvision Device Settings')}>
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('students.config_title', 'Hikvision Device Config')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('students.ip_addresses', 'IP Addresses (comma separated)')}</Label>
                        <Input
                            value={config.ipAddresses}
                            onChange={e => onChange({ ...config, ipAddresses: e.target.value })}
                            placeholder={t('students.placeholder_ips', '192.168.1.100, 192.168.1.101')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('students.username', 'Username')}</Label>
                        <Input
                            value={config.username}
                            onChange={e => onChange({ ...config, username: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('students.password', 'Password')}</Label>
                        <Input
                            type="password"
                            value={config.password}
                            onChange={e => onChange({ ...config, password: e.target.value })}
                        />
                    </div>
                    <Button onClick={onSave} className="w-full">
                        {t('students.save_settings', 'Save Settings')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
