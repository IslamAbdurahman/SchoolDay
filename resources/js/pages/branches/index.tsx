import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';

import { BranchForm } from '@/components/branches/BranchForm';
import { BranchesTable } from '@/components/branches/BranchesTable';

export default function BranchesPage({ branches, filters }: { branches: any; filters?: any }) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('branches.title', 'Branches'), href: '/branches' }];

    const { data: filterData, setData: setFilterData } = useForm({
        per_page: filters?.per_page || '20',
    });

    const handleFilter = (val: string) => {
        setFilterData('per_page', val);
        router.get('/branches', { per_page: val }, { preserveState: true, replace: true });
    };

    const [editing, setEditing] = useState<any>(null);
    const { data: formData, setData, post, put, delete: destroy, reset, errors, clearErrors } = useForm({
        name: '',
        description: '',
        mac_addresses: [] as string[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editing) {
            put(`/branches/${editing.id}`, {
                onSuccess: () => { setEditing(null); reset(); },
            });
        } else {
            post('/branches', { onSuccess: () => reset() });
        }
    };

    const handleEdit = (branch: any) => {
        setEditing(branch);
        clearErrors();
        setData({
            name: branch.name,
            description: branch.description || '',
            mac_addresses: branch.mac_address_list || [],
        });
    };

    const handleDelete = (id: number) => {
        if (confirm(t('branches.delete_confirm', 'Are you sure you want to delete this branch?'))) {
            destroy(`/branches/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('branches.title', 'Branches')} />
            <div className="p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                <BranchForm
                    editing={editing}
                    formData={formData}
                    errors={errors}
                    setData={setData}
                    onSubmit={handleSubmit}
                    onCancel={() => { setEditing(null); reset(); clearErrors(); }}
                />
                <BranchesTable
                    branches={branches}
                    perPage={filterData.per_page}
                    onPerPageChange={handleFilter}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </AppLayout>
    );
}
