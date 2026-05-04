<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Check if user is logged in
        if (!auth()->check()) {
            return redirect('/login');
        }

        // 2. Check if the user's role is in the list of allowed roles for this route
        if (!in_array(auth()->user()->role, $roles)) {
            abort(403, 'UNAUTHORIZED: Your rank/role does not permit access to this section.');
        }

        return $next($request);
    }
}