<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\Request;

class TelegramController extends Controller
{
    public function handle(Request $request, TelegramService $telegramService)
    {
        $telegramService->handleUpdate($request->all());

        return response('OK', 200);
    }
}