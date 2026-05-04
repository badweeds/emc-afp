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
            // Bypass local SSL check
            $guzzleClient = new \GuzzleHttp\Client(['verify' => false]);
            
            $googleUser = Socialite::driver('google')
                            ->setHttpClient($guzzleClient)
                            ->stateless()
                            ->user();

            $targetEmail = 'drunza22@gmail.com'; // Your exact Super Admin email

            // Force the update/creation of the user
            $user = User::updateOrCreate(
                ['email' => $googleUser->email], 
                [
                    'name' => $googleUser->name,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt(Str::random(24)),
                    // Force the role and status EVERY TIME this email logs in
                    'role' => $googleUser->email === $targetEmail ? 'super_admin' : 'user',
                    'status' => $googleUser->email === $targetEmail ? 'approved' : 'pending',
                ]
            );

            // Log the user in
            Auth::login($user);

            return redirect()->intended(route('dashboard', absolute: false));

        } catch (Exception $e) {
            dd('Google Login Error: ' . $e->getMessage());
        }
    }
}