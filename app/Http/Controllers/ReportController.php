<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\DailyAttendance;
use App\Models\SchoolClass;
use App\Models\Shift;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->getFilters($request);
        $paginated = $this->getAttendanceData($filters, true);

        return Inertia::render('reports/index', [
            'attendances' => $paginated,
            'branches' => Branch::all(),
            'shifts' => Shift::with('branch')->get(),
            'classes' => SchoolClass::with(['shift.branch'])->get(),
            'students' => Student::all(),
            'filters' => $filters,
        ]);
    }

    public function export(Request $request)
    {
        $filters = $this->getFilters($request);
        $data = $this->getAttendanceData($filters, false);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AttendanceExport($data),
            'davomat_hisoboti_' . now()->format('Y-m-d_H-i') . '.xlsx'
        );
    }

    private function getFilters(Request $request)
    {
        return [
            'start_date' => $request->input('start_date', Carbon::today()->toDateString()),
            'end_date' => $request->input('end_date', Carbon::today()->toDateString()),
            'branch_id' => $request->input('branch_id'),
            'shift_id' => $request->input('shift_id'),
            'class_id' => $request->input('class_id'),
            'student_id' => $request->input('student_id'),
            'status' => $request->input('status', 'all'),
            'per_page' => $request->input('per_page', '20'),
        ];
    }

    private function getAttendanceData(array $filters, $paginate = true)
    {
        $perPage = $filters['per_page'];
        $limit = $perPage === 'all' ? 100000 : (int) $perPage;
        $startDate = $filters['start_date'];
        $endDate = $filters['end_date'];
        $branchId = $filters['branch_id'];
        $shiftId = $filters['shift_id'];
        $classId = $filters['class_id'];
        $studentId = $filters['student_id'];
        $status = $filters['status'];

        if ($status === 'absent') {
            $query = Student::with(['schoolClass.shift.branch'])
                ->whereDoesntHave('attendances', function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('date', [$startDate, $endDate]);
                });
            if ($studentId) {
                $query->where('id', $studentId);
            } else {
                if ($classId) {
                    $query->where('class_id', $classId);
                } elseif ($shiftId) {
                    $query->whereHas('schoolClass', function ($q) use ($shiftId) {
                        $q->where('shift_id', $shiftId);
                    });
                } elseif ($branchId) {
                    $query->whereHas('schoolClass.shift', function ($q) use ($branchId) {
                        $q->where('branch_id', $branchId);
                    });
                }
            }

            if ($paginate) {
                $results = $query->paginate($limit);
                $collection = $results->getCollection();
            } else {
                $results = $query->get();
                $collection = $results;
            }

            $collection->transform(function ($student) use ($startDate) {
                $item = new DailyAttendance([
                    'date' => clone Carbon::parse($startDate),
                ]);
                $item->id = 'absent-' . $student->id;
                $item->setRelation('student', $student);
                $item->is_absent_placeholder = true;

                return $item;
            });

            return $results;
        } else {
            $query = DailyAttendance::with(['student.schoolClass.shift.branch'])
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date', 'desc')
                ->orderBy('first_check_in', 'desc');

            if ($studentId) {
                $query->where('student_id', $studentId);
            } else {
                if ($classId) {
                    $query->whereHas('student', function ($q) use ($classId) {
                        $q->where('class_id', $classId);
                    });
                } elseif ($shiftId) {
                    $query->whereHas('student.schoolClass', function ($q) use ($shiftId) {
                        $q->where('shift_id', $shiftId);
                    });
                } elseif ($branchId) {
                    $query->whereHas('student.schoolClass.shift', function ($q) use ($branchId) {
                        $q->where('branch_id', $branchId);
                    });
                }
            }

            return $paginate ? $query->paginate($limit) : $query->get();
        }
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
                ->sortBy(fn ($event) => $event->access?->dateTime)
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
