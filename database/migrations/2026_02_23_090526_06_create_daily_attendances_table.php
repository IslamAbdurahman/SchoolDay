<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daily_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->restrictOnDelete();
            $table->date('date');
            $table->timestamp('first_check_in')->nullable()->comment('Birinchi kelgan vaqti');
            $table->timestamp('last_check_out')->nullable()->comment('Oxirgi ketgan vaqti');
            $table->boolean('is_late')->default(false);
            $table->boolean('is_left_early')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_attendances');
    }
};
