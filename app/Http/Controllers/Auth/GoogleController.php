<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
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
            // 1. FIX THE SSL ERROR: Tell Guzzle (Laravel's HTTP client) to skip SSL verification locally
            $guzzleClient = new \GuzzleHttp\Client(['verify' => false]);
            
            // 2. Fetch the user from Google using the relaxed SSL client
            $googleUser = Socialite::driver('google')
                            ->setHttpClient($guzzleClient)
                            ->stateless()
                            ->user();

            $targetEmail = 'drunza22@gmail.com'; // Your Super Admin Email

            // 3. Check if the user already exists in the database
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                // If the account exists, guarantee it has the google_id
                $user->update(['google_id' => $googleUser->id]);

                // If it is YOUR email, force it to be an approved super_admin (fixes the pending lockout)
                if ($user->email === $targetEmail) {
                    $user->update([
                        'role' => 'super_admin',
                        'status' => 'approved'
                    ]);
                }
                
                Auth::login($user);
                return redirect()->intended(route('dashboard', absolute: false));
            }

            // 4. IF THE USER DOES NOT EXIST, CREATE THEM!
            $newUser = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'google_id' => $googleUser->id,
                'password' => bcrypt(Str::random(24)), // Random secure password
                // Auto-assign super_admin and approved ONLY if it is your email
                'role' => $googleUser->email === $targetEmail ? 'super_admin' : 'user', 
                'status' => $googleUser->email === $targetEmail ? 'approved' : 'pending', 
            ]);

            Auth::login($newUser);

            return redirect()->intended(route('dashboard', absolute: false));

        } catch (Exception $e) {
            dd('Google Login Error: ' . $e->getMessage());
        }
    }
}