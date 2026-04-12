<?php

use App\Http\Controllers\Api\HikvisionController;
use App\Http\Controllers\Api\SyncApiController;
use App\Http\Controllers\Api\TelegramController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/hikvision/events', [HikvisionController::class, 'store']);
Route::post('/telegram/webhook', [TelegramController::class, 'handle']);

// ── External Sync Tool (exe) API ────────────────────────────────────────
// Token auth via SYNC_API_TOKEN in .env
Route::get('/sync/students', [SyncApiController::class, 'students']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
