import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PhoneInput } from '@/components/ui/phone-input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export default function UsersIndex({ users, roles }: { users: any[], roles: any[] }) {
    const { t } = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<any | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('sidebar.users', 'Users'), href: '/users' },
    ];

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'Admin',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user: any) => {
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '',
            role: user.roles?.[0]?.name || 'Admin',
        });
        setEditUser(user);
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setEditUser(null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editUser) {
            put(`/users/${editUser.id}`, {
                onSuccess: () => {
                    closeModals();
                    reset();
                },
            });
        } else {
            post('/users', {
                onSuccess: () => {
                    closeModals();
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
            destroy(`/users/${id}`, {
                onSuccess: () => {
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('sidebar.users', 'Users')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight">{t('sidebar.users', 'Users')}</h2>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('common.add', 'Add')}
                    </Button>
                </div>

                <div className="rounded-xl border border-sidebar-border bg-card shadow-sm overflow-hidden min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b">
                                <tr>
                                    <th className="px-6 py-4">{t('users.name', 'Name')}</th>
                                    <th className="px-6 py-4">{t('users.email', 'Email')}</th>
                                    <th className="px-6 py-4">{t('users.phone', 'Phone')}</th>
                                    <th className="px-6 py-4">{t('users.role', 'Role')}</th>
                                    <th className="px-6 py-4 text-right">{t('common.actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-card-foreground">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            {t('common.empty', 'No data available.')}
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium">{user.name}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">{user.phone || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/20">
                                                    {user.roles?.[0]?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                                    <button onClick={() => openEditModal(user)} className="p-2 hover:text-primary transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="p-2 hover:text-destructive transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Dialog open={isCreateModalOpen || !!editUser} onOpenChange={(open) => !open && closeModals()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editUser ? t('users.edit', 'Edit User') : t('users.create', 'Add New User')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('users.fill_info', 'Fill in the information below.')}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={submit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('users.name', 'Name')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('users.email', 'Email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('users.phone', 'Phone')}</Label>
                                <PhoneInput
                                    id="phone"
                                    value={data.phone}
                                    onChange={(val) => setData('phone', val || '')}
                                    placeholder="+998901234567"
                                />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">{t('users.password', 'Password')}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={editUser ? t('users.leave_blank', '(Leave blank to keep same)') : '••••••••'}
                                    required={!editUser}
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">{t('users.role', 'Role')}</Label>
                                <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('users.select_role', 'Rolni tanlang')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.id} value={r.name}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={closeModals}>
                                    {t('common.cancel', 'Cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {t('common.save', 'Save')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
