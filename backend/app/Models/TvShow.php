<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TvShow extends Model
{
    use HasFactory;

    protected $table = 'tv_shows';

    protected $fillable = [
        'tmdb_id',
        'name',
        'overview',
        'poster_path',
        'backdrop_path',
        'first_air_date',
        'rating',
        'genres',
        'number_of_seasons',
        'number_of_episodes',
        'trailer_url',
    ];

    protected function casts(): array
    {
        return [
            'genres' => 'array',
            'rating' => 'float',
            'first_air_date' => 'date',
        ];
    }
}
