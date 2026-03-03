<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $fillable = [
        'name', 'phone', 'address', 'comment',
        'employeeNoString', 'status', 'telegram_id', 'class_id', 'face_image',
        'gender', 'user_verify_mode', 'local_ui_right',
        'door_right', 'plan_template_no',
        'valid_enabled', 'valid_begin', 'valid_end',
    ];

    protected $casts = [
        'local_ui_right' => 'boolean',
        'valid_enabled' => 'boolean',
        'valid_begin' => 'datetime',
        'valid_end' => 'datetime',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class , 'class_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(DailyAttendance::class);
    }
}