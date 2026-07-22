<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Throttle every API route to keep spammers / scrapers / brute-force
     * attempts in check. Limiters are keyed by the authenticated user when
     * available, otherwise by client IP.
     */
    protected function configureRateLimiting(): void
    {
        // General API traffic (public catalog reads + authenticated reads).
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Login / register — brute-force and account-spam sensitive. Combine a
        // per-IP limit with a per-(email + IP) limit so one IP can't churn
        // through many accounts, and a single account can't be hammered.
        RateLimiter::for('auth', function (Request $request) {
            $email = strtolower((string) $request->input('email'));

            return [
                Limit::perMinute(5)->by('auth-ip:'.$request->ip()),
                Limit::perMinute(5)->by('auth-id:'.$email.'|'.$request->ip()),
            ];
        });

        // Mutating, authenticated endpoints (watchlist / history / profile
        // writes) — tighter than general reads.
        RateLimiter::for('writes', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });
    }
}
