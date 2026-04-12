import React, { useEffect, useState, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useAppearance } from '@/hooks/use-appearance';
import { useEcho } from '@laravel/echo-react';
import {
    Moon, Sun, ArrowLeft, RefreshCw, Users,
    UserCheck, UserX,
    Building2, GraduationCap, Activity,
} from 'lucide-react';

interface StudentData {
    id: number;
    name: string;
    is_present: boolean;
}

interface ClassData {
    id: number;
    name: string;
    shift_name: string;
    students: StudentData[];
    total: number;
    present: number;
}

interface BranchData {
    id: number;
    name: string;
    classes: ClassData[];
    total_students: number;
    present_students: number;
}

interface MonitoringData {
    branches: BranchData[];
    updated_at: string;
}

export default function Monitoring() {
    const { appearance, updateAppearance } = useAppearance();
    const [data, setData] = useState<MonitoringData | null>(null);
    const [loading, setLoading] = useState(true);

    const echo = useEcho();

    const toggleTheme = () => {
        const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/monitoring/data');
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error('Monitoring data fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!echo) return;

        const channel = echo.channel('monitoring')
            .listen('.updated', () => {
                console.log('Monitoring data updated via Echo');
                fetchData();
            });

        return () => {
            channel.stopListening('.updated');
        };
    }, [echo, fetchData]);


    // Overall stats
    const totalStudents = data?.branches.reduce((s, b) => s + b.total_students, 0) ?? 0;
    const presentStudents = data?.branches.reduce((s, b) => s + b.present_students, 0) ?? 0;
    const absentStudents = totalStudents - presentStudents;
    const attendanceRate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

    return (
        <>
            <Head>
                <title>Monitoring — SchoolDay</title>
                <meta name="description" content="Real-vaqt davomat monitoring" />
            </Head>

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">

                {/* Background Effects */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-600/10 dark:bg-emerald-600/20 blur-[128px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[128px]"></div>
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-500/10 dark:bg-orange-500/20 blur-[128px]"></div>
                </div>

                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                <h1 className="text-lg sm:text-xl font-bold">Monitoring</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Live indicator */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    LIVE
                                </span>
                            </div>

                            {data && (
                                <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                                    {data.updated_at}
                                </span>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full transition-all"
                            >
                                <Sun className="h-4 w-4 hidden dark:block" />
                                <Moon className="h-4 w-4 block dark:hidden" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-blue-500/10">
                                    <Users className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold tabular-nums">{totalStudents}</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Jami o'quvchilar</p>
                        </div>

                        <div className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-emerald-500/10">
                                    <UserCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{presentStudents}</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Kelganlar</p>
                        </div>

                        <div className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-red-500/10">
                                    <UserX className="w-5 h-5 text-red-500" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold tabular-nums text-red-500 dark:text-red-400">{absentStudents}</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Kelmaganlar</p>
                        </div>

                        <div className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-orange-500/10">
                                    <RefreshCw className={`w-5 h-5 text-orange-500 ${loading ? 'animate-spin' : ''}`} />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold tabular-nums">{attendanceRate}%</p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Davomat foizi</p>
                        </div>
                    </div>

                    {/* Branches */}
                    {loading && !data ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                            <p className="text-slate-400">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {data?.branches.map(branch => {
                                const branchAbsent = branch.total_students - branch.present_students;
                                const branchRate = branch.total_students > 0 ? Math.round((branch.present_students / branch.total_students) * 100) : 0;

                                return (
                                    <div key={branch.id}>
                                        {/* Branch Header */}
                                        <div className="flex items-center gap-3 mb-4 px-1">
                                            <Building2 className="w-6 h-6 text-indigo-500" />
                                            <h2 className="text-xl font-bold">{branch.name}</h2>
                                            <div className="flex items-center gap-2 ml-auto text-xs">
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    {branch.present_students} kelgan
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 font-medium">
                                                    {branchAbsent} kelmagan
                                                </span>
                                                <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                                                    {branchRate}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Class Cards Grid */}
                                        {branch.classes.length === 0 ? (
                                            <p className="text-sm text-slate-400 italic px-1">Sinflar topilmadi</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {branch.classes.map(cls => {
                                                    const classAbsent = cls.total - cls.present;

                                                    return (
                                                        <div
                                                            key={cls.id}
                                                            className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm overflow-hidden shadow-sm"
                                                        >
                                                            {/* Class Card Header */}
                                                            <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-white/3">
                                                                <div className="flex items-center gap-2">
                                                                    <GraduationCap className="w-5 h-5 text-orange-500" />
                                                                    <span className="font-semibold text-base">{cls.name}</span>
                                                                    <span className="text-xs text-slate-400 ml-1">({cls.shift_name})</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs font-medium">
                                                                    <span className="text-emerald-600 dark:text-emerald-400">{cls.present}✓</span>
                                                                    <span className="text-red-500 dark:text-red-400">{classAbsent}✗</span>
                                                                    <span className="text-slate-400">/ {cls.total}</span>
                                                                </div>
                                                            </div>

                                                            {/* Students - Journal Style */}
                                                            <div className="divide-y divide-black/5 dark:divide-white/5">
                                                                {cls.students.map((student, idx) => (
                                                                    <div
                                                                        key={student.id}
                                                                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                                                            student.is_present
                                                                                ? 'bg-emerald-500/15 dark:bg-emerald-500/20'
                                                                                : 'bg-rose-500/12 dark:bg-rose-500/15'
                                                                        }`}
                                                                    >
                                                                        <span className="w-6 text-center text-xs font-mono text-slate-400 dark:text-slate-500 flex-shrink-0">
                                                                            {idx + 1}
                                                                        </span>
                                                                        <span className={`font-medium flex-1 ${
                                                                            student.is_present
                                                                                ? 'text-emerald-800 dark:text-emerald-200'
                                                                                : 'text-rose-700 dark:text-rose-200'
                                                                        }`}>
                                                                            {student.name}
                                                                        </span>
                                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                                                            student.is_present
                                                                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                                                                        }`}>
                                                                            {student.is_present ? 'Kelgan' : 'Kelmagan'}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                {cls.students.length === 0 && (
                                                                    <p className="px-4 py-3 text-xs text-slate-400 italic">O'quvchilar topilmadi</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="relative z-10 text-center text-slate-400 text-xs py-6 px-4">
                    Real-vaqt (WebSocket) rejimida yangilanadi • SchoolDay Monitoring
                </footer>
            </div>
        </>
    );
}
