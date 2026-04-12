<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchMacAddress extends Model
{
    protected $fillable = ['branch_id', 'mac_address'];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
