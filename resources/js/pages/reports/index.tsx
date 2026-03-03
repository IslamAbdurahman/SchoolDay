import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ReportFilters } from '@/components/reports/ReportFilters';
import { AttendanceTable } from '@/components/reports/AttendanceTable';

export default function ReportsPage({
    attendances,
    branches,
    shifts,
    classes,
    students,
    filters,
}: {
    attendances: any;
    branches: any[];
    shifts: any[];
    classes: any[];
    students: any[];
    filters: any;
}) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('reports.title', 'Daily Attendance Report'), href: '/reports' },
    ];

    const { data: filterData, setData } = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        branch_id: filters.branch_id || '',
        shift_id: filters.shift_id || '',
        class_id: filters.class_id || '',
        student_id: filters.student_id || '',
        status: filters.status || 'all',
        per_page: filters.per_page || '20',
    });

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/reports', filterData as any, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('reports.title', 'Daily Attendance Report')} />
            <div className="flex flex-1 flex-col gap-4 p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {t('reports.title', 'Daily Attendance Report')}
                    </h2>
                </div>
                <ReportFilters
                    filterData={filterData}
                    branches={branches}
                    shifts={shifts}
                    classes={classes}
                    students={students}
                    setData={setData}
                    onSubmit={handleFilter}
                />
                <AttendanceTable attendances={attendances} />
            </div>
        </AppLayout>
    );
}
