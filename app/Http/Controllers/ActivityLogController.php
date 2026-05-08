<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Fetch logs with pagination and search filtering
        $logs = ActivityLog::with('user:id,name,unit,role')
            ->when($search, function ($query, $search) {
                $query->where('action', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('user', function($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%")
                            ->orWhere('unit', 'like', "%{$search}%");
                      });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(50) // ONLY LOAD 50 AT A TIME
            ->withQueryString(); // Keep the search term in the URL when clicking Next Page

        return Inertia::render('ActivityLogs', [
            'logs' => $logs,
            'filters' => ['search' => $search]
        ]);
    }
}