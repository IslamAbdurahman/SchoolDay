<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_mac_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->string('mac_address');
            $table->timestamps();

            $table->unique(['branch_id', 'mac_address']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_mac_addresses');
    }
};
