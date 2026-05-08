<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index()
    {
        // Get all logs, including the user's name and unit who performed the action
        $logs = ActivityLog::with('user:id,name,unit,role')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('ActivityLogs', [
            'logs' => $logs
        ]);
    }
}