import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Users, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageModal } from '@/components/students/ImageModal';

const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getImageUrl = (evt: any) => {
    if (evt.picture) {
        if (evt.picture.startsWith('http') || evt.picture.startsWith('/')) return evt.picture;
        return '/storage/' + evt.picture;
    }
    return null;
};

export default function ReportDetailsPage({ attendance }: { attendance: any }) {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('reports.title', 'Daily Attendance Report'), href: '/reports' },
        { title: t('reports.details', 'Details'), href: `/reports/${attendance.id}` },
    ];

    const handleDelete = () => {
        if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this attendance record?'))) {
            router.delete(`/reports/${attendance.id}`);
        }
    };

    const handleDeleteEvent = (eventId: number) => {
        if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this access event?'))) {
            router.delete(`/report-events/${eventId}`, {
                preserveScroll: true,
            });
        }
    };

    const student = attendance.student || {};
    const events = attendance.events || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('reports.details', 'Attendance Details')} />
            <div className="flex flex-1 flex-col gap-6 p-6">

                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <Link href="/reports" className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {student.name || t('reports.unknown_student', 'Unknown Student')}
                            </h2>
                            <div className="text-muted-foreground text-sm flex gap-4 mt-1">
                                <span>{t('reports.date', 'Date')}: <strong>{attendance.date?.split('T')[0]}</strong></span>
                                <span>{t('reports.class', 'Class')}: <strong>{student.school_class?.name || '-'}</strong></span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        {t('common.delete', 'O\'chirish')}
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-4 rounded-xl border border-sidebar-border bg-card shadow-sm space-y-4">
                        <h3 className="font-semibold">{t('reports.summary', 'Summary')}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t('reports.first_in', 'First Check-in')}</span>
                                <span className="font-medium text-base">{formatTime(attendance.first_check_in)}</span>
                                <span className="text-xs text-muted-foreground">({attendance.start_time ? attendance.start_time.slice(0, 5) : '-'})</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t('reports.last_out', 'Last Check-out')}</span>
                                <span className="font-medium text-base">{formatTime(attendance.last_check_out)}</span>
                                <span className="text-xs text-muted-foreground">({attendance.end_time ? attendance.end_time.slice(0, 5) : '-'})</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t('reports.is_late', 'Late Arrival?')}</span>
                                <div>
                                    {attendance.is_late ? (
                                        <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                                            {t('reports.yes', 'Yes')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-500/20">
                                            {t('reports.no', 'No')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">{t('reports.is_left_early', 'Left Early?')}</span>
                                <div>
                                    {attendance.is_left_early && attendance.last_check_out ? (
                                        <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 ring-1 ring-inset ring-yellow-500/20">
                                            {t('reports.yes', 'Yes')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 ring-1 ring-inset ring-green-500/20">
                                            {t('reports.no', 'No')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-sidebar-border bg-card shadow-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm text-muted-foreground text-center">{t('reports.profile_photo', 'Profile Photo')}</span>
                            <div
                                className="h-32 w-32 rounded-full border-4 overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => student?.face_image && setSelectedImage(student.face_image)}
                            >
                                {student?.face_image ? (
                                    <img src={student.face_image} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="h-10 w-10 text-muted-foreground/50" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-sidebar-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/20">
                        <h3 className="font-semibold">{t('reports.events_log', 'Device Access Events (Live Feed Timeline)')}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b">
                                <tr>
                                    <th className="px-6 py-4">{t('reports.time', 'Time')}</th>
                                    <th className="px-6 py-4">{t('reports.device', 'Device')}</th>
                                    <th className="px-6 py-4">{t('reports.verify_mode', 'Method')}</th>
                                    <th className="px-6 py-4">{t('reports.photo', 'Photo')}</th>
                                    <th className="px-6 py-4 text-right">{t('common.actions', 'Harakatlar')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-card-foreground">
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            {t('reports.no_events', 'No access events recorded.')}
                                        </td>
                                    </tr>
                                ) : (
                                    events.map((evt: any) => {
                                        const imgUrl = getImageUrl(evt);
                                        return (
                                            <tr key={evt.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{formatTime(evt.access?.dateTime || evt.start_time || evt.created_at)}</span>
                                                        <span className="font-normal text-xs text-muted-foreground whitespace-nowrap">
                                                            {t('reports.recorded', 'Rec:')} {formatTime(evt.created_at)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span>{evt.deviceName || t('reports.unknown', 'Unknown')}</span>
                                                        <span className="text-xs text-muted-foreground">{evt.access?.macAddress || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 capitalize">{evt.currentVerifyMode || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {imgUrl ? (
                                                        <img
                                                            src={imgUrl}
                                                            alt="Event Capture"
                                                            className="h-12 w-12 rounded-lg border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => setSelectedImage(imgUrl)}
                                                        />
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center p-2 rounded-full bg-muted text-xs text-muted-foreground">{t('reports.no_photo', 'No Photo')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteEvent(evt.id)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ImageModal
                    imageUrl={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            </div>
        </AppLayout>
    );
}
