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
        // 1. Get the raw text from the frontend
        $request->validate([
            'content' => 'required|string'
        ]);

        $newsContent = $request->input('content');
        
        // 2. OpenRouter API Endpoint
        $url = 'https://openrouter.ai/api/v1/chat/completions';
        
        // 3. The Military Prompt Payload (Removed 'response_format' as free models often reject it)
        $data = [
            'model' => 'meta-llama/llama-3.1-8b-instruct:free',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a military intelligence analyst for the Eastern Mindanao Command (EMC). Analyze the provided news text and return ONLY a valid JSON object with no markdown formatting. The JSON must have these exact keys: "title" (a strong professional title), "summary" (a brief 1-2 sentence intelligence summary), "topic" (the main subject, e.g., Insurgency, Environment, Politics), and "category" (Must be exactly one of: "Favorable", "Neutral", or "Unfavorable").'
                ],
                [
                    'role' => 'user',
                    'content' => $newsContent
                ]
            ]
        ];

        // 4. Send the request via cURL
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . env('OPENROUTER_API_KEY'),
            'Content-Type: application/json',
            'HTTP-Referer: http://localhost:8000', // OpenRouter sometimes requires this
            'X-Title: EMC News System'
        ]);
        
        // Bypass SSL for Windows local servers
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); 

        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        // 5. Handle Network Errors
        if ($err) {
            return response()->json(['error' => 'cURL Network Error: ' . $err], 500);
        }

        // 6. Decode the OpenRouter response
        $result = json_decode($response, true);
        
        // 7. Check if the AI actually gave us a choice/response
        if (isset($result['choices'][0]['message']['content'])) {
            $rawContent = $result['choices'][0]['message']['content'];
            
            // CLEANUP FIX: Strip out markdown blocks if the AI added them by mistake
            $rawContent = preg_replace('/```json\s*/', '', $rawContent);
            $rawContent = preg_replace('/```\s*/', '', $rawContent);
            $rawContent = trim($rawContent);

            $aiData = json_decode($rawContent, true);
            
            if ($aiData) {
                return response()->json($aiData); // Success!
            } else {
                return response()->json(['error' => 'AI returned invalid text format instead of JSON.'], 500);
            }
        }

        // 8. If we reached here, OpenRouter sent an API error (like rate limits). Let's print it exactly!
        $openRouterError = isset($result['error']['message']) ? $result['error']['message'] : 'Unknown OpenRouter Error';
        return response()->json(['error' => 'OpenRouter says: ' . $openRouterError], 500);
    }
}