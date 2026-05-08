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
        if (auth()->id() === $user->id) {
            return back()->withErrors(['role' => 'Safety lock: You cannot modify your own access level.']);
        }

        $validated = $request->request->add(['role' => $request->role]); // Small fix for validation
        $validated = $request->validate([
            'role' => 'required|in:user,admin,super_admin,commander'
        ]);
        
        if ($validated['role'] === 'super_admin' && $user->role !== 'super_admin') {
            if (User::where('role', 'super_admin')->count() >= 3) {
                return back()->withErrors(['role' => 'Limit Reached: You can only have a maximum of 3 Super Admins.']);
            }
        }
        
        $user->update(['role' => $validated['role']]);
        return back();
    }

    // NEW: Function to update the military unit
    public function updateUnit(Request $request, User $user)
    {
        // Safety lock: Only super admins can change units from this panel
        if (auth()->user()->role !== 'super_admin') {
            return back()->withErrors(['error' => 'Unauthorized: Only Super Admins can change units.']);
        }

        if (auth()->id() === $user->id) {
            return back()->withErrors(['error' => 'Safety lock: You cannot modify your own unit.']);
        }

        $validated = $request->validate([
            'unit' => 'required|string|max:255'
        ]);
        
        $user->update(['unit' => $validated['unit']]);
        return back();
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->withErrors(['error' => 'Safety lock: You cannot delete your own account.']);
        }

        $user->delete();
        return back();
    }
}