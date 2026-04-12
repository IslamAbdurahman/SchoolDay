<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaceRect extends Model
{
    protected $fillable = [
        'hikvision_access_event_id', 'height', 'width', 'x', 'y',
    ];

    public function accessEvent(): BelongsTo
    {
        return $this->belongsTo(HikvisionAccessEvent::class, 'hikvision_access_event_id');
    }
}
