import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, AlertCircle, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatData {
    total_students: number;
    present_today: number;
    late_arrivals: number;
    absent_today: number;
}

interface StatsGridProps {
    stats: StatData;
}

export function StatsGrid({ stats }: StatsGridProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.total_students', 'Total Students')}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_students}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.present_today', 'Present Today')}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{stats.present_today}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.late_today', 'Late Arrivals')}
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">{stats.late_arrivals}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.absent_today', 'Absent')}
                    </CardTitle>
                    <UserX className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{stats.absent_today}</div>
                </CardContent>
            </Card>
        </div>
    );
}
