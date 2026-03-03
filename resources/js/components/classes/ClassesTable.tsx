import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { useTranslation } from 'react-i18next';

interface ClassesTableProps {
    classes: any;
    onEdit: (cls: any) => void;
    onDelete: (id: number) => void;
}

export function ClassesTable({ classes, onEdit, onDelete }: ClassesTableProps) {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden rounded-xl border border-sidebar-border dark:border-sidebar-border/70 bg-card shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b text-xs text-muted-foreground uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">{t('classes.details', 'Class Details')}</th>
                            <th className="px-6 py-4 font-medium">{t('classes.students', 'Students')}</th>
                            <th className="px-6 py-4 font-medium">{t('classes.today_attendance', "Today's Attendance")}</th>
                            <th className="px-6 py-4 font-medium text-right">{t('classes.actions', 'Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-card-foreground">
                        {classes.data.map((cls: any) => (
                            <tr key={cls.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-medium text-base">{cls.name}</span>
                                        <div className="flex gap-2 items-center">
                                            {cls.shift ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20">
                                                    {cls.shift.name}
                                                </span>
                                            ) : '-'}
                                            {cls.telegram_group_id && (
                                                <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20" title="Telegram Group">
                                                    {cls.telegram_group_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <strong className="text-foreground">{cls.total_students || 0}</strong>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20" title="Present Today">
                                            {t('classes.present_today', 'P')}: {cls.present_students || 0}
                                        </span>
                                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-500/20" title="On Time">
                                            {t('classes.on_time', 'T')}: {cls.on_time_students || 0}
                                        </span>
                                        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20" title="Late">
                                            {t('classes.late', 'L')}: {cls.late_students || 0}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => onEdit(cls)}>{t('classes.edit', 'Edit')}</Button>
                                        <Button size="sm" variant="destructive" onClick={() => onDelete(cls.id)}>{t('classes.delete', 'Delete')}</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {classes.data.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                    {t('classes.no_results', 'No classes found. Add one.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t">
                <Pagination links={classes.links} />
            </div>
        </div>
    );
}
