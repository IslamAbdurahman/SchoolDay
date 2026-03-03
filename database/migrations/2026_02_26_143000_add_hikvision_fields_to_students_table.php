<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('gender')->default('unknown')->after('status')
                ->comment('male, female, unknown');
            $table->string('user_verify_mode')->default('face')->after('gender')
                ->comment('face, cardAndPw, card, faceAndPw, faceAndCard, cardOrfaceOrPw, cardOrFace, faceOrPw');
            $table->boolean('local_ui_right')->default(false)->after('user_verify_mode')
                ->comment('false = Attendance Check Only');
            $table->string('door_right')->default('1')->after('local_ui_right')
                ->comment('Door number(s), e.g. 1');
            $table->string('plan_template_no')->default('1')->after('door_right')
                ->comment('Access schedule template number');
            $table->boolean('valid_enabled')->default(false)->after('plan_template_no')
                ->comment('false = Long-Term Effective User');
            $table->dateTime('valid_begin')->nullable()->after('valid_enabled');
            $table->dateTime('valid_end')->nullable()->after('valid_begin');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'gender', 'user_verify_mode', 'local_ui_right',
                'door_right', 'plan_template_no',
                'valid_enabled', 'valid_begin', 'valid_end',
            ]);
        });
    }
};