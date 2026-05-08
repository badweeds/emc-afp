<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;
use Inertia\Inertia;

class NewsController extends Controller
{
    public function create()
    {
        return Inertia::render('AddNews');
    }

    public function pending()
    {
        $user = auth()->user();
        $query = NewsArticle::where('status', 'pending')->orderBy('created_at', 'desc');

        // DATA ISOLATION: Admins only see Pending News for their Unit
        if ($user->role === 'admin') {
            $query->where('unit_involved', $user->unit);
        }

        return Inertia::render('PendingNews', [
            // Ensure the variable name matches what your PendingNews.tsx expects ('pendingNews' or 'news')
            'pendingNews' => $query->get()
        ]);
    }

    public function approve(NewsArticle $newsArticle)
    {
        $user = auth()->user();

        // SECURITY LOCK: Ensure Admin owns this unit's news
        if ($user->role === 'admin' && $newsArticle->unit_involved !== $user->unit) {
            abort(403, 'Unauthorized action. You can only approve news for your unit.');
        }

        $newsArticle->update(['status' => 'approved']);
        
        // ACTIVITY LOG: Track the approval
        \App\Models\ActivityLog::log('Approved News', "Approved intelligence report: '{$newsArticle->title}'");

        return redirect()->back();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required', 
            'summary' => 'required', 
            'media_outlet' => 'required',
            'reporter' => 'nullable|string', 
            'topic' => 'required', 
            'category' => 'required',
            'date' => 'required', 
            'url' => 'nullable|string',
            'scope' => 'nullable|string',
            'image' => 'nullable|image|max:5120' 
        ]);

        $user = auth()->user();

        // Unit Restriction Logic
        if (in_array($user->role, ['admin', 'user'])) {
            // Admins and Users are forced to post under their assigned unit
            $validated['unit_involved'] = $user->unit; 
        } else {
            // Super Admin can post to any unit, so we take it from the form
            $validated['unit_involved'] = $request->unit_involved; 
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news_images', 'public');
            $validated['image_path'] = str_replace('\\', '/', $path);
        }

        // Logic assigns 'approved' to admins/super_admins, 'pending' to regular users
        $validated['status'] = in_array($user->role, ['admin', 'super_admin']) ? 'approved' : 'pending';

        $news = NewsArticle::create($validated);

        // ACTIVITY LOG: Track creation
        $logAction = $validated['status'] === 'approved' ? 'Created & Approved News' : 'Submitted Pending News';
        \App\Models\ActivityLog::log($logAction, "Added intelligence report: '{$news->title}' for unit {$news->unit_involved}");

        return redirect()->back();
    }

    public function update(Request $request, NewsArticle $newsArticle)
    {
        $user = auth()->user();

        // SECURITY LOCK: Ensure Admin owns this unit's news before allowing an edit
        if ($user->role === 'admin' && $newsArticle->unit_involved !== $user->unit) {
            abort(403, 'Unauthorized action. You can only edit news for your unit.');
        }

        $validated = $request->validate([
            'title' => 'required', 'summary' => 'required', 'media_outlet' => 'required',
            'reporter' => 'nullable|string', 'topic' => 'required', 'unit_involved' => 'required', 
            'category' => 'required', 'date' => 'required', 'url' => 'nullable|string',
            'scope' => 'nullable|string', 'image' => 'nullable|image|max:5120'
        ]);

        // Prevent admin from maliciously changing the unit_involved to bypass isolation
        if ($user->role === 'admin') {
            $validated['unit_involved'] = $user->unit;
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news_images', 'public');
            $validated['image_path'] = str_replace('\\', '/', $path);
        }
        
        $newsArticle->update($validated);

        // ACTIVITY LOG: Track the update
        \App\Models\ActivityLog::log('Edited News', "Updated intelligence report: '{$newsArticle->title}'");

        return redirect()->back();
    }

    public function destroy(NewsArticle $newsArticle)
    {
        $user = auth()->user();

        // SECURITY LOCK: Ensure Admin owns this unit's news before allowing a deletion
        if ($user->role === 'admin' && $newsArticle->unit_involved !== $user->unit) {
            abort(403, 'Unauthorized action. You can only delete news for your unit.');
        }

        // Save the title before deleting so we can log it
        $deletedTitle = $newsArticle->title;
        
        $newsArticle->delete();

        // ACTIVITY LOG: Track the deletion
        \App\Models\ActivityLog::log('Deleted News', "Permanently deleted report: '{$deletedTitle}'");

        return redirect()->back();
    }

    public function analyze(Request $request)
    {
        // OpenAI / OpenRouter cURL Logic lives here
    }
}