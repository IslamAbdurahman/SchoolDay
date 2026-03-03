<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', '20');
        $limit = $perPage === 'all' ? 100000 : (int)$perPage;

        $today = \Carbon\Carbon::today()->toDateString();

        $branches = Branch::withCount('shifts')
            ->with([
            'macAddresses',
            'shifts' => function ($q) use ($today) {
            $q->withCount('classes')
                ->withCount('students as total_students')
                ->withCount(['students as present_students' => function ($q) use ($today) {
                $q->whereHas('attendances', function ($a) use ($today) {
                            $a->whereDate('date', $today);
                        }
                            );
                    }
                        ])
                        ->withCount(['students as on_time_students' => function ($q) use ($today) {
                $q->whereHas('attendances', function ($a) use ($today) {
                            $a->whereDate('date', $today)->where('is_late', false);
                        }
                            );
                    }
                        ])
                        ->withCount(['students as late_students' => function ($q) use ($today) {
                $q->whereHas('attendances', function ($a) use ($today) {
                            $a->whereDate('date', $today)->where('is_late', true);
                        }
                            );
                    }
                        ]);
                }
        ])
            ->latest()
            ->paginate($limit)
            ->through(function ($branch) {
            $branch->classes_count = $branch->shifts->sum('classes_count');
            $branch->total_students = $branch->shifts->sum('total_students');
            $branch->present_students = $branch->shifts->sum('present_students');
            $branch->on_time_students = $branch->shifts->sum('on_time_students');
            $branch->late_students = $branch->shifts->sum('late_students');
            $branch->mac_address_list = $branch->macAddresses->pluck('mac_address')->toArray();
            unset($branch->shifts);
            return $branch;
        });

        return Inertia::render('branches/index', [
            'branches' => $branches,
            'filters' => ['per_page' => $perPage],
        ]);
    }

    public function store(\App\Http\Requests\BranchRequest $request)
    {
        $validated = $request->validated();
        $macAddresses = $validated['mac_addresses'] ?? [];
        unset($validated['mac_addresses']);

        $limit = \App\Models\Setting::where('key', 'branch_limit')->value('value') ?? 1;
        if (\App\Models\Branch::count() >= $limit) {
            return redirect()->back()->with('error', 'Limit bo\'yicha filial qo\'shish mumkin emas.');
        }

        $branch = Branch::create($validated);

        $this->syncMacAddresses($branch, $macAddresses);

        return redirect()->back()->with('success', 'crud.created');
    }

    public function update(\App\Http\Requests\BranchRequest $request, Branch $branch)
    {
        $validated = $request->validated();
        $macAddresses = $validated['mac_addresses'] ?? [];
        unset($validated['mac_addresses']);

        $branch->update($validated);

        $this->syncMacAddresses($branch, $macAddresses);

        return redirect()->back()->with('success', 'crud.updated');
    }

    public function destroy(Branch $branch)
    {
        try {
            $branch->delete();
            return redirect()->back()->with('success', 'crud.deleted');
        }
        catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->with('error', 'crud.delete_branch_error');
            }
            return redirect()->back()->with('error', 'crud.error');
        }
    }

    private function syncMacAddresses(Branch $branch, array $macAddresses): void
    {
        $clean = collect($macAddresses)
            ->map(fn($m) => strtoupper(trim($m)))
            ->filter(fn($m) => $m !== '')
            ->unique()
            ->values()
            ->toArray();

        // Delete old ones not in new list
        $branch->macAddresses()->whereNotIn('mac_address', $clean)->delete();

        // Create new ones
        foreach ($clean as $mac) {
            $branch->macAddresses()->firstOrCreate(['mac_address' => $mac]);
        }
    }
}