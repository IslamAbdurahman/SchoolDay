<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\DailyAttendance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index()
    {
        return Inertia::render('monitoring');
    }

    public function data(): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        // Get all student IDs that have attendance today
        $presentStudentIds = DailyAttendance::where('date', $today)
            ->pluck('student_id')
            ->toArray();

        $branches = Branch::with([
            'shifts.classes.students' => function ($q) {
                $q->orderBy('name');
            }
        ])->get();

        $result = [];

        foreach ($branches as $branch) {
            $branchData = [
                'id' => $branch->id,
                'name' => $branch->name,
                'classes' => [],
                'total_students' => 0,
                'present_students' => 0,
            ];

            foreach ($branch->shifts as $shift) {
                foreach ($shift->classes as $class) {
                    $classStudents = [];
                    $classPresent = 0;

                    foreach ($class->students as $student) {
                        $isPresent = in_array($student->id, $presentStudentIds);
                        if ($isPresent) $classPresent++;

                        $classStudents[] = [
                            'id' => $student->id,
                            'name' => $student->name,
                            'is_present' => $isPresent,
                        ];
                    }

                    $branchData['classes'][] = [
                        'id' => $class->id,
                        'name' => $class->name,
                        'shift_name' => $shift->name,
                        'students' => $classStudents,
                        'total' => count($classStudents),
                        'present' => $classPresent,
                    ];

                    $branchData['total_students'] += count($classStudents);
                    $branchData['present_students'] += $classPresent;
                }
            }

            $result[] = $branchData;
        }

        return response()->json([
            'branches' => $result,
            'updated_at' => now()->format('H:i:s'),
        ]);
    }
}
