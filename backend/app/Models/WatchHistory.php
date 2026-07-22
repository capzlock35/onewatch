<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WatchHistory extends Model
{
    use HasFactory;

    protected $table = 'watch_histories';

    protected $fillable = [
        'user_id',
        'media_type',
        'tmdb_id',
        'title',
        'poster_path',
        'season',
        'episode',
        'progress_seconds',
        'duration_seconds',
        'last_watched_at',
    ];

    protected function casts(): array
    {
        return [
            'last_watched_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
