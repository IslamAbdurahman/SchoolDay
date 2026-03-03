<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '20');
        $limit = $perPage === 'all' ? 100000 : (int)$perPage;
        $shiftId = $request->input('shift_id');
        $search = $request->input('search');
        $today = \Carbon\Carbon::today()->toDateString();

        $query = SchoolClass::with('shift')
            ->withCount('students as total_students')
            ->withCount(['students as present_students' => function ($q) use ($today) {
            $q->whereHas('attendances', function ($a) use ($today) {
                    $a->whereDate('date', $today);
                }
                );
            }])
            ->withCount(['students as on_time_students' => function ($q) use ($today) {
            $q->whereHas('attendances', function ($a) use ($today) {
                    $a->whereDate('date', $today)->where('is_late', false);
                }
                );
            }])
            ->withCount(['students as late_students' => function ($q) use ($today) {
            $q->whereHas('attendances', function ($a) use ($today) {
                    $a->whereDate('date', $today)->where('is_late', true);
                }
                );
            }])
            ->orderBy('name', 'asc');

        if ($shiftId) {
            $query->where('shift_id', $shiftId);
        }

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        return Inertia::render('classes/index', [
            'classes' => $query->paginate($limit),
            'shifts' => Shift::with('branch')->get(),
            'filters' => [
                'shift_id' => $shiftId,
                'search' => $search,
                'per_page' => $perPage,
            ]
        ]);
    }

    public function store(\App\Http\Requests\SchoolClassRequest $request)
    {
        $validated = $request->validated();

        SchoolClass::create($validated);
        return redirect()->back()->with('success', 'crud.created');
    }

    public function update(\App\Http\Requests\SchoolClassRequest $request, SchoolClass $schoolClass)
    {
        $validated = $request->validated();

        $schoolClass->update($validated);
        return redirect()->back()->with('success', 'crud.updated');
    }

    public function destroy(SchoolClass $schoolClass)
    {
        try {
            $schoolClass->delete();
            return redirect()->back()->with('success', 'crud.deleted');
        }
        catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'crud.delete_class_error');
            }
            return redirect()->back()->with('error', 'crud.error');
        }
    }
}