<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HikvisionAccess extends Model
{
    protected $fillable = [
        'ipAddress', 'portNo', 'protocol', 'macAddress', 'channelId',
        'dateTime', 'activePostCount', 'eventType', 'eventState',
        'eventDescription', 'shortSerialNumber',
    ];

    protected $casts = [
        'dateTime' => 'datetime',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(HikvisionAccessEvent::class);
    }
}
