<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    // ==========================================
    // DATA ISOLATION LOGIC
    // ==========================================
    private function getBaseNewsQuery()
    {
        $user = auth()->user();
        $query = NewsArticle::where('status', 'approved');

        // If it's a regular Admin or User, ONLY show them news for their designated unit
        if (in_array($user->role, ['admin', 'user'])) {
            $query->where('unit_involved', $user->unit);
        }

        return $query;
    }

    public function index()
    {
        $user = auth()->user();
        $baseQuery = $this->getBaseNewsQuery();
        
        // Base stats used by both dashboards (Filtered by unit)
        $stats = [
            'total' => (clone $baseQuery)->count(),
            'favorable' => (clone $baseQuery)->where('category', 'Favorable')->count(),
            'neutral' => (clone $baseQuery)->where('category', 'Neutral')->count(),
            'unfavorable' => (clone $baseQuery)->where('category', 'Unfavorable')->count(),
        ];

        // ==========================================
        // COMMANDER'S ALL-IN-ONE VIEW
        // ==========================================
        if ($user && $user->role === 'commander') {
            
            // Get reports grouped by military unit
            $unitStats = (clone $baseQuery)
                ->selectRaw('unit_involved, count(*) as count')
                ->groupBy('unit_involved')
                ->get();

            // Get top 5 most discussed topics
            $topicStats = (clone $baseQuery)
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
                'recentNews' => (clone $baseQuery)->orderBy('date', 'desc')->limit(10)->get(),
            ]);
        }

        // ==========================================
        // STANDARD PERSONNEL DASHBOARD
        // ==========================================
        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentNews' => (clone $baseQuery)->orderBy('date', 'desc')->limit(5)->get(),
            'carouselNews' => (clone $baseQuery)->whereNotNull('image_path')->orderBy('date', 'desc')->limit(10)->get()
        ]);
    }

    public function settings()
    {
        $currentUser = auth()->user();
        $query = User::where('status', 'approved')->orderBy('updated_at', 'desc');

        if ($currentUser->role === 'super_admin') {
            // Super Admin sees all roles
        } elseif ($currentUser->role === 'admin') {
            // Admins can only see Users in THEIR unit
            $query->where('role', 'user')->where('unit', $currentUser->unit);
        } else {
            $query->where('id', -1); 
        }

        return Inertia::render('Settings', [
            'activeUsers' => $query->limit(15)->get()
        ]);
    }

    public function monitoring()
    {
        return Inertia::render('NewsMonitoring', [
            'news' => $this->getBaseNewsQuery()->orderBy('date', 'desc')->get()
        ]);
    }

    public function analytics()
    {
        return Inertia::render('Analytics', [
            'news' => $this->getBaseNewsQuery()->get()
        ]);
    }

    public function reports()
    {
        return Inertia::render('Reports', [
            'news' => $this->getBaseNewsQuery()->orderBy('date', 'desc')->get()
        ]);
    }
}