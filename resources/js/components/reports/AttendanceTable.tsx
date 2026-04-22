import { useState } from 'react';
import { Pagination } from '@/components/pagination';
import { useTranslation } from 'react-i18next';
import { Users, Eye, FileDown } from 'lucide-react';
import { ImageModal } from '@/components/students/ImageModal';
import { Link } from '@inertiajs/react';

interface AttendanceTableProps {
    attendances: any;
    filters?: any;
}

const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};
export function AttendanceTable({ attendances, filters }: AttendanceTableProps) {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const exportUrl = filters ? `/reports/export?${new URLSearchParams(
        Object.entries(filters).reduce((acc: any, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                acc[key] = String(value);
            }
            return acc;
        }, {})
    ).toString()}` : '/reports/export';

    return (
        <div className="relative min-h-[60vh] flex-1 flex flex-col rounded-xl border border-sidebar-border dark:border-sidebar-border bg-card shadow-sm">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium">{t('reports.date', 'Date')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('reports.student_name', 'Student Info')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('reports.class', 'Class')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('reports.first_in', 'First Check-in')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('reports.last_out', 'Last Check-out')}</th>
                            <th scope="col" className="px-6 py-4 font-medium">{t('reports.details', 'Status')}</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <span>{t('reports.actions', 'Actions')}</span>
                                    <a
                                        href={exportUrl}
                                        className="inline-flex items-center justify-center rounded-md w-8 h-8 text-muted-foreground hover:text-primary hover:bg-muted transition-colors border"
                                        title={t('reports.export_excel', 'Export to Excel')}
                                    >
                                        <FileDown className="h-4 w-4" />
                                    </a>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-card-foreground">
                        {attendances.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                    {t('reports.no_results', 'No attendance records found for selected filters.')}
                                </td>
                            </tr>
                        ) : (
                            attendances.data.map((item: any) => {
                                return (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-muted-foreground">{item.date?.split('T')[0]}</td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-10 w-10 flex-shrink-0 bg-muted flex items-center justify-center border overflow-hidden cursor-pointer"
                                                    onClick={(e) => {
                                                        if (item.student?.face_image) {
                                                            e.stopPropagation();
                                                            setSelectedImage(item.student.face_image);
                                                        }
                                                    }}
                                                    style={{ borderRadius: '50%' }}
                                                >
                                                    {item.student?.face_image ? (
                                                        <img src={item.student.face_image} alt="Student" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="font-medium">
                                                    {item.student?.name || t('reports.unknown', 'Unknown')}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-muted-foreground">{item.student?.school_class?.name || '-'}</td>
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex flex-col">
                                                <span>{formatTime(item.first_check_in)}</span>
                                                <span className="text-xs text-muted-foreground">({item.start_time ? item.start_time.slice(0, 5) : '-'})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex flex-col">
                                                <span>{formatTime(item.last_check_out)}</span>
                                                <span className="text-xs text-muted-foreground">({item.end_time ? item.end_time.slice(0, 5) : '-'})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            {item.is_absent_placeholder ? (
                                                <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 dark:text-red-500 ring-1 ring-inset ring-red-500/20">
                                                    {t('reports.absent', 'Kelmagan')}
                                                </span>
                                            ) : (
                                                <>
                                                    {item.is_late ? (
                                                        <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                                                            {t('reports.late', 'Late')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-500 ring-1 ring-inset ring-green-500/20">
                                                            {t('reports.on_time', 'On Time')}
                                                        </span>
                                                    )}
                                                    {item.is_left_early && item.last_check_out && (
                                                        <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                                                            {t('reports.left_early', 'Left Early')}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!item.is_absent_placeholder && (
                                                <Link
                                                    href={`/reports/${item.id}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    {t('reports.view', 'Ko\'rish')}
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t mt-auto shrink-0">
                <Pagination links={attendances.links} />
            </div>

            <ImageModal
                imageUrl={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div>
    );
}
