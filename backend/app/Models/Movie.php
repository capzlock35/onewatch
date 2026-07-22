<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    use HasFactory;

    protected $fillable = [
        'tmdb_id',
        'title',
        'overview',
        'poster_path',
        'backdrop_path',
        'release_date',
        'rating',
        'genres',
        'runtime',
        'trailer_url',
    ];

    protected function casts(): array
    {
        return [
            'genres' => 'array',
            'rating' => 'float',
            'release_date' => 'date',
        ];
    }
}
