import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';
import { useTranslation } from 'react-i18next';

interface BranchesTableProps {
    branches: any;
    perPage: string;
    onPerPageChange: (val: string) => void;
    onEdit: (branch: any) => void;
    onDelete: (id: number) => void;
}

export function BranchesTable({ branches, perPage, onPerPageChange, onEdit, onDelete }: BranchesTableProps) {
    const { t } = useTranslation();

    return (
        <div className="xl:col-span-3">
            <div className="flex justify-end mb-4">
                <Select value={perPage} onValueChange={onPerPageChange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="20">20 {t('common.items', 'ta')}</SelectItem>
                        <SelectItem value="50">50 {t('common.items', 'ta')}</SelectItem>
                        <SelectItem value="100">100 {t('common.items', 'ta')}</SelectItem>
                        <SelectItem value="all">{t('common.all', 'Barchasi')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-sidebar-border dark:border-sidebar-border/70 bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">{t('branches.details', 'Branch Details')}</th>
                                <th className="px-6 py-4 font-medium">{t('branches.mac_addresses', 'MAC Addresses')}</th>
                                <th className="px-6 py-4 font-medium">{t('branches.capacity', 'Capacity')}</th>
                                <th className="px-6 py-4 font-medium">{t('branches.today_attendance', "Today's Attendance")}</th>
                                <th className="px-6 py-4 font-medium text-right">{t('branches.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-card-foreground">
                            {branches.data.map((branch: any) => (
                                <tr key={branch.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-base">{branch.name}</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">{branch.description || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(branch.mac_address_list && branch.mac_address_list.length > 0) ? (
                                            <div className="flex flex-col gap-1">
                                                {branch.mac_address_list.map((mac: string) => (
                                                    <span key={mac} className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{mac}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <span className="flex items-center gap-1.5"><strong className="text-foreground">{branch.shifts_count || 0}</strong> {t('branches.shifts_count', 'Shifts')}</span>
                                            <span className="flex items-center gap-1.5"><strong className="text-foreground">{branch.classes_count || 0}</strong> {t('shifts.classes', 'Classes')}</span>
                                            <span className="flex items-center gap-1.5"><strong className="text-foreground">{branch.total_students || 0}</strong> {t('shifts.students', 'Students')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                                                {t('classes.present_today', 'P')}: {branch.present_students || 0}
                                            </span>
                                            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/20">
                                                {t('classes.on_time', 'T')}: {branch.on_time_students || 0}
                                            </span>
                                            <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20">
                                                {t('classes.late', 'L')}: {branch.late_students || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                        <Button size="sm" variant="secondary" onClick={() => onEdit(branch)}>{t('branches.edit', 'Edit')}</Button>
                                        <Button size="sm" variant="destructive" onClick={() => onDelete(branch.id)}>{t('branches.delete', 'Delete')}</Button>
                                    </td>
                                </tr>
                            ))}
                            {branches.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        {t('branches.no_results', 'No branches found. Create one to get started.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t">
                    <Pagination links={branches.links} />
                </div>
            </div>
        </div>
    );
}
