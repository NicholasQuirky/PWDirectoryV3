<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class Admin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if the user is authenticated and has the 'admin' user type
        if(Auth::check() && Auth::user()->usertype !== 'admin') {
            return redirect('dashboard'); // Redirect to dashboard if not an admin
        }

        return $next($request); // Proceed to the requested route if an admin
    }
}

