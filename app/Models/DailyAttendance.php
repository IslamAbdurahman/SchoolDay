<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyAttendance extends Model
{
    protected $fillable = [
        'student_id', 'date', 'first_check_in', 'last_check_out',
        'is_late', 'is_left_early', 'start_time', 'end_time',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
        'first_check_in' => 'datetime',
        'last_check_out' => 'datetime',
        'is_late' => 'boolean',
        'is_left_early' => 'boolean',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
