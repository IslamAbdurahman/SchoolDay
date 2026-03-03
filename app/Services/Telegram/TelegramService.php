<?php

namespace App\Services\Telegram;

use App\Models\Setting;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Api;
use Telegram\Bot\Keyboard\Keyboard;

class TelegramService
{
    protected Api $telegram;
    protected string $token;

    public function __construct()
    {
        $bot = Setting::where('key', '=', 'telegram_bot_token')->first();

        // Ensure token exists, else pass empty string to avoid crashes immediately
        $this->token = $bot ? $bot->value : '';
        $this->telegram = new Api($this->token);
    }

    public function setWebhook(string $url): void
    {
        if (empty($this->token))
            return;

        try {
            $this->telegram->setWebhook(['url' => $url]);
        }
        catch (\Exception $e) {
            Log::error('Telegram setWebhook error: ' . $e->getMessage());
        }
    }

    /**
     * Handle incoming updates (commands, messages, contacts)
     */
    public function handleUpdate(array $update): void
    {
        $message = $update['message'] ?? null;
        if (!$message) {
            return;
        }

        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? null;
        $contact = $message['contact'] ?? null;
        $newChatMembers = $message['new_chat_members'] ?? null;

        // Agar xabar guruhdan kelgan bo'lsa (guruh ID si har doim manfiy bo'ladi)
        if ($chatId < 0) {
            if ($text === '/start' || $text === '/info' || str_starts_with((string)$text, '/start') || !empty($newChatMembers)) {
                $this->sendGroupInfo($chatId);
            }
            return; // Guruhda boshqa narsalarga spam qilmaslik uchun to'xtatamiz
        }

        if ($text === '/start') {
            $this->askPhoneNumber($chatId);
        }
        elseif ($contact) {
            $this->savePhoneNumber($chatId, $contact);
        }
        else {
            $this->sendUnknownCommand($chatId);
        }
    }

    /**
     * Send group info for linked classes
     */
    protected function sendGroupInfo(int|string $chatId): void
    {
        try {
            $schoolClass = \App\Models\SchoolClass::with(['shift.branch'])->withCount('students')->where('telegram_group_id', $chatId)->first();

            if ($schoolClass) {
                $className = $schoolClass->name;
                $shiftName = $schoolClass->shift?->name ?? '-';
                $branchName = $schoolClass->shift?->branch?->name ?? '-';
                $studentsCount = $schoolClass->students_count ?? 0;

                $message = "🏫 <b>Sinf:</b> {$className}\n🕗 <b>Smena:</b> {$shiftName}\n🏢 <b>Filial:</b> {$branchName}\n👥 <b>O'quvchilar soni:</b> {$studentsCount} ta\n\n✅ <i>Ushbu guruh tizimga muvaffaqiyatli ulangan.</i>";
                $this->sendSafeMessage($chatId, $message);
            }
            else {
                $message = "⚠️ Ushbu guruh tizimga ulanmagan.\n\nIltimos, ushbu ID ni admin panelda tegishli sinf sozlamalariga kiriting.\n👇 <b>Nusxalash uchun ID ustiga bosing:</b>\n\n<code>{$chatId}</code>";
                $this->sendSafeMessage($chatId, $message);
            }
        }
        catch (\Exception $e) {
            Log::error('Telegram sendGroupInfo error: ' . $e->getMessage());
        }
    }

    /**
     * Step 1 — Ask user to share phone number
     */
    protected function askPhoneNumber(int|string $chatId): void
    {
        $keyboard = Keyboard::make([
            'keyboard' => [
                [
                    Keyboard::button([
                        'text' => '📱 Share my phone number',
                        'request_contact' => true,
                    ])
                ]
            ],
            'resize_keyboard' => true,
            'one_time_keyboard' => true,
        ]);

        $this->sendSafeMessage(
            $chatId,
            "👋 Xush kelibsiz. Tizimdan to'liq foydalanish uchun telefon raqamingizni yuboring (tugmani bosgan holda).",
            $keyboard
        );
    }

    /**
     * Step 2 — Save phone number to DB
     */
    protected function savePhoneNumber(int|string $chatId, array $contact): void
    {
        try {
            $phone = trim($contact['phone_number'], '+');

            $userUpdated = User::where(function ($q) use ($phone) {
                $q->where('phone', $phone)
                    ->orWhere('phone', '+' . $phone);
            })
                ->update(['telegram_id' => $chatId]);

            $studentUpdated = Student::where(function ($q) use ($phone) {
                $q->where('phone', $phone)
                    ->orWhere('phone', '+' . $phone);
            })
                ->update(['telegram_id' => $chatId]);

            if ($userUpdated || $studentUpdated) {
                $linkedNames = collect();

                if ($userUpdated) {
                    $users = User::where('telegram_id', $chatId)->get();
                    foreach ($users as $u) {
                        $linkedNames->push("👤 <b>" . $u->name . "</b> (Xodim/O'qituvchi)");
                    }
                }

                if ($studentUpdated) {
                    $students = Student::where('telegram_id', $chatId)->get();
                    foreach ($students as $s) {
                        $linkedNames->push("🎓 <b>" . $s->name . "</b> (O'quvchi)");
                    }
                }

                $namesList = $linkedNames->join("\n");

                $message = "👋 <b>Tizimga ulanish yakunlandi!</b>\n\nQuyidagi hisoblar ushbu raqamga biriktirildi:\n\n{$namesList}\n\nEndi ularga oid bildirishnomalarni qabul qilib olasiz.";

                $this->sendSafeMessage($chatId, $message, Keyboard::remove());
            }
            else {
                $this->sendSafeMessage(
                    $chatId,
                    "❌ Sizning raqamingiz bazada o'quvchi yoki admin sifatida topilmadi. Iltimos, ma'muriyat bilan bog'laning.",
                    Keyboard::remove()
                );
            }

        }
        catch (\Exception $e) {
            \Log::error('Error saving Telegram phone: ' . $e->getMessage());

            $this->sendSafeMessage(
                $chatId,
                "❌ Telefon raqamingizni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
                Keyboard::remove()
            );
        }
    }

    /**
     * Unknown command handler
     */
    protected function sendUnknownCommand(int|string $chatId): void
    {
        try {
            $this->telegram->sendMessage([
                'chat_id' => $chatId,
                'text' => "Nomalum buyruq. Iltimos, /start buyrug'ini yuboring.",
            ]);
        }
        catch (\Exception $e) {
            Log::error('Telegram sendMessage error: ' . $e->getMessage());
        }
    }

    /**
     * Safe message sender
     */
    public function sendSafeMessage(int|string $chatId, string $text, Keyboard $keyboard = null): void
    {
        try {
            $params = [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
            ];

            if ($keyboard) {
                $params['reply_markup'] = $keyboard;
            }

            $this->telegram->sendMessage($params);
        }
        catch (\Exception $e) {
            Log::error('Telegram sendMessage error: ' . $e->getMessage());
        }
    }

    /**
     * Send photo with fallback to standard message
     */
    public function sendPhotoWithFallback(int|string $chatId, string $photoPath, string $caption): void
    {
        try {
            // First check if photo exists
            $fullPath = storage_path('app/public/' . $photoPath);
            if (!file_exists($fullPath)) {
                $this->sendSafeMessage($chatId, $caption);
                return;
            }

            $this->telegram->sendPhoto([
                'chat_id' => $chatId,
                'photo' => \Telegram\Bot\FileUpload\InputFile::create($fullPath, basename($photoPath)),
                'caption' => $caption,
                'parse_mode' => 'HTML',
            ]);
        }
        catch (\Exception $e) {
            Log::error('Telegram sendPhoto error: ' . $e->getMessage() . '. Falling back to text message.');
            // Fallback to regular text message
            $this->sendSafeMessage($chatId, $caption);
        }
    }
}