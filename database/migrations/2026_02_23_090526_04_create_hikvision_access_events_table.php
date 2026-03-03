<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hikvision_access_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hikvision_access_id')->constrained('hikvision_accesses')->restrictOnDelete();
            $table->string('deviceName')->nullable();
            $table->integer('majorEventType')->nullable();
            $table->integer('subEventType')->nullable();
            $table->string('name')->nullable();
            $table->integer('cardReaderNo')->nullable();
            $table->string('employeeNoString')->nullable();
            $table->integer('serialNo')->nullable();
            $table->string('userType')->nullable();
            $table->string('currentVerifyMode')->nullable();
            $table->string('frontSerialNo')->nullable();
            $table->string('attendanceStatus')->nullable();
            $table->string('label')->nullable();
            $table->string('mask')->nullable();
            $table->integer('picturesNumber')->nullable();
            $table->boolean('purePwdVerifyEnable')->nullable();
            $table->string('picture')->nullable();
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hikvision_access_events');
    }
};