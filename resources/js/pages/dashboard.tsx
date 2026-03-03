import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { useTranslation } from 'react-i18next';

import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { RecentEventsTable } from '@/components/dashboard/RecentEventsTable';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

interface StatData {
    total_students: number;
    present_today: number;
    late_arrivals: number;
    on_time_today: number;
    absent_today: number;
}

interface EventData {
    id: number;
    employeeNoString: string | null;
    start_time: string | null;
    created_at: string;
    majorEventType: number;
    subEventType: number;
    student?: {
        name: string;
        school_class?: { name: string };
    };
}

export default function Dashboard() {
    const { props } = usePage();
    const { t } = useTranslation();

    const stats = (props.stats as StatData) || { total_students: 0, present_today: 0, late_arrivals: 0, on_time_today: 0, absent_today: 0 };
    const recentEvents = (props.recent_events as EventData[]) || [];
    const monthlyStats = (props.monthly_stats as any[]) || [];

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('dashboard.title', 'Dashboard'), href: dashboard().url }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title', 'Dashboard')} />
            <div className="flex flex-1 flex-col gap-6 p-6 overflow-x-auto">
                <StatsGrid stats={stats} />

                <DashboardCharts stats={stats} monthlyStats={monthlyStats} />

                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">
                        {t('dashboard.recent_events', 'Recent Access Events (Live Feed)')}
                    </h2>
                </div>

                <RecentEventsTable events={recentEvents} />
            </div>
        </AppLayout>
    );
}
