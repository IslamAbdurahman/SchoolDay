<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

/**
 * Public API for the external Hikvision Sync Tool (exe).
 *
 * Endpoints:
 *   GET  /api/sync/students — list all students with face image URLs
 *
 * Authentication: Bearer token via SYNC_API_TOKEN in .env
 */
class SyncApiController extends Controller
{
    /**
     * Simple token guard — checks Authorization: Bearer <token>
     */
    private function authorize(Request $request): bool
    {
        $token = config('services.sync_api.token');

        if (empty($token)) {
            return false; // token not configured — deny all
        }

        return $request->bearerToken() === $token;
    }

    /**
     * GET /api/sync/students
     *
     * Returns all students with their face_image as a full URL.
     */
    public function students(Request $request)
    {
        if (!$this->authorize($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $students = Student::all()->map(function ($student) use ($request) {
            $faceUrl = null;
            if ($student->face_image) {
                // Build absolute URL for the face image
                if (str_starts_with($student->face_image, 'http')) {
                    $faceUrl = $student->face_image;
                } else {
                    $faceUrl = $request->getSchemeAndHttpHost() . $student->face_image;
                }
            }

            return [
                'id' => $student->id,
                'employeeNo' => $student->employeeNoString ?: (string)$student->id,
                'name' => $student->name,
                'face_image_url' => $faceUrl,
                'gender' => $student->gender,
                'user_verify_mode' => $student->user_verify_mode,
                'local_ui_right' => (bool)$student->local_ui_right,
                'door_right' => $student->door_right ?? '1',
                'plan_template_no' => $student->plan_template_no ?? '1',
                'valid_enabled' => (bool)$student->valid_enabled,
                'valid_begin' => $student->valid_begin?->format('Y-m-d\TH:i:s'),
                'valid_end' => $student->valid_end?->format('Y-m-d\TH:i:s'),
            ];
        });

        return response()->json([
            'success' => true,
            'count' => $students->count(),
            'students' => $students->values(),
        ]);
    }
}