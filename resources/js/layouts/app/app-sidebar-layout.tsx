import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { AppLayoutProps } from '@/types';

import { useTranslation } from 'react-i18next';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { t } = useTranslation();
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(t(flash.success));
        }
        if (flash?.error) {
            toast.error(t(flash.error));
        }
    }, [flash, t]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <Toaster richColors position="bottom-right" />
        </AppShell>
    );
}
