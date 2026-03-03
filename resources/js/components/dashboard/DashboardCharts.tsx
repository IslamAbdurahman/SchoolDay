import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardChartsProps {
    stats: {
        present_today: number;
        absent_today: number;
        late_arrivals: number;
        on_time_today: number;
    };
    monthlyStats: any[];
}

export function DashboardCharts({ stats, monthlyStats }: DashboardChartsProps) {
    const { t } = useTranslation();

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
            }
        },
    };

    const attendanceData = {
        labels: [t('reports.status_present', 'Kelganlar'), t('reports.status_absent', 'Kelmaganlar')],
        datasets: [
            {
                data: [stats.present_today, stats.absent_today],
                backgroundColor: ['#10b981', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const latenessData = {
        labels: [t('reports.on_time', 'Vaqtida'), t('reports.late', 'Kechikkan')],
        datasets: [
            {
                data: [stats.on_time_today, stats.late_arrivals],
                backgroundColor: ['#3b82f6', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
        },
    };

    const barData = {
        labels: monthlyStats.map(s => s.date),
        datasets: [
            {
                label: t('reports.status_present', 'Kelganlar'),
                data: monthlyStats.map(s => s.present),
                backgroundColor: '#10b981',
                borderRadius: 4,
            },
            {
                label: t('reports.status_absent', 'Kelmaganlar'),
                data: monthlyStats.map(s => s.absent),
                backgroundColor: '#f59e0b',
                borderRadius: 4,
            },
            {
                label: t('reports.late', 'Kechikkanlar'),
                data: monthlyStats.map(s => s.late),
                backgroundColor: '#ef4444',
                borderRadius: 4,
            },
            {
                label: t('reports.on_time', 'Vaqtida'),
                data: monthlyStats.map(s => s.on_time),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">
                            {t('dashboard.attendance_overview', 'Bugungi davomat umumiy ko\'rinishi')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-4">
                        <Pie data={attendanceData} options={pieOptions} />
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">
                            {t('dashboard.lateness_overview', 'Bugungi kechikish umumiy ko\'rinishi')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] p-4">
                        <Pie data={latenessData} options={pieOptions} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">
                        {t('dashboard.monthly_attendance', 'Oylik statistika')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] p-4">
                    <Bar data={barData} options={barOptions} />
                </CardContent>
            </Card>
        </div>
    );
}
