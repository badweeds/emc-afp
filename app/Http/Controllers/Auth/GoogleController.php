<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if the user already exists by google_id OR email
            $user = User::where('google_id', $googleUser->id)
                        ->orWhere('email', $googleUser->email)
                        ->first();

            if ($user) {
                // If user exists but doesn't have a google_id (they registered manually previously), update it
                if (!$user->google_id) {
                    $user->update(['google_id' => $googleUser->id]);
                }
                
                Auth::login($user);
                return redirect()->intended(route('dashboard', absolute: false));
            }

            // If it's a completely new user, create them.
            // IMPORTANT: They default to 'user' role and 'pending' status for security.
            $newUser = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'google_id' => $googleUser->id,
                // Do not set a password
                'role' => 'user', 
                'status' => 'pending', // Requires admin approval
            ]);

            Auth::login($newUser);

            return redirect()->intended(route('dashboard', absolute: false));

        } catch (Exception $e) {
            // Log the error in production
            return redirect('/login')->with('error', 'Failed to authenticate with Google.');
        }
    }
}