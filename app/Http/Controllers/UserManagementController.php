<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('UserManagement', [
            'users' => User::orderBy('created_at', 'desc')->get()
        ]);
    }

    public function approve(User $user)
    {
        $user->update(['status' => 'approved']);
        return back();
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:user,admin,super_admin,commander'
        ]);
        
        // NEW FEATURE: Max 3 Super Admins restriction
        if ($validated['role'] === 'super_admin' && $user->role !== 'super_admin') {
            if (User::where('role', 'super_admin')->count() >= 3) {
                return back()->withErrors(['role' => 'Limit Reached: You can only have a maximum of 3 Super Admins.']);
            }
        }
        
        $user->update(['role' => $validated['role']]);
        return back();
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back();
    }
}