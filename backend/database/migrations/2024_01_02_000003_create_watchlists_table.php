<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('watchlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('media_type', ['movie', 'tv']);
            $table->unsignedBigInteger('tmdb_id');
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'media_type', 'tmdb_id']);
            $table->index(['user_id', 'media_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('watchlists');
    }
};
