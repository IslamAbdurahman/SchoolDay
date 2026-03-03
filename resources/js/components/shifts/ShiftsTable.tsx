import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';
import { useTranslation } from 'react-i18next';

interface ShiftsTableProps {
    shifts: any;
    perPage: string;
    onPerPageChange: (val: string) => void;
    onEdit: (shift: any) => void;
    onDelete: (id: number) => void;
}

export function ShiftsTable({ shifts, perPage, onPerPageChange, onEdit, onDelete }: ShiftsTableProps) {
    const { t } = useTranslation();

    return (
        <div className="lg:col-span-2">
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
                                <th className="px-6 py-4 font-medium">{t('shifts.details', 'Shift Details')}</th>
                                <th className="px-6 py-4 font-medium">{t('shifts.branch', 'Branch')}</th>
                                <th className="px-6 py-4 font-medium">{t('shifts.capacity', 'Capacity')}</th>
                                <th className="px-6 py-4 font-medium">{t('shifts.today_attendance', "Today's Attendance")}</th>
                                <th className="px-6 py-4 font-medium text-right">{t('shifts.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-card-foreground">
                            {shifts.data.map((shift: any) => (
                                <tr key={shift.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-base">{shift.name}</span>
                                            <span className="text-xs text-muted-foreground mt-0.5">
                                                {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {shift.branch ? (
                                            <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 ring-1 ring-inset ring-zinc-500/20">
                                                {shift.branch.name}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <span className="flex items-center gap-1.5"><strong className="text-foreground">{shift.classes_count || 0}</strong> {t('shifts.classes', 'Classes')}</span>
                                            <span className="flex items-center gap-1.5"><strong className="text-foreground">{shift.total_students || 0}</strong> {t('shifts.students', 'Students')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                                                {t('classes.present_today', 'P')}: {shift.present_students || 0}
                                            </span>
                                            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/20">
                                                {t('classes.on_time', 'T')}: {shift.on_time_students || 0}
                                            </span>
                                            <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20">
                                                {t('classes.late', 'L')}: {shift.late_students || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => onEdit(shift)}>{t('shifts.edit', 'Edit')}</Button>
                                            <Button size="sm" variant="destructive" onClick={() => onDelete(shift.id)}>{t('shifts.delete', 'Delete')}</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {shifts.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        {t('shifts.no_results', 'No shifts found. Create one to get started.')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t">
                    <Pagination links={shifts.links} />
                </div>
            </div>
        </div>
    );
}
