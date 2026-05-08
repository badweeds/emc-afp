<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\GoogleController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// ==========================================
// GOOGLE AUTH ROUTES
// ==========================================
Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================
Route::middleware(['auth'])->group(function () {
    
    // --- 1. DYNAMIC DASHBOARD & SETTINGS ---
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/settings', [DashboardController::class, 'settings'])->name('settings');
    Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');
    Route::delete('/settings/account', [ProfileController::class, 'destroy'])->name('settings.account.destroy');

    // --- 2. SUPER ADMIN ONLY (User Management) ---
    Route::middleware(['role:super_admin'])->group(function () {
        Route::get('/admin/users', [UserManagementController::class, 'index'])->name('admin.users');
        Route::post('/admin/users/{user}/approve', [UserManagementController::class, 'approve'])->name('admin.users.approve');
        Route::patch('/admin/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('admin.users.role');
        Route::patch('/admin/users/{user}/unit', [UserManagementController::class, 'updateUnit'])->name('admin.users.updateUnit');
        Route::delete('/admin/users/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.reject');
        Route::get('/admin/logs', [App\Http\Controllers\ActivityLogController::class, 'index'])->name('admin.logs');
    });

    // --- 3. ADMIN & SUPER ADMIN ONLY (Approvals, Editing, Deleting) ---
    Route::middleware(['role:admin,super_admin'])->group(function () {
        Route::get('/admin/news/pending', [NewsController::class, 'pending'])->name('admin.news.pending');
        Route::post('/admin/news/{newsArticle}/approve', [NewsController::class, 'approve'])->name('admin.news.approve');
        Route::post('/news/{newsArticle}', [NewsController::class, 'update']);
        Route::delete('/news/{newsArticle}', [NewsController::class, 'destroy']);
    });

    // --- 4. EVERYONE EXCEPT COMMANDER (Can Add & AI Analyze News) ---
    Route::middleware(['role:user,admin,super_admin'])->group(function () {
        Route::get('/add-news', [NewsController::class, 'create']);
        Route::post('/news', [NewsController::class, 'store']);
        Route::post('/analyze-news', [NewsController::class, 'analyze']);
    });

    // --- 5. READ-ONLY MONITORS (User, Admin, Super Admin, Commander) ---
    // THE FIX: Added 'user' to this middleware group so they can access these pages
    Route::middleware(['role:user,admin,super_admin,commander'])->group(function () {
        Route::get('/monitoring', [DashboardController::class, 'monitoring'])->name('monitoring');
        Route::get('/analytics', [DashboardController::class, 'analytics'])->name('analytics');
        Route::get('/reports', [DashboardController::class, 'reports'])->name('reports');
        
        // Exporting logic moved to its own controller
        Route::get('/export/excel', [ExportController::class, 'excel']);
        Route::get('/export/docx', [ExportController::class, 'docx']);
    });
});

// --- PUBLIC IMAGE ACCESS ---
Route::get('/news-image/{path}', function ($path) {
    $cleanPath = str_replace('\\', '/', $path);
    $filePath = storage_path('app/public/' . $cleanPath);
    if (!file_exists($filePath)) { abort(404); }
    return response()->file($filePath);
})->where('path', '.*');

require __DIR__.'/auth.php';