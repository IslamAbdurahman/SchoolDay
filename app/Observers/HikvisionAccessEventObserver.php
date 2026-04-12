<?php

namespace App\Observers;

use App\Events\MonitoringUpdate;
use App\Models\DailyAttendance;
use App\Models\HikvisionAccessEvent;
use App\Models\Student;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Laravel\Facades\Telegram;

class HikvisionAccessEventObserver
{
    /**
     * Handle the HikvisionAccessEvent "created" event.
     */
    public function created(HikvisionAccessEvent $event): void
    {
        // Broadcast the update event for monitoring page
        MonitoringUpdate::dispatch();

        // Ignore if no employee string
        if (empty($event->employeeNoString)) {
            return;
        }

        // Identify the student
        $student = Student::with(['schoolClass.shift.branch'])->where('employeeNoString', $event->employeeNoString)->first();

        if (! $student || ! $student->schoolClass || ! $student->schoolClass->shift) {
            return; // Can't process if no student or no shift assigned
        }

        $event->load('access');
        $now = $event->access?->dateTime ?? now();
        $date = $now->toDateString();
        $shiftStartTime = Carbon::parse($date . ' ' . $student->schoolClass->shift->start_time);
        $shiftEndTime = Carbon::parse($date . ' ' . $student->schoolClass->shift->end_time);

        $attendance = DailyAttendance::where('student_id', $student->id)
            ->where('date', $date)
            ->first();

        if (! $attendance) {
            // first check-in
            $isLate = $now->greaterThan($shiftStartTime);

            $attendance = DailyAttendance::create([
                'student_id' => $student->id,
                'date' => $date,
                'first_check_in' => $now,
                'is_late' => $isLate,
                'is_left_early' => true, // Default to true until they check out properly
                'start_time' => Carbon::parse($student->schoolClass->shift->start_time)->format('H:i'),
                'end_time' => Carbon::parse($student->schoolClass->shift->end_time)->format('H:i'),
            ]);

            // Telegram Notification
            $groupId = $student->schoolClass->telegram_group_id ?? null;
            if ($student->telegram_id || $groupId) {
                try {
                    $statusLine = $isLate ? '🔴 <b>Kechikdi</b>' : '🔵 <b>Vaqtida keldi</b>';
                    $datetime = $now->format('Y-m-d H:i:s');
                    $className = $student->schoolClass->name ?? '-';
                    $shiftName = $student->schoolClass->shift->name ?? '-';
                    $branchName = $student->schoolClass->shift->branch->name ?? '-';

                    $message = "👤 <b>O'quvchi:</b> {$student->name}\n🏫 <b>Sinf:</b> {$className}\n🕗 <b>Smena:</b> {$shiftName}\n🏢 <b>Filial:</b> {$branchName}\n——\n{$statusLine}\n📅 <b>Sana:</b> {$datetime}";

                    $telegramService = new \App\Services\Telegram\TelegramService;

                    $targets = [];
                    if ($student->telegram_id) {
                        $targets[] = $student->telegram_id;
                    }
                    if ($groupId) {
                        $targets[] = $groupId;
                    }

                    foreach ($targets as $targetId) {
                        try {
                            if (! empty($event->picture)) {
                                $telegramService->sendPhotoWithFallback($targetId, $event->picture, $message);
                            } else {
                                $telegramService->sendSafeMessage($targetId, $message);
                            }
                        } catch (Exception $e) {
                            Log::error("Telegram yuborishda xato ({$targetId}): " . $e->getMessage());
                        }
                    }
                } catch (Exception $e) {
                    Log::error('Telegram yuborishda xato: ' . $e->getMessage());
                }
            }

        } else {
            // subsequent check-out
            $isLeftEarly = $now->lessThan($shiftEndTime);

            // They must have a first_check_in, we just update last_check_out
            $attendance->update([
                'last_check_out' => $now,
                'is_left_early' => $isLeftEarly,
                'start_time' => $attendance->start_time ?: Carbon::parse($student->schoolClass->shift->start_time)->format('H:i'),
                'end_time' => $attendance->end_time ?: Carbon::parse($student->schoolClass->shift->end_time)->format('H:i'),
            ]);

            // Telegram Notification for Check-out
            $groupId = $student->schoolClass->telegram_group_id ?? null;
            if ($student->telegram_id || $groupId) {
                try {
                    $datetime = $now->format('Y-m-d H:i:s');
                    $className = $student->schoolClass->name ?? '-';
                    $shiftName = $student->schoolClass->shift->name ?? '-';
                    $branchName = $student->schoolClass->shift->branch->name ?? '-';

                    $message = "👤 <b>O'quvchi:</b> {$student->name}\n🏫 <b>Sinf:</b> {$className}\n🕗 <b>Smena:</b> {$shiftName}\n🏢 <b>Filial:</b> {$branchName}\n——\n 📅 <b>Sana:</b> {$datetime}";

                    $telegramService = new \App\Services\Telegram\TelegramService;

                    $targets = [];
                    if ($student->telegram_id) {
                        $targets[] = $student->telegram_id;
                    }
                    if ($groupId) {
                        $targets[] = $groupId;
                    }

                    foreach ($targets as $targetId) {
                        try {
                            if (! empty($event->picture)) {
                                $telegramService->sendPhotoWithFallback($targetId, $event->picture, $message);
                            } else {
                                $telegramService->sendSafeMessage($targetId, $message);
                            }
                        } catch (Exception $e) {
                            Log::error("Telegram yuborishda xato ({$targetId}): " . $e->getMessage());
                        }
                    }
                } catch (Exception $e) {
                    Log::error('Telegram yuborish umumiy xato: ' . $e->getMessage());
                }
            }
        }
    }

    /**
     * Handle the HikvisionAccessEvent "updated" event.
     */
    public function updated(HikvisionAccessEvent $event): void
    {
        //
    }

    /**
     * Handle the HikvisionAccessEvent "deleted" event.
     */
    public function deleted(HikvisionAccessEvent $event): void
    {
        //
    }

    /**
     * Handle the HikvisionAccessEvent "restored" event.
     */
    public function restored(HikvisionAccessEvent $event): void
    {
        //
    }

    /**
     * Handle the HikvisionAccessEvent "force deleted" event.
     */
    public function forceDeleted(HikvisionAccessEvent $event): void
    {
        //
    }
}
