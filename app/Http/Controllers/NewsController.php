<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class NewsController extends Controller
{
    public function create()
    {
        return Inertia::render('AddNews');
    }

    // Renders the dedicated Open-Source Media Radar screen via Inertia
    public function publicStream()
    {
        return Inertia::render('PublicStream');
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
        \App\Models\ActivityLog::log('Approved News', "Approved report: '{$newsArticle->title}'");

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
            'image' => 'nullable|image|max:40000' 
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
        \App\Models\ActivityLog::log($logAction, "Added report: '{$news->title}' for unit {$news->unit_involved}");

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
            'scope' => 'nullable|string', 'image' => 'nullable|image|max:40000'
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
        \App\Models\ActivityLog::log('Edited News', "Updated report: '{$newsArticle->title}'");

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

    // LIVE STREAM AGGREGATOR: Bulletproof filtering for Philippines vs International
    public function searchPublicNews(Request $request)
    {
        $userInput = $request->query('query');
        $scopeFilter = $request->query('scope', 'Philippines'); 
        
        // Base military keywords
        $militaryBoundaryFilter = '(military OR navy OR "air force" OR "airforce" OR "armed forces" OR encounter OR afp OR army OR EastMinCom OR "Eastern Mindanao Command" OR 10ID OR 4ID OR clash OR insurgency OR defense OR soliman OR "tactical operations")';
        
        // Rolling 2-month boundary
        $twoMonthsAgoDate = date('Y-m-d', strtotime('-2 months'));
        $rollingDateBoundaryFilter = 'after:' . $twoMonthsAgoDate;
        
        // Define base user search
        if (empty($userInput)) {
            $baseSearch = '("Eastern Mindanao Command" OR "EastMinCom" OR "10th Infantry Division" OR "4th Infantry Division")';
        } else {
            $baseSearch = '(' . $userInput . ')';
        }
        
        // DYNAMIC TARGET PROFILE RESOLUTION: Enforce strict geo-boundaries via operators
        if (strtolower($scopeFilter) === 'international') {
            // INTERNATIONAL: Actively exclude .ph local domains and set US global parameters
            $searchTerm = $baseSearch . ' ' . $militaryBoundaryFilter . ' ' . $rollingDateBoundaryFilter . ' -site:.ph';
            $url = 'https://news.google.com/rss/search?q=' . urlencode($searchTerm) . '&hl=en-US&gl=US&ceid=US:en';
        } else {
            // PHILIPPINES: Force the location:philippines operator to restrict results natively
            $searchTerm = $baseSearch . ' ' . $militaryBoundaryFilter . ' ' . $rollingDateBoundaryFilter . ' location:philippines';
            $url = 'https://news.google.com/rss/search?q=' . urlencode($searchTerm) . '&hl=en-PH&gl=PH&ceid=PH:en';
        }
        
        try {
            if (app()->environment('local')) {
                $response = Http::timeout(10)->withoutVerifying()->get($url);
            } else {
                $response = Http::timeout(10)->get($url);
            }

            if ($response->failed()) {
                return response()->json(['error' => 'Failed to reach public news network.'], 500);
            }
            
            $xml = simplexml_load_string($response->body());
            $articles = [];
            
            $currentYear = date('Y');
            $cutoffTimestamp = strtotime('-2 months midnight');

            if ($xml && isset($xml->channel->item)) {
                foreach ($xml->channel->item as $item) {
                    $pubDateStr = (string) $item->pubDate;
                    $articleTimestamp = strtotime($pubDateStr);

                    // Skip anything older than 2 months ago
                    if ($articleTimestamp < $cutoffTimestamp) {
                        continue;
                    }

                    // Drop items if they aren't from the current year (2026)
                    if (date('Y', $articleTimestamp) !== $currentYear) {
                        continue;
                    }

                    $rawTitle = (string) $item->title;
                    $titleParts = explode(' - ', $rawTitle);
                    $cleanTitle = trim($titleParts[0]);
                    $source = isset($titleParts[1]) ? trim($titleParts[1]) : 'Public Media';
                    
                    $articles[] = [
                        'title' => $cleanTitle,
                        'url' => (string) $item->link,
                        'media_outlet' => $source,
                        'date' => date('Y-m-d', $articleTimestamp),
                    ];
                }
            }

            // Chronological Sort
            usort($articles, function ($a, $b) {
                return strcmp($b['date'], $a['date']);
            });
            
            return response()->json($articles);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Network error: ' . $e->getMessage()], 500);
        }
    }

    // AUTOMATED TEXT SCRAPING ANALYSIS ROUTINE
    public function analyze(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string',
            'url' => 'nullable|string',
            'title' => 'nullable|string',
            'media_outlet' => 'nullable|string',
            'date' => 'nullable|string'
        ]);

        $newsContent = $request->input('content');
        $urlInput = $request->input('url');
        $titleInput = $request->input('title');
        $mediaInput = $request->input('media_outlet');
        $dateInput = $request->input('date');

        if (empty($newsContent) && !empty($urlInput)) {
            try {
                $webResponse = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                ])->timeout(10)->withoutVerifying()->get($urlInput);

                if ($webResponse->successful()) {
                    $html = $webResponse->body();
                    $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', "", $html);
                    $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', "", $html);
                    $newsContent = trim(html_entity_decode(strip_tags($html)));
                    $newsContent = preg_replace('/\s+/', ' ', $newsContent);
                    $newsContent = substr($newsContent, 0, 20000);
                }
            } catch (\Exception $e) {
                // Suppress and failover to metadata mode smoothly
            }
        }

        // METADATA FALLBACK
        if (empty($newsContent) || strlen($newsContent) < 150) {
            $newsContent = "ANALYSIS BOUNDARY INSTRUCTION: Direct webpage text parsing was restricted by host firewall protections. Synthesize and reconstruct the operational parameters for this record based on its verified public metadata indices:
            - Target Headline: {$titleInput}
            - Publisher Network: {$mediaInput}
            - Publication Date: {$dateInput}
            - Source URL Pathway: {$urlInput}
            
            Use your advanced military reasoning capabilities to draft a concise, professional 1-2 sentence executive operational summary matching this exact headline context, track down the correct strategic dropdown fields, and map all variables to the JSON specification parameters completely.";
        }

        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey)) {
            return response()->json(['error' => 'System configuration error: Missing Gemini API Key.'], 500);
        }

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;

        $validUnits = "Eastern Mindanao Command (EastMinCom) Headquarters, Naval Forces Eastern Mindanao (NFEM), Tactical Operations Group 10 (TOG 10), 4th Infantry Division (4ID), 10th Infantry Division (10ID)";
        $validTopics = "Accomplishment, Checkpoint Seizure, FRs Reconciliation, HADR Operations, CTG Mem Surrender, Surrender/Arms Cache, Encounter, Arms Cache, Culture of Security, Destabilization, NPA Dismantling, Unit Installation, E-CLIP Programs, NPA Ambush/Atrocity, Outreach Program, Commemoration, CSP, New Year's Call, POs Programs, New/Upgraded Facility, New Commander/Officer, Security Operations, Unit Visit, Blood Donation, Killed Soldier, Reservist Affairs, BGen Durante Case, Unit Anniversary, NPA Arrest, New Assets, CTG Mem Abduction, POs Issues/Concerns, Persona Non-Grata, Harassment by Troops, ITDS Sustainment, MILF Holding of Troops, Sportsfest, Troops Education, Camp Shooting, Drug Involvement, AFP Recruitment, Morale & Welfare, Soldier Recognition, Partners Engagement, Training/Exercise, Bomb/IED Retrieval, Spiritual Enhancement, BDP Project, Killed NPA Assitance, Chad Booc Death, NPA Condemnation, FCEMC Appointment, POC Engagements, GAD, Int'l Military Visit, Youth Empowerment, Farewell Visit, Govt Official Killing, Insurgency-Free, Ex-Troops Monitoring, Campaign Plan, Peace Forum, Stakeholder Support, Stakeholder Visit, MOA/Partnership, Environmental Activity, Search Operation, Promotion, PAGs Update, Aerial/Artillery Bombing, Illegal Firearms, Pilgram Visit, Kidnapped Civilians, Transport Assistance, Security Update, Peace Rally, Symposium, CTG Monitoring, Civilian Killing, AOR Expansion, Fake Soldier, Event Participation, CORPAT, Illegal Mining, FB Page Hacking, Unit Recognition, Unit Send-Off, Bomb Explosion/Scare, Friendly Games, Smuggling Apprehension, PMA Examination, Extrajudicial Killings, Peace Monument, White Area Operations, Election Security, Stress Debriefing, New Soldiers, Ceasefire, Ramming Incident, Troop Accident";

        $systemPrompt = 'You are a operational media analyst for the Eastern Mindanao Command (EMC). Analyze the provided unstructured text content page and return ONLY a valid JSON object. Do not include markdown wraps.
        The JSON must have these exact keys and format constraints:
        - "title": a strong professional headline matching the true article context.
        - "summary": a brief 1-2 sentence operational summary detailing the main operational metrics.
        - "category": Must be exactly one of: "Favorable", "Neutral", or "Unfavorable".
        - "media_outlet": the news source/media outlet name.
        - "reporter": the journalist name, or empty string if not found.
        - "scope": Must be exactly one of: "Local", "National", or "International".
        - "url": the source link path.
        - "date": the date of the news in YYYY-MM-DD format.
        
        CRITICAL DROPDOWN MATCHING RULES:
        - "unit_involved": You MUST choose the closest match from this list ONLY: [' . $validUnits . ']. Do not abbreviate or change words.
        - "topic": You MUST choose the single closest matching topic from this list ONLY: [' . $validTopics . ']. Do not invent new topics.';

        $combinedPrompt = $systemPrompt . "\n\nNews to Analyze:\n" . $newsContent;

        $data = [
            'contents' => [['parts' => [['text' => $combinedPrompt]]]],
            'generationConfig' => ['responseMimeType' => 'application/json']
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 35); 
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15); 

        if (app()->environment('local')) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        }

        $response = curl_exec($ch);
        $err = curl_error($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($err) return response()->json(['error' => 'cURL Error: ' . $err], 500);
        if ($httpCode !== 200) return response()->json(['error' => 'Gemini Registry Error: ' . $response], 500);

        $result = json_decode($response, true);
        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            $rawContent = $result['candidates'][0]['content']['parts'][0]['text'];
            $rawContent = preg_replace('/```json\s*/', '', $rawContent);
            $rawContent = preg_replace('/```\s*/', '', $rawContent);
            $rawContent = trim($rawContent);

            $aiData = json_decode($rawContent, true);
            if ($aiData) {
                return response()->json($aiData);
            }
        }
        return response()->json(['error' => 'Gemini structure processing failed.'], 500);
    }
}