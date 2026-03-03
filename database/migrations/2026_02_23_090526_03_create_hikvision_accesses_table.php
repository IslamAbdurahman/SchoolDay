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
        Schema::create('hikvision_accesses', function (Blueprint $table) {
            $table->id();
            $table->string('ipAddress')->nullable();
            $table->integer('portNo')->nullable();
            $table->string('protocol')->nullable();
            $table->string('macAddress')->nullable();
            $table->integer('channelId')->nullable();
            $table->timestamp('dateTime')->nullable();
            $table->integer('activePostCount')->nullable();
            $table->string('eventType')->nullable();
            $table->string('eventState')->nullable();
            $table->text('eventDescription')->nullable();
            $table->string('shortSerialNumber')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hikvision_accesses');
    }
};