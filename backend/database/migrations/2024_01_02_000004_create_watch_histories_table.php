<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watch_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('media_type', ['movie', 'tv']);
            $table->unsignedBigInteger('tmdb_id');
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->unsignedInteger('season')->nullable();
            $table->unsignedInteger('episode')->nullable();
            $table->unsignedInteger('progress_seconds')->default(0);
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->timestamp('last_watched_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'last_watched_at']);
            $table->index(['user_id', 'media_type', 'tmdb_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watch_histories');
    }
};
