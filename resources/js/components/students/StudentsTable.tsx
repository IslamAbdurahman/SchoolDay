import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';

interface StudentsTableProps {
    students: any;
    onEdit: (student: any) => void;
    onDelete: (student: any) => void;
    onImageClick: (url: string) => void;
    onImportClick?: () => void;
}

export function StudentsTable({ students, onEdit, onDelete, onImageClick, onImportClick }: StudentsTableProps) {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden rounded-xl border border-sidebar-border dark:border-sidebar-border/70 bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between gap-4">
                <h3 className="font-semibold flex-1">{t('students.list', 'O\'quvchilar ro\'yxati')}</h3>
                {onImportClick && (
                    <Button onClick={onImportClick} size="sm" variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('students.import_excel', 'Excel orqali yuklash')}</span>
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b text-xs text-muted-foreground uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">
                                {t('students.name', 'Name')} &amp; {t('students.status', 'Status')}
                            </th>
                            <th className="px-6 py-4 font-medium">{t('students.class', 'Class')}</th>
                            <th className="px-6 py-4 font-medium">{t('students.hikvision_id', 'Hikvision ID')}</th>
                            <th className="px-6 py-4 font-medium">{t('students.telegram_id', 'Telegram ID')}</th>
                            <th className="px-6 py-4 font-medium text-right">{t('students.edit', 'Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-card-foreground">
                        {students.data.map((student: any) => (
                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                {/* Name + Status */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {student.face_image ? (
                                            <img
                                                src={student.face_image}
                                                className="w-10 h-10 rounded-full object-cover border bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                                                alt=""
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    onImageClick(student.face_image);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border text-xs text-muted-foreground">
                                                N/A
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-medium text-base">{student.name}</span>
                                            <span className="text-xs text-muted-foreground">{student.phone}</span>
                                        </div>
                                        {student.status === 'active' ? (
                                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                                                {t('students.active', 'Active')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
                                                {t('students.inactive', 'Inactive')}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Class */}
                                <td className="px-6 py-4">
                                    {student.school_class ? (
                                        <span className="font-medium text-secondary-foreground">
                                            {student.school_class.name}
                                        </span>
                                    ) : (
                                        '-'
                                    )}
                                </td>

                                {/* Hikvision ID */}
                                <td className="px-6 py-4">{student.employeeNoString || '-'}</td>

                                {/* Telegram ID */}
                                <td className="px-6 py-4">{student.telegram_id || '-'}</td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                    <Button size="sm" variant="secondary" onClick={() => onEdit(student)}>
                                        {t('students.edit', 'Edit')}
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onDelete(student)}>
                                        {t('students.delete', 'Delete')}
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {students.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                    {t('students.no_results', 'No students found. Start by adding a student.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t">
                <Pagination links={students.links} />
            </div>
        </div>
    );
}
