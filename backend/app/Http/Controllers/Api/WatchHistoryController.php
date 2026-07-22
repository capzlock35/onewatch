<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchHistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $history = $request->user()
            ->watchHistory()
            ->orderByDesc('last_watched_at')
            ->limit(50)
            ->get();

        return response()->json(['data' => $history]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'media_type' => ['required', 'in:movie,tv'],
            'tmdb_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'poster_path' => ['nullable', 'string', 'max:255'],
            'season' => ['nullable', 'integer', 'min:1'],
            'episode' => ['nullable', 'integer', 'min:1'],
            'progress_seconds' => ['required', 'integer', 'min:0'],
            'duration_seconds' => ['required', 'integer', 'min:0'],
        ]);

        $data['last_watched_at'] = now();

        $entry = $request->user()->watchHistory()->updateOrCreate(
            [
                'media_type' => $data['media_type'],
                'tmdb_id' => $data['tmdb_id'],
                'season' => $data['season'] ?? null,
                'episode' => $data['episode'] ?? null,
            ],
            $data,
        );

        return response()->json(['data' => $entry], 201);
    }
}
