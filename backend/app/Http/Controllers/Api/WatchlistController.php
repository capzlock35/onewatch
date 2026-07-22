<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Watchlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()
            ->watchlist()
            ->latest()
            ->get();

        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'media_type' => ['required', 'in:movie,tv'],
            'tmdb_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'poster_path' => ['nullable', 'string', 'max:255'],
        ]);

        $item = $request->user()->watchlist()->firstOrCreate(
            [
                'media_type' => $data['media_type'],
                'tmdb_id' => $data['tmdb_id'],
            ],
            $data,
        );

        return response()->json(['data' => $item], 201);
    }

    public function destroy(Request $request, Watchlist $watchlist): JsonResponse
    {
        abort_unless($watchlist->user_id === $request->user()->id, 403);

        $watchlist->delete();

        return response()->json(['message' => 'Removed']);
    }
}
