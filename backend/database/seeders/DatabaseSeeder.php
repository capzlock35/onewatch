<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\TvShow;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'demo@netflix.test'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password'),
            ],
        );

        $movies = [
            ['tmdb_id' => 27205, 'title' => 'Inception', 'rating' => 8.4, 'release_date' => '2010-07-15', 'genres' => ['Action', 'Sci-Fi'], 'runtime' => 148],
            ['tmdb_id' => 155, 'title' => 'The Dark Knight', 'rating' => 9.0, 'release_date' => '2008-07-16', 'genres' => ['Action', 'Crime', 'Drama'], 'runtime' => 152],
            ['tmdb_id' => 24428, 'title' => 'The Avengers', 'rating' => 8.0, 'release_date' => '2012-05-04', 'genres' => ['Action', 'Adventure'], 'runtime' => 143],
            ['tmdb_id' => 299536, 'title' => 'Avengers: Infinity War', 'rating' => 8.3, 'release_date' => '2018-04-25', 'genres' => ['Action', 'Adventure'], 'runtime' => 149],
            ['tmdb_id' => 603, 'title' => 'The Matrix', 'rating' => 8.7, 'release_date' => '1999-03-30', 'genres' => ['Action', 'Sci-Fi'], 'runtime' => 136],
            ['tmdb_id' => 680, 'title' => 'Pulp Fiction', 'rating' => 8.9, 'release_date' => '1994-09-10', 'genres' => ['Crime', 'Drama'], 'runtime' => 154],
        ];

        foreach ($movies as $movie) {
            Movie::updateOrCreate(['tmdb_id' => $movie['tmdb_id']], $movie);
        }

        $tvShows = [
            ['tmdb_id' => 1396, 'name' => 'Breaking Bad', 'rating' => 9.5, 'first_air_date' => '2008-01-20', 'genres' => ['Drama', 'Crime'], 'number_of_seasons' => 5, 'number_of_episodes' => 62],
            ['tmdb_id' => 60625, 'name' => 'Rick and Morty', 'rating' => 8.7, 'first_air_date' => '2013-12-02', 'genres' => ['Animation', 'Comedy'], 'number_of_seasons' => 7, 'number_of_episodes' => 71],
            ['tmdb_id' => 66732, 'name' => 'Stranger Things', 'rating' => 8.6, 'first_air_date' => '2016-07-15', 'genres' => ['Drama', 'Sci-Fi'], 'number_of_seasons' => 4, 'number_of_episodes' => 34],
            ['tmdb_id' => 71712, 'name' => 'The Good Doctor', 'rating' => 8.4, 'first_air_date' => '2017-09-25', 'genres' => ['Drama'], 'number_of_seasons' => 7, 'number_of_episodes' => 126],
        ];

        foreach ($tvShows as $show) {
            TvShow::updateOrCreate(['tmdb_id' => $show['tmdb_id']], $show);
        }
    }
}
