<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Movie::query();

        if ($search = $request->query('q')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($genre = $request->query('genre')) {
            $query->whereJsonContains('genres', $genre);
        }

        $movies = $query
            ->orderByDesc('rating')
            ->paginate((int) $request->query('per_page', 24));

        return response()->json($movies);
    }

    public function show(Movie $movie): JsonResponse
    {
        return response()->json(['data' => $movie]);
    }
}
