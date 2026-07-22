<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TvShow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TvShowController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TvShow::query();

        if ($search = $request->query('q')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($genre = $request->query('genre')) {
            $query->whereJsonContains('genres', $genre);
        }

        $shows = $query
            ->orderByDesc('rating')
            ->paginate((int) $request->query('per_page', 24));

        return response()->json($shows);
    }

    public function show(TvShow $tvShow): JsonResponse
    {
        return response()->json(['data' => $tvShow]);
    }
}
