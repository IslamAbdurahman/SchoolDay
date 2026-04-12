<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

use App\Http\Controllers\BranchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MonitoringController;

use App\Http\Controllers\ReportController;
use App\Http\Controllers\SchoolClassController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\StudentController;

// Public monitoring routes
Route::get('monitoring', [MonitoringController::class, 'index'])->name('monitoring');
Route::get('monitoring/data', [MonitoringController::class, 'data'])->name('monitoring.data');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/{id}', [ReportController::class, 'show'])->name('reports.show');
    Route::delete('reports/{id}', [ReportController::class, 'destroy'])->name('reports.destroy');
    Route::delete('report-events/{id}', [ReportController::class, 'destroyEvent'])->name('report-events.destroy');

    Route::resource('users', App\Http\Controllers\UserController::class)
        ->except(['create', 'show', 'edit'])
        ->middleware(App\Http\Middleware\SuperadminMiddleware::class);
    Route::resource('branches', BranchController::class)->except(['create', 'show', 'edit']);
    Route::resource('shifts', ShiftController::class)->except(['create', 'show', 'edit']);
    Route::resource('classes', SchoolClassController::class)->except(['create', 'show', 'edit'])->parameters(['classes' => 'schoolClass']);
    Route::get('students/all', [StudentController::class, 'all'])->name('students.all');
    Route::get('students/template', [StudentController::class, 'template'])->name('students.template');
    Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
    Route::post('students/{student}', [StudentController::class, 'update'])->name('students.update_post');
    Route::resource('students', StudentController::class)->except(['create', 'show', 'edit']);
});

require __DIR__ . '/settings.php';
