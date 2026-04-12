<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '20');
        $limit = $perPage === 'all' ? 100000 : (int) $perPage;

        $today = \Carbon\Carbon::today()->toDateString();

        $shifts = Shift::with('branch')
            ->withCount('classes')
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
            ->paginate($limit);

        $branches = Branch::all();

        return Inertia::render('shifts/index', [
            'shifts' => $shifts,
            'branches' => $branches,
            'filters' => ['per_page' => $perPage],
        ]);
    }

    public function store(\App\Http\Requests\ShiftRequest $request)
    {
        $validated = $request->validated();

        Shift::create($validated);

        return redirect()->back()->with('success', 'crud.created');
    }

    public function update(\App\Http\Requests\ShiftRequest $request, Shift $shift)
    {
        $validated = $request->validated();

        $shift->update($validated);

        return redirect()->back()->with('success', 'crud.updated');
    }

    public function destroy(Shift $shift)
    {
        try {
            $shift->delete();

            return redirect()->back()->with('success', 'crud.deleted');
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'crud.delete_shift_error');
            }

            return redirect()->back()->with('error', 'crud.error');
        }
    }
}
