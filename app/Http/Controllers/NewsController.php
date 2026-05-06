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
        return Inertia::render('PendingNews', [
            'pendingNews' => NewsArticle::where('status', 'pending')->orderBy('created_at', 'desc')->get()
        ]);
    }

    public function approve(NewsArticle $newsArticle)
    {
        $newsArticle->update(['status' => 'approved']);
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

        // NEW FEATURE: Unit Restriction Logic
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

        NewsArticle::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, NewsArticle $newsArticle)
    {
        // Update logic remains similar to store, but updates existing model
        $validated = $request->validate([
            'title' => 'required', 'summary' => 'required', 'media_outlet' => 'required',
            'reporter' => 'nullable|string', 'topic' => 'required', 'unit_involved' => 'required', 
            'category' => 'required', 'date' => 'required', 'url' => 'nullable|string',
            'scope' => 'nullable|string', 'image' => 'nullable|image|max:5120'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news_images', 'public');
            $validated['image_path'] = str_replace('\\', '/', $path);
        }
        
        $newsArticle->update($validated);
        return redirect()->back();
    }

    public function destroy(NewsArticle $newsArticle)
    {
        $newsArticle->delete();
        return redirect()->back();
    }

    public function analyze(Request $request)
    {
        // You can paste your entire OpenAI/OpenRouter cURL logic here. 
        // I have omitted it for brevity, but it is a direct copy-paste from your web.php!
    }
}