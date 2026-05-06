<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Base stats used by both dashboards
        $stats = [
            'total' => NewsArticle::where('status', 'approved')->count(),
            'favorable' => NewsArticle::where('status', 'approved')->where('category', 'Favorable')->count(),
            'neutral' => NewsArticle::where('status', 'approved')->where('category', 'Neutral')->count(),
            'unfavorable' => NewsArticle::where('status', 'approved')->where('category', 'Unfavorable')->count(),
        ];

        // ==========================================
        // COMMANDER'S ALL-IN-ONE VIEW
        // ==========================================
        if ($user && $user->role === 'commander') {
            
            // Get reports grouped by military unit
            $unitStats = NewsArticle::where('status', 'approved')
                ->selectRaw('unit_involved, count(*) as count')
                ->groupBy('unit_involved')
                ->get();

            // Get top 5 most discussed topics
            $topicStats = NewsArticle::where('status', 'approved')
                ->selectRaw('topic, count(*) as count')
                ->groupBy('topic')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get();

            return Inertia::render('CommanderDashboard', [
                'stats' => $stats,
                'unitStats' => $unitStats,
                'topicStats' => $topicStats,
                // Commander gets the 10 most recent feed items
                'recentNews' => NewsArticle::where('status', 'approved')->orderBy('date', 'desc')->limit(10)->get(),
            ]);
        }

        // ==========================================
        // STANDARD PERSONNEL DASHBOARD
        // ==========================================
        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentNews' => NewsArticle::where('status', 'approved')->orderBy('date', 'desc')->limit(5)->get(),
            'carouselNews' => NewsArticle::where('status', 'approved')->whereNotNull('image_path')->orderBy('date', 'desc')->limit(10)->get()
        ]);
    }

    public function settings()
    {
        $currentUser = auth()->user();
        $query = User::where('status', 'approved')->orderBy('updated_at', 'desc');

        if ($currentUser->role === 'super_admin') {
            // Super Admin sees all roles
        } elseif ($currentUser->role === 'admin') {
            $query->where('role', 'user');
        } else {
            $query->where('id', -1); 
        }

        return Inertia::render('Settings', [
            'activeUsers' => $query->limit(15)->get()
        ]);
    }

    public function monitoring()
    {
        return Inertia::render('NewsMonitoring', ['news' => NewsArticle::where('status', 'approved')->orderBy('date', 'desc')->get()]);
    }

    public function analytics()
    {
        return Inertia::render('Analytics', ['news' => NewsArticle::where('status', 'approved')->get()]);
    }

    public function reports()
    {
        return Inertia::render('Reports', ['news' => NewsArticle::where('status', 'approved')->orderBy('date', 'desc')->get()]);
    }
}