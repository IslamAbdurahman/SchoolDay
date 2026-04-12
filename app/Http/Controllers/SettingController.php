<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('settings/index', [
            'settings' => $settings,
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'telegram_bot_token' => 'nullable|string',
        ];

        if (auth()->user()->hasRole('Superadmin')) {
            $rules['branch_limit'] = 'nullable|integer|min:1';
        }

        $validated = $request->validate($rules);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        if (! empty($validated['telegram_bot_token'])) {
            $service = new \App\Services\Telegram\TelegramService;
            // Assuming your application uses https
            $url = url('/api/telegram/webhook');
            if (str_starts_with($url, 'https')) {
                $service->setWebhook($url);
            }
        }

        return redirect()->back()->with('message', 'Settings saved successfully');
    }
}
