<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use Illuminate\Http\Request;

/**
 * Proxy controller for Hikvision device API calls.
 *
 * Browser → Laravel (same-origin, no CORS) → Hikvision device (server-to-server).
 * Hikvision devices use DIGEST auth (not Basic), so we use GuzzleHttp directly.
 *
 * Always returns HTTP 200 to the browser; Hikvision's real status is
 * embedded in the JSON body as { hik_status, hik_ok, data }.
 */
class HikvisionProxyController extends Controller
{
    public function forward(Request $request)
    {
        $ip = $request->input('ip');
        $username = $request->input('username') ?? '';
        $password = $request->input('password') ?? '';
        $method = strtolower($request->input('method', 'POST'));
        $path = $request->input('path');
        $body = $request->input('body');

        if (!$ip || !$path) {
            return response()->json(['hik_ok' => false, 'error' => 'ip and path are required'], 422);
        }

        $url = "http://{$ip}{$path}";

        // Base Guzzle options — Digest auth works with Hikvision
        $clientOptions = [
            'timeout' => 15,
            'connect_timeout' => 5,
            'verify' => false, // Hikvision devices use self-signed certs on HTTPS
            'auth' => [$username, $password, 'digest'],
        ];

        $client = new Client($clientOptions);

        try {
            // ── Multipart (face image) ─────────────────────────────────────────
            if ($request->hasFile('face_image')) {
                $faceDataRecord = $request->input('face_data_record', '{}');
                $file = $request->file('face_image');

                $guzzleResponse = $client->request($method, $url, [
                    'multipart' => [
                        [
                            'name' => 'FaceDataRecord',
                            'contents' => $faceDataRecord,
                            'filename' => 'facedata.json',
                            'headers' => ['Content-Type' => 'application/json'],
                        ],
                        [
                            'name' => 'FaceImage',
                            'contents' => fopen($file->getRealPath(), 'r'),
                            'filename' => 'face.jpg',
                            'headers' => ['Content-Type' => $file->getMimeType()],
                        ],
                    ],
                ]);
            }
            // ── JSON ───────────────────────────────────────────────────────────
            else {
                $guzzleResponse = $client->request($method, $url, [
                    'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
                    'json' => $body ?? [],
                ]);
            }

            $hikStatus = $guzzleResponse->getStatusCode();
            $rawBody = (string)$guzzleResponse->getBody();
            $hikBody = json_decode($rawBody, true) ?? ['raw' => $rawBody];

            return response()->json([
                'hik_ok' => $hikStatus >= 200 && $hikStatus < 300,
                'hik_status' => $hikStatus,
                'data' => $hikBody,
            ]);
        }
        catch (ConnectException $e) {
            return response()->json([
                'hik_ok' => false,
                'error' => 'Qurilmaga ulanib bo\'lmadi: ' . $e->getMessage(),
            ]);
        }
        catch (\GuzzleHttp\Exception\RequestException $e) {
            // Guzzle throws on 4xx/5xx — capture the real Hikvision status
            if ($e->hasResponse()) {
                $guzzleResponse = $e->getResponse();
                $hikStatus = $guzzleResponse->getStatusCode();
                $rawBody = (string)$guzzleResponse->getBody();
                $hikBody = json_decode($rawBody, true) ?? ['raw' => $rawBody];

                return response()->json([
                    'hik_ok' => false,
                    'hik_status' => $hikStatus,
                    'data' => $hikBody,
                ]);
            }

            return response()->json([
                'hik_ok' => false,
                'error' => $e->getMessage(),
            ]);
        }
        catch (\Exception $e) {
            return response()->json([
                'hik_ok' => false,
                'error' => $e->getMessage(),
            ]);
        }
    }
}