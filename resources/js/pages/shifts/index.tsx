import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';

import { ShiftForm } from '@/components/shifts/ShiftForm';
import { ShiftsTable } from '@/components/shifts/ShiftsTable';

export default function ShiftsPage({
    shifts,
    branches,
    filters,
}: {
    shifts: any;
    branches: any[];
    filters?: any;
}) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('shifts.title', 'Shifts'), href: '/shifts' }];

    const { data: filterData, setData: setFilterData } = useForm({
        per_page: filters?.per_page || '20',
    });

    const handleFilter = (val: string) => {
        setFilterData('per_page', val);
        router.get('/shifts', { per_page: val }, { preserveState: true, replace: true });
    };

    const [editing, setEditing] = useState<any>(null);
    const { data: formData, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        name: '',
        start_time: '',
        end_time: '',
        branch_id: '',
    });

    const handleTimeChange = (field: 'start_time' | 'end_time', val: string) => {
        if (val.length < formData[field].length) {
            setData(field, val);
            return;
        }
        let v = val.replace(/\D/g, '');
        if (v.length > 4) v = v.substring(0, 4);
        let hrs = v.substring(0, 2);
        let mins = v.substring(2, 4);
        if (hrs.length === 2 && parseInt(hrs) > 23) hrs = '23';
        if (mins.length === 2 && parseInt(mins) > 59) mins = '59';
        let formatted = hrs;
        if (v.length > 2) formatted += ':' + mins;
        setData(field, formatted);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.branch_id) {
            alert(t('shifts.branch_required', 'Filialni tanlash majburiy!'));
            return;
        }
        if (editing) {
            put(`/shifts/${editing.id}`, { onSuccess: () => { setEditing(null); reset(); } });
        } else {
            post('/shifts', { onSuccess: () => reset() });
        }
    };

    const handleEdit = (shift: any) => {
        setEditing(shift);
        clearErrors();
        setData({
            name: shift.name,
            start_time: shift.start_time ? shift.start_time.substring(0, 5) : '',
            end_time: shift.end_time ? shift.end_time.substring(0, 5) : '',
            branch_id: shift.branch_id ? String(shift.branch_id) : '',
        });
    };

    const handleDelete = (id: number) => {
        if (confirm(t('shifts.delete_confirm', 'Are you sure you want to delete this shift?'))) {
            destroy(`/shifts/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('shifts.title', 'Shifts Management')} />
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <ShiftForm
                    editing={editing}
                    formData={formData}
                    errors={errors}
                    branches={branches}
                    setData={setData}
                    onTimeChange={handleTimeChange}
                    onSubmit={handleSubmit}
                    onCancel={() => { setEditing(null); reset(); clearErrors(); }}
                />
                <ShiftsTable
                    shifts={shifts}
                    perPage={filterData.per_page}
                    onPerPageChange={handleFilter}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </AppLayout>
    );
}
