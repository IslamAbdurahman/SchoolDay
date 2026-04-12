<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = ['name', 'description'];

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    public function macAddresses()
    {
        return $this->hasMany(BranchMacAddress::class);
    }
}
