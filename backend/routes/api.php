<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MovieController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TvShowController;
use App\Http\Controllers\Api\WatchHistoryController;
use App\Http\Controllers\Api\WatchlistController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // Brute-force / account-spam sensitive — 5/min per IP and per email+IP.
    Route::middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::get('movies', [MovieController::class, 'index']);
Route::get('movies/{movie}', [MovieController::class, 'show']);

Route::get('tv-shows', [TvShowController::class, 'index']);
Route::get('tv-shows/{tvShow}', [TvShowController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('watchlist', [WatchlistController::class, 'index']);
    Route::get('profile', [ProfileController::class, 'show']);
    Route::get('history', [WatchHistoryController::class, 'index']);

    // Mutating endpoints — tighter 30/min cap on top of the baseline.
    Route::middleware('throttle:writes')->group(function () {
        Route::post('watchlist', [WatchlistController::class, 'store']);
        Route::delete('watchlist/{watchlist}', [WatchlistController::class, 'destroy']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::post('history', [WatchHistoryController::class, 'store']);
    });
});
