import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

import { usePage } from '@inertiajs/react';

export default function SystemSettings({ settings }: { settings: Record<string, string> }) {
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth: { user: any } };
    const isSuperadmin = auth?.user?.roles?.includes('Superadmin');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.system', 'System Settings'),
            href: '/settings/system',
        },
    ];

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        telegram_bot_token: settings.telegram_bot_token || '',
        branch_limit: settings.branch_limit || '1',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/settings/system', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.system_title', 'System Settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <section>
                        <header>
                            <h2 className="text-lg font-medium text-foreground">
                                {t('settings.system_title', 'System Configuration')}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('settings.system_desc', 'Update the global variables required for system integrations.')}
                            </p>
                        </header>

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            <div>
                                <Label htmlFor="telegram_bot_token">{t('settings.telegram_bot_token', 'Telegram Bot Token')}</Label>
                                <Input
                                    id="telegram_bot_token"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.telegram_bot_token}
                                    onChange={(e) => setData('telegram_bot_token', e.target.value)}
                                    autoComplete="off"
                                />
                                {errors.telegram_bot_token && (
                                    <p className="mt-2 text-sm text-destructive">{errors.telegram_bot_token}</p>
                                )}
                            </div>

                            {isSuperadmin && (
                                <div>
                                    <Label htmlFor="branch_limit">{t('settings.branch_limit', 'Branch Limit')}</Label>
                                    <Input
                                        id="branch_limit"
                                        type="number"
                                        min="1"
                                        className="mt-1 block w-full"
                                        value={data.branch_limit}
                                        onChange={(e) => setData('branch_limit', e.target.value)}
                                        autoComplete="off"
                                    />
                                    {errors.branch_limit && (
                                        <p className="mt-2 text-sm text-destructive">{errors.branch_limit}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>{t('settings.save_changes', 'Save Changes')}</Button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-muted-foreground">{t('settings.saved', 'Saved')}</p>
                                )}
                            </div>
                        </form>
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
