<?php

namespace App\Http\Controllers;

use App\Models\DailyAttendance;
use App\Models\SchoolClass;
use App\Models\Branch;
use App\Models\Shift;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '20');
        $limit = $perPage === 'all' ? 100000 : (int)$perPage;
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        $branchId = $request->input('branch_id');
        $shiftId = $request->input('shift_id');
        $classId = $request->input('class_id');
        $studentId = $request->input('student_id');
        $status = $request->input('status', 'all');

        if ($status === 'absent') {
            $query = Student::with(['schoolClass.shift.branch'])
                ->whereDoesntHave('attendances', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('date', [$startDate, $endDate]);
                });
            if ($studentId) {
                $query->where('id', $studentId);
            } else {
                if ($classId) {
                    $query->where('class_id', $classId);
                } else if ($shiftId) {
                    $query->whereHas('schoolClass', function ($q) use ($shiftId) {
                        $q->where('shift_id', $shiftId);
                    });
                } else if ($branchId) {
                    $query->whereHas('schoolClass.shift', function ($q) use ($branchId) {
                        $q->where('branch_id', $branchId);
                    });
                }
            }
            $paginated = $query->paginate($limit);
            $paginated->getCollection()->transform(function ($student) use ($startDate) {
                $item = new DailyAttendance([
                    'date' => clone Carbon::parse($startDate),
                ]);
                $item->id = 'absent-' . $student->id;
                $item->setRelation('student', $student);
                $item->is_absent_placeholder = true;
                return $item;
            });
        } else {
            $query = DailyAttendance::with(['student.schoolClass.shift.branch'])
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date', 'desc')
                ->orderBy('first_check_in', 'desc');

            if ($studentId) {
                $query->where('student_id', $studentId);
            }
            else {
                if ($classId) {
                    $query->whereHas('student', function ($q) use ($classId) {
                        $q->where('class_id', $classId);
                    });
                }
                else if ($shiftId) {
                    $query->whereHas('student.schoolClass', function ($q) use ($shiftId) {
                        $q->where('shift_id', $shiftId);
                    });
                }
                else if ($branchId) {
                    $query->whereHas('student.schoolClass.shift', function ($q) use ($branchId) {
                        $q->where('branch_id', $branchId);
                    });
                }
            }
            $paginated = $query->paginate($limit);
        }

        return Inertia::render('reports/index', [
            'attendances' => $paginated,
            'branches' => Branch::all(),
            'shifts' => Shift::with('branch')->get(),
            'classes' => SchoolClass::with(['shift.branch'])->get(),
            'students' => Student::all(),
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'branch_id' => $branchId,
                'shift_id' => $shiftId,
                'class_id' => $classId,
                'student_id' => $studentId,
                'status' => $status,
                'per_page' => $perPage,
            ]
        ]);
    }

    public function show($id)
    {
        $attendance = DailyAttendance::with(['student.schoolClass.shift.branch'])->findOrFail($id);
        $events = [];

        if ($attendance->student && $attendance->student->employeeNoString) {
            $events = \App\Models\HikvisionAccessEvent::query()->with('access')
                ->where('employeeNoString', $attendance->student->employeeNoString)
                ->whereHas('access', function ($query) use ($attendance) {
                    $query->whereDate('dateTime', $attendance->date);
                })
                ->get()
                ->sortBy(fn($event) => $event->access?->dateTime)
                ->values();
        }

        $attendance->setAttribute('events', $events);

        return Inertia::render('reports/show', [
            'attendance' => $attendance,
        ]);
    }

    public function destroy($id)
    {
        $attendance = DailyAttendance::findOrFail($id);
        $attendance->delete();

        return redirect()->route('reports.index')
            ->with('message', 'Attendance record deleted successfully');
    }

    public function destroyEvent($id)
    {
        $event = \App\Models\HikvisionAccessEvent::findOrFail($id);
        $event->faceRects()->delete();
        $event->delete();

        return back()->with('message', 'Access event deleted successfully');
    }
}