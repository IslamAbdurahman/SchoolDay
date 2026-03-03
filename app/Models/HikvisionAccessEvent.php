<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use App\Observers\HikvisionAccessEventObserver;

#[ObservedBy([HikvisionAccessEventObserver::class])]
class HikvisionAccessEvent extends Model
{
    protected $fillable = [
        'hikvision_access_id', 'deviceName', 'majorEventType', 'subEventType',
        'name', 'cardReaderNo', 'employeeNoString', 'serialNo', 'userType',
        'currentVerifyMode', 'frontSerialNo', 'attendanceStatus', 'onlyVerify',
        'label', 'mask', 'picturesNumber', 'purePwdVerifyEnable', 'picture',
        'start_time', 'end_time',
    ];

    protected $casts = [
        'purePwdVerifyEnable' => 'boolean',
        'onlyVerify'          => 'boolean',
        'start_time'          => 'datetime',
        'end_time'            => 'datetime',
    ];

    public function access(): BelongsTo
    {
        return $this->belongsTo(HikvisionAccess::class , 'hikvision_access_id');
    }

    public function faceRects(): HasMany
    {
        return $this->hasMany(FaceRect::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'employeeNoString', 'employeeNoString');
    }
}