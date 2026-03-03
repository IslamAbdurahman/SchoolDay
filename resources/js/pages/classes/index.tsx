import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';

import { ClassForm } from '@/components/classes/ClassForm';
import { ClassFilters } from '@/components/classes/ClassFilters';
import { ClassesTable } from '@/components/classes/ClassesTable';

export default function ClassesPage({
    classes,
    shifts,
    filters,
}: {
    classes: any;
    shifts: any[];
    filters: any;
}) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('classes.title', 'Classes'), href: '/classes' }];

    const { data: filterData, setData: setFilterData } = useForm({
        shift_id: filters?.shift_id || '',
        search: filters?.search || '',
        per_page: filters?.per_page || '20',
    });

    const handleFilter = () => {
        router.get('/classes', filterData as any, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setFilterData({ shift_id: '', search: '', per_page: '20' });
        router.get('/classes', {}, { preserveState: true, replace: true });
    };

    const [editing, setEditing] = useState<any>(null);
    const { data: formData, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        name: '',
        shift_id: '',
        telegram_group_id: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.shift_id) {
            alert(t('classes.shift_required', 'Smenani tanlash majburiy!'));
            return;
        }
        if (editing) {
            put(`/classes/${editing.id}`, { onSuccess: () => { setEditing(null); reset(); } });
        } else {
            post('/classes', { onSuccess: () => reset() });
        }
    };

    const handleEdit = (schoolClass: any) => {
        setEditing(schoolClass);
        clearErrors();
        setData({
            name: schoolClass.name,
            shift_id: String(schoolClass.shift_id),
            telegram_group_id: schoolClass.telegram_group_id || ''
        });
    };

    const handleDelete = (id: number) => {
        if (confirm(t('classes.delete_confirm', 'Are you sure you want to delete this class?'))) {
            destroy(`/classes/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('classes.title', 'Classes')} />
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <ClassForm
                    editing={editing}
                    formData={formData}
                    errors={errors}
                    shifts={shifts}
                    setData={setData}
                    onSubmit={handleSubmit}
                    onCancel={() => { setEditing(null); reset(); clearErrors(); }}
                />
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <ClassFilters
                        filterData={filterData}
                        shifts={shifts}
                        setFilterData={setFilterData}
                        onFilter={handleFilter}
                        onClear={clearFilters}
                    />
                    <ClassesTable
                        classes={classes}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
