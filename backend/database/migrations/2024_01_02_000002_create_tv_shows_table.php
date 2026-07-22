<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tv_shows', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tmdb_id')->unique();
            $table->string('name');
            $table->text('overview')->nullable();
            $table->string('poster_path')->nullable();
            $table->string('backdrop_path')->nullable();
            $table->date('first_air_date')->nullable();
            $table->decimal('rating', 4, 2)->default(0);
            $table->json('genres')->nullable();
            $table->unsignedInteger('number_of_seasons')->default(0);
            $table->unsignedInteger('number_of_episodes')->default(0);
            $table->string('trailer_url')->nullable();
            $table->timestamps();

            $table->index('name');
            $table->index('first_air_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tv_shows');
    }
};
