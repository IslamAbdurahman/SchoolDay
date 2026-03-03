<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\HikvisionAccessEvent;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();

        // Stats
        $totalStudents = Student::count();
        $presentToday = DailyAttendance::where('date', $today)->count();
        $lateArrivals = DailyAttendance::where('date', $today)->where('is_late', true)->count();
        $absent = max(0, $totalStudents - $presentToday);

        // Live Feed
        $recentEvents = HikvisionAccessEvent::with(['student.schoolClass', 'faceRects', 'access'])
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        // Monthly Statistics
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $monthlyAttendance = DailyAttendance::whereBetween('date', [$startOfMonth, $endOfMonth])
            ->selectRaw('date, count(*) as present, sum(case when is_late then 1 else 0 end) as late')
            ->groupBy('date')
            ->get()
            ->keyBy(function($item) {
                return Carbon::parse($item->date)->format('Y-m-d');
            });

        $monthlyStats = [];
        $currentDate = clone $startOfMonth;
        $now = Carbon::now();
        while ($currentDate <= $now) {
            $dateStr = $currentDate->toDateString();
            $data = $monthlyAttendance->get($dateStr);
            
            $present = $data ? (int)$data->present : 0;
            $late = $data ? (int)$data->late : 0;
            
            $monthlyStats[] = [
                'date' => $currentDate->format('d.m'),
                'present' => $present,
                'absent' => max(0, $totalStudents - $present),
                'late' => $late,
                'on_time' => max(0, $present - $late),
            ];
            $currentDate->addDay();
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total_students' => $totalStudents,
                'present_today' => $presentToday,
                'late_arrivals' => $lateArrivals,
                'on_time_today' => max(0, $presentToday - $lateArrivals),
                'absent_today' => $absent
            ],
            'monthly_stats' => $monthlyStats,
            'recent_events' => $recentEvents
        ]);
    }
}