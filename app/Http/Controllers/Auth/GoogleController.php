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
            // Bypass local SSL check for development
            $guzzleClient = new \GuzzleHttp\Client(['verify' => false]);
            
            $googleUser = Socialite::driver('google')
                            ->setHttpClient($guzzleClient)
                            ->stateless()
                            ->user();

            $targetEmail = 'drunza22@gmail.com'; // Your Super Admin email

            // 1. Check if user already exists
            $user = User::where('email', $googleUser->email)->first();

            // 2. If they don't exist, create them as PENDING
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt(Str::random(24)),
                    'role' => $googleUser->email === $targetEmail ? 'super_admin' : 'user',
                    'status' => $googleUser->email === $targetEmail ? 'approved' : 'pending',
                ]);
            } else {
                // If they exist, just update their Google ID
                $user->update(['google_id' => $googleUser->id]);
            }

            // 3. SECURITY GATE: Block them if they are not approved by Super Admin
            if ($user->status !== 'approved') {
                return redirect()->route('login')->withErrors([
                    'email' => 'Access Denied: Your account is pending Super Admin approval. You cannot log in yet.'
                ]);
            }

            // 4. Log in the approved user
            Auth::login($user);

            return redirect()->intended(route('dashboard', absolute: false));

        } catch (Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Google Login Error: ' . $e->getMessage()
            ]);
        }
    }
}