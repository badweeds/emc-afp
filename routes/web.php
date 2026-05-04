<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\NewsArticle;
use App\Models\User;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\NewsExport;
use App\Http\Controllers\Auth\GoogleController;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;
use Illuminate\Support\Str;

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
Route::middleware(['auth', 'verified'])->group(function () {
    
    // --- 1. DYNAMIC DASHBOARD (Handles Commander vs Personnel) ---
    Route::get('/dashboard', function () {
        $user = auth()->user();
        
        $stats = [
            'total' => NewsArticle::where('status', 'approved')->count(),
            'favorable' => NewsArticle::where('status', 'approved')->where('category', 'Favorable')->count(),
            'neutral' => NewsArticle::where('status', 'approved')->where('category', 'Neutral')->count(),
            'unfavorable' => NewsArticle::where('status', 'approved')->where('category', 'Unfavorable')->count(),
        ];
        $recentNews = NewsArticle::where('status', 'approved')->orderBy('date', 'desc')->limit(5)->get();

        // If the user is a Commander, send them to their exclusive view!
        if ($user && $user->role === 'commander') {
            return Inertia::render('CommanderDashboard', [
                'stats' => $stats,
                'recentNews' => $recentNews,
            ]);
        }

        // For Super Admin, Admin, and User
        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentNews' => $recentNews,
            'carouselNews' => NewsArticle::where('status', 'approved')->whereNotNull('image_path')->orderBy('date', 'desc')->limit(10)->get()
        ]);
    })->name('dashboard');

    // --- 2. SETTINGS (Everyone) ---
    Route::get('/settings', function () {
        return Inertia::render('Settings', [
            'activeUsers' => User::where('status', 'approved')->orderBy('updated_at', 'desc')->limit(10)->get()
        ]);
    })->name('settings');
    Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');
    Route::delete('/settings/account', [ProfileController::class, 'destroy'])->name('settings.account.destroy');

    // --- 3. SUPER ADMIN ONLY (User Management) ---
    Route::middleware(['role:super_admin'])->group(function () {
        Route::get('/admin/users', function () {
            return Inertia::render('UserManagement', [
                'users' => User::orderBy('created_at', 'desc')->get()
            ]);
        })->name('admin.users');

        Route::post('/admin/users/{user}/approve', function (User $user) {
            $user->update(['status' => 'approved']);
            return back();
        })->name('admin.users.approve');

        Route::delete('/admin/users/{user}', function (User $user) {
            $user->delete();
            return back();
        })->name('admin.users.reject');
    });

    // --- 4. ADMIN & SUPER ADMIN ONLY (Approvals, Editing, Deleting) ---
    Route::middleware(['role:admin,super_admin'])->group(function () {
        Route::get('/admin/news/pending', function () {
            return Inertia::render('PendingNews', [
                'pendingNews' => NewsArticle::where('status', 'pending')->orderBy('created_at', 'desc')->get()
            ]);
        })->name('admin.news.pending');

        Route::post('/admin/news/{newsArticle}/approve', function (NewsArticle $newsArticle) {
            $newsArticle->update(['status' => 'approved']);
            return redirect()->back();
        })->name('admin.news.approve');

        Route::post('/news/{newsArticle}', function (Request $request, NewsArticle $newsArticle) {
            $validated = $request->validate([
                'title' => 'required', 
                'summary' => 'required', 
                'media_outlet' => 'required',
                'reporter' => 'nullable|string', 
                'topic' => 'required', 
                'unit_involved' => 'required', 
                'category' => 'required',
                'date' => 'required', 
                'url' => 'nullable|string',
                'scope' => 'nullable|string',
                'image' => 'nullable|image|max:5120'
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('news_images', 'public');
                $validated['image_path'] = str_replace('\\', '/', $path);
            }
            
            unset($validated['image']);

            $newsArticle->update($validated);
            return redirect()->back();
        });

        Route::delete('/news/{newsArticle}', function (NewsArticle $newsArticle) {
            $newsArticle->delete();
            return redirect()->back();
        });
    });

    // --- 5. EVERYONE EXCEPT COMMANDER (Can Add & AI Analyze News) ---
    Route::middleware(['role:user,admin,super_admin'])->group(function () {
        Route::get('/add-news', function () {
            return Inertia::render('AddNews');
        });

        Route::post('/news', function (Request $request) {
            $validated = $request->validate([
                'title' => 'required', 
                'summary' => 'required', 
                'media_outlet' => 'required',
                'reporter' => 'nullable|string', 
                'topic' => 'required', 
                'unit_involved' => 'required', 
                'category' => 'required',
                'date' => 'required', 
                'url' => 'nullable|string',
                'scope' => 'nullable|string',
                'image' => 'nullable|image|max:5120' 
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('news_images', 'public');
                $validated['image_path'] = str_replace('\\', '/', $path);
            }

            unset($validated['image']);

            // Logic assigns 'approved' to admins/super_admins, 'pending' to regular users
            $validated['status'] = in_array(auth()->user()->role, ['admin', 'super_admin']) ? 'approved' : 'pending';

            NewsArticle::create($validated);
            return redirect()->back();
        });

        Route::post('/analyze-news', function (Request $request) {
            $request->validate(['content' => 'required|string']);

            $apiKey = config('app.openrouter_api_key', env('OPENROUTER_API_KEY'));
            
            if (empty($apiKey)) {
                return response()->json(['error' => 'OpenRouter API Key is missing from the .env file.'], 500);
            }
            
            $localMedia = "Mindanao Times, RMN DXDC 621 Davao, SunStar Davao, News Fort, Bombo Radyo Davao, PTV Davao, Radyo Pilipinas Davao, Edge Davao, MDDN, Mindanao Today, MindaNews, Bombo Radyo CDO, SunStar Zamboanga, CIO Davao City, SunStar CDO, Radyo Pilipinas Butuan, Mindanao Gold Star Daily, Bombo Radyo Butuan, Brigada News Agusan, RMN Malaybalay, Mindanao Journal, Superbalita Davao, Mindanao Examiner, Brigada News Gensan, Brigada News CDO, Brigada News Butuan, Central Minda Newswatch, News NOW, PIA Caraga Region, PIA Davao Region, RPN DXKO CDO, Davao Today, NDBC News, CDO Today, Bombo Radyo Iloilo, One Mindanao, PLN Media, Radyo Bandera Iloilo, Watchmen Daily Journal, RPN";
            $nationalMedia = "PNA, PIA, Manila Bulletin, Kalinaw News, Newsline Philippines, Philippine Daily Inquirer, The Manila Times, Rappler, The Philippine Star, SMNI News, PRWC, Daily Tribune, GMA News, ABS-CBN News, DZAR 1026, Business Mirror, Bombo Radyo PH, Malaya Business Insight, Manila Standard, People's Tonight, Remate, Abante, Global Daily Mirror, RMN Manila, Balita, CNN Philippines, Kidlat News Channel, Net25 News, One News, PTV, Radyo Agila, Radyo Inquirer, Journal News Online, Dailymotion, Filipino News, PageOne PH, Radyo Pilipinas, Radyo Pilipinas Manila, News 5, ANC, Brigada News PH, Bulgar Online, DWDD, DZRH, Radyo Natin Nationwide, Tempo, UNTV News and Rescue, Maharlika TV, Super Radyo DZBB";
            $internationalMedia = "News Beezer, Benar News, Republic Asia Media, News 360, Reuters, US News";

            $systemPrompt = 'You are an expert military intelligence analyst based in the Philippines (Davao Region). 
            Extract the details from the user\'s text and output ONLY a valid JSON object matching these exact keys:
            {
                "summary": "The FULL, comprehensive body of the news article, completely cleaned of website junk. Retain all original article paragraphs, important details, and quotes. CRITICAL: You MUST explicitly remove copy-paste boilerplate text such as \'Share\', \'Copy Link\', \'Facebook\', \'X\', \'Article continues after this advertisement\', \'Subscribe to our daily newsletter\', email signups, and the author/date lines at the beginning or end. Do NOT summarize; provide the full, clean text. Preserve paragraph breaks using \n.",
                "category": "Sentiment towards the military/government. Exactly one of: Favorable, Neutral, Unfavorable",
                "title": "The headline of the article (or generate one if missing)",
                "reporter": "The name of the reporter/author (or empty string if not found)",
                "url": "Any website link found in the text (or empty string if not found)",
                "media_outlet": "CRITICAL: You MUST map the publisher EXACTLY to one of the names in the Local, National, or International lists provided below. Example: If you read \'Inquirer\', you MUST output \'Philippine Daily Inquirer\'. If you read \'SunStar\', you MUST output \'SunStar Davao\'. If you absolutely cannot find a match, output the name as it appears in the text.",
                "scope": "Must be exactly one of: Local, National, International. Rule: If the media_outlet is in the Local List, scope MUST be Local. If in National List, scope MUST be National.",
                "unit_involved": "Must be exactly one of: Eastern Mindanao Command (EastMinCom) Headquarters, Naval Forces Eastern Mindanao (NFEM), Tactical Operations Group 10 (TOG 10), 4th Infantry Division (4ID), 10th Infantry Division (10ID)",
                "topic": "Determine the most relevant topic. Must be exactly one of: Accomplishment, Checkpoint Seizure, FRs Reconciliation, HADR Operations, CTG Mem Surrender, Surrender/Arms Cache, Encounter, Arms Cache, Culture of Security, Destabilization, NPA Dismantling, Unit Installation, E-CLIP Programs, NPA Ambush/Atrocity, Outreach Program, Commemoration, CSP, New Year\'s Call, POs Programs, New/Upgraded Facility, New Commander/Officer, Security Operations, Unit Visit, Blood Donation, Killed Soldier, Reservist Affairs, BGen Durante Case, Unit Anniversary, NPA Arrest, New Assets, CTG Mem Abduction, POs Issues/Concerns, Persona Non-Grata, Harassment by Troops, ITDS Sustainment, MILF Holding of Troops, Sportsfest, Troops Education, Camp Shooting, Drug Involvement, AFP Recruitment, Morale & Welfare, Soldier Recognition, Partners Engagement, Training/Exercise, Bomb/IED Retrieval, Spiritual Enhancement, BDP Project, Killed NPA Assitance, Chad Booc Death, NPA Condemnation, FCEMC Appointment, POC Engagements, GAD, Int\'l Military Visit, Youth Empowerment, Farewell Visit, Govt Official Killing, Insurgency-Free, Ex-Troops Monitoring, Campaign Plan, Peace Forum, Stakeholder Support, Stakeholder Visit, MOA/Partnership, Environmental Activity, Search Operation, Promotion, PAGs Update, Aerial/Artillery Bombing, Illegal Firearms, Pilgram Visit, Kidnapped Civilians, Transport Assistance, Security Update, Peace Rally, Symposium, CTG Monitoring, Civilian Killing, AOR Expansion, Fake Soldier, Event Participation, CORPAT, Illegal Mining, FB Page Hacking, Unit Recognition, Unit Send-Off, Bomb Explosion/Scare, Friendly Games, Smuggling Apprehension, PMA Examination, Extrajudicial Killings, Peace Monument, White Area Operations, Election Security, Stress Debriefing, New Soldiers, Ceasefire, Ramming Incident, Troop Accident",
                "date": "The date of the news article in YYYY-MM-DD format. If no date is found, leave blank."
            }
            
            Local List: ' . $localMedia . '
            National List: ' . $nationalMedia . '
            International List: ' . $internationalMedia;

            $payload = json_encode([
                'model' => 'openai/gpt-4o-mini',
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => 'Text to Analyze: ' . $request->content]
                ]
            ]);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://openrouter.ai/api/v1/chat/completions");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            
            $headers = [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $apiKey,
                'HTTP-Referer: http://localhost',
                'X-OpenRouter-Title: EMC Dashboard'
            ];
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            $response = curl_exec($ch);
            $err = curl_error($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $close = curl_close($ch);

            if ($err) {
                return response()->json(['error' => 'cURL Error: ' . $err], 500);
            }

            $result = json_decode($response, true);
            
            if ($httpCode !== 200 || isset($result['error'])) {
                $apiError = $result['error']['message'] ?? 'Unknown OpenRouter API Error';
                return response()->json(['error' => "OpenRouter Error ($httpCode): $apiError"], 500);
            }

            $aiText = $result['choices'][0]['message']['content'] ?? '{}';
            
            $aiText = str_replace(['```json', '```'], '', $aiText);
            $decoded = json_decode(trim($aiText), true);

            if (json_last_error() === JSON_ERROR_NONE) {
                return response()->json($decoded);
            } else {
                return response()->json(['error' => 'AI returned malformed data.'], 500);
            }
        });
    });

    // --- 6. READ-ONLY MONITORS (Admin, Super Admin, Commander) ---
    Route::middleware(['role:admin,super_admin,commander'])->group(function () {
        Route::get('/monitoring', function () {
            return Inertia::render('NewsMonitoring', ['news' => NewsArticle::where('status', 'approved')->orderBy('date', 'desc')->get()]);
        })->name('monitoring');

        Route::get('/analytics', function () {
            return Inertia::render('Analytics', ['news' => NewsArticle::where('status', 'approved')->get()]);
        })->name('analytics');

        Route::get('/reports', function () {
            return Inertia::render('Reports', ['news' => NewsArticle::where('status', 'approved')->orderBy('date', 'desc')->get()]);
        })->name('reports');

        Route::get('/export/excel', function () {
            return Excel::download(new NewsExport, 'PIO_EMC_Yearly_News_Data.xlsx');
        });

        Route::get('/export/docx', function (Request $request) {
            $from = $request->query('from');
            $to = $request->query('to');
            
            // Only fetch APPROVED news
            $news = NewsArticle::where('status', 'approved')
                        ->whereBetween('date', [$from, $to])
                        ->orderBy('date', 'asc')->get();
            
            // Fetch Top 3 Critical News for the CIEMA Section (Only APPROVED)
            $criticalNews = NewsArticle::where('status', 'approved')
                            ->whereBetween('date', [$from, $to])
                            ->where('category', 'Unfavorable')
                            ->limit(3)
                            ->get();

            // !!! XML PARSING FIX (Crucial for preventing Word corruption with &, <, > characters) !!!
            \PhpOffice\PhpWord\Settings::setOutputEscapingEnabled(true);

            $phpWord = new PhpWord();
            $section = $phpWord->addSection();
            
            // COVER PAGE
            $section->addTextBreak(2);
            $section->addText("TEAM EASTMINCOM", ['name' => 'Arial', 'size' => 36, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $section->addTextBreak(1);
            $section->addText("Follow us on our social media accounts:", ['name' => 'Arial', 'size' => 16], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $section->addText("@eastmincomafp", ['name' => 'Arial', 'size' => 16, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $section->addText("@eastmincom_afp", ['name' => 'Arial', 'size' => 16, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $section->addTextBreak(2);
            $section->addText("Public Information Office", ['name' => 'Arial', 'size' => 28, 'bold' => true, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $section->addText("eastmincom.pio2014@gmail.com", ['name' => 'Arial', 'size' => 16, 'bold' => true, 'underline' => 'single', 'color' => '0000FF'], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $section->addTextBreak(2);
            $dateText = date('d', strtotime($from)) . '-' . date('d F Y', strtotime($to));
            $section->addText("Daily News Monitoring", ['name' => 'Arial', 'size' => 24, 'bold' => true, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $section->addText($dateText, ['name' => 'Arial', 'size' => 24, 'bold' => true, 'italic' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            
            $section->addPageBreak();

            // =========================================================================
            // CIEMA REPORT PAGE (v.3 Addition)
            // =========================================================================
            $section->addText("COMMANDER’S INFORMATION ENVIRONMENT MONITORING & ASSESSMENT (CIEMA)", ['name' => 'Arial', 'size' => 12, 'bold' => true], ['alignment' => Jc::CENTER]);
            $timeRange = "1700H " . date('d', strtotime($from)) . " – 1700H " . date('d F Y', strtotime($to));
            $section->addText($timeRange, ['name' => 'Arial', 'size' => 11, 'bold' => true], ['alignment' => Jc::CENTER]);
            $section->addTextBreak(1);

            // Section 1: IE Status
            $section->addText("1. INFORMATION ENVIRONMENT STATUS: HIGHLY SENSITIVE SOVEREIGNTY AND ENVIRONMENTAL SECURITY NARRATIVE WITH STRONG ALLIANCE AND INTERNAL STABILITY DRIVERS", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
            $section->addText("The Information Environment during the reporting period is highly sensitive and strategically elevated, driven by intensified maritime security and environmental concerns in the West Philippine Sea (WPS). Reports alleging the use of cyanide by Chinese maritime militia near the BRP Sierra Madre significantly heighten the gravity of the situation, expanding the narrative from sovereignty disputes to environmental degradation and threats to personnel and resources. This development amplifies national and international attention and reinforces urgency in maritime protection efforts.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
            $section->addText("Simultaneously, alliance-driven narratives remain prominent through ongoing multilateral maritime cooperative activities involving the Philippines, United States, and Australia. These joint drills, particularly focused on logistics interoperability, reinforce collective security posture and operational readiness in the WPS, contributing to deterrence and regional stability.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
            $section->addText("At the regional level, the Information Environment remains stable and institutionally positive, supported by sustained civil-military operations and internal security gains. Initiatives such as joint coastal patrols and whole-of-nation peace and development approaches highlight continued community engagement and the consolidation of gains against insurgent threats.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);

            // Section 2: Top 3 Critical
            $section->addText("2. TOP 3 CRITICAL CASUALTIES & DISPLACEMENT", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
            foreach ($criticalNews as $item) {
                $section->addText($item->title, ['name' => 'Arial', 'size' => 10, 'bold' => true]);
                $paragraphs = explode("\n", $item->summary);
                $firstParagraph = '';
                foreach ($paragraphs as $p) {
                    $p = trim($p);
                    if (!empty($p)) { $firstParagraph = $p; break; }
                }
                $section->addText(Str::limit($firstParagraph, 300), ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
            }
            $section->addTextBreak(1);

            // Section 3: Risk Assessment Table
            $section->addText("3. RISK ASSESSMENT SNAPSHOT (TABULATED)", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
            $riskTableStyle = ['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 50];
            $phpWord->addTableStyle('RiskTable', $riskTableStyle);
            $tableRisk = $section->addTable('RiskTable');
            $tableRisk->addRow();
            foreach(['Issue', 'HIS', 'MAL', 'IE', 'NV', 'SS', 'TTL', 'Risk Level'] as $header) {
                $tableRisk->addCell(1500, ['bgColor' => 'EEEEEE'])->addText($header, ['bold' => true, 'size' => 9], ['alignment' => Jc::CENTER]);
            }
            if ($criticalNews->count() > 0) {
                $tableRisk->addRow();
                $tableRisk->addCell(3000)->addText($criticalNews->first()->topic ?? 'Security Threat', ['size' => 9]);
                foreach([5, 5, 5, 4, 5, 24] as $val) {
                    $tableRisk->addCell(500)->addText($val, ['size' => 9], ['alignment' => Jc::CENTER]);
                }
                $tableRisk->addCell(1500, ['bgColor' => 'FF0000'])->addText("CRITICAL", ['size' => 9, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::CENTER]);
            }
            $section->addTextBreak(1);

            // Section 4: Narrative Trend
            $section->addText("4. NARRATIVE TREND", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
            $section->addText("The dominant narrative during the reporting period is sovereignty-driven with a strong environmental security dimension. The alleged cyanide use near Ayungin Shoal introduces a critical shift in discourse, linking maritime disputes to ecological damage, food security risks, and potential harm to deployed personnel. This significantly elevates the sensitivity and urgency of the information environment.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
            $section->addText("Adversarial framing is highly evident, with foreign maritime activities portrayed as both coercive and destructive. This reinforces a defensive national posture and strengthens calls for accountability and adherence to international law.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
            $section->addText("Meanwhile, alliance-driven narratives remain strong, with joint exercises highlighting interoperability and collective deterrence. Internal narratives remain stable and positive, driven by sustained peace-building gains and proactive civil-military engagement. The overall direction is escalating at the strategic level while stable domestically.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
            $section->addTextBreak(1);

            // Section 5: Opportunities
            $section->addText("5. OPPORTUNITIES FOR COMMAND EXPLOITATION", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
            $section->addListItem("Reinforce messaging on protection of maritime environment, resources, and personnel in the West Philippine Sea.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addListItem("Highlight multilateral cooperation as a force multiplier for deterrence and operational readiness.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addListItem("Amplify internal security gains and whole-of-nation peace-building initiatives.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addListItem("Promote civil-military maritime patrols and community security efforts.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addTextBreak(1);

            // Section 6: Recommendation
            $section->addText("6. RECOMMENDATION", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
            $section->addListItem("Intensify strategic communication on environmental protection and sovereignty in maritime areas.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addListItem("Enhance monitoring of adversarial narratives and external influence operations.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addListItem("Sustain messaging on alliance cooperation and interoperability benefits.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addListItem("Continue highlighting internal stability and peace-building successes to maintain public confidence.", 0, ['name' => 'Arial', 'size' => 10]);
            $section->addTextBreak(1);

            // CIEMA Summary
            $section->addText("CIEMA SUMMARY: The Information Environment for " . $timeRange . " is highly sensitive and strategically elevated, driven by allegations of environmental harm in the West Philippine Sea and continued sovereignty tensions. Strong alliance cooperation and sustained internal security gains help maintain stability despite escalating external pressures. No AFP-attributable operational casualties were reported.", ['name' => 'Arial', 'size' => 10, 'italic' => true]);
            $section->addText("Legend: HIS - Human Impact Severity; MAL - Media Amplification Level; IE - Institutional Exposure; NV - Narrative Volatility; and, SS - Strategic Sensitivity", ['name' => 'Arial', 'size' => 8]);

            $section->addPageBreak();

            // TABLE OF CONTENTS
            $section->addText("TABLE OF CONTENTS", ['name' => 'Arial', 'size' => 11, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $redDate = "1700 " . date('d', strtotime($from)) . "- 1700 " . date('d F Y', strtotime($to));
            $section->addText($redDate, ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FF0000'], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            
            $section->addTextBreak(1);

            $styleTable = ['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 80];
            $phpWord->addTableStyle('MilitaryTable', $styleTable);
            $table = $section->addTable('MilitaryTable');
            
            $table->addRow();
            $cellH1 = $table->addCell(10000, ['gridSpan' => 3, 'bgColor' => '0000FF']);
            $cellH1->addText("Daily News Monitoring", ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::LEFT, 'spaceAfter' => 0]);
            
            $table->addRow();
            $cellH2 = $table->addCell(10000, ['gridSpan' => 3, 'bgColor' => '0000FF']);
            $cellH2->addText($timeRange, ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::LEFT, 'spaceAfter' => 0]);

            $table->addRow();
            $table->addCell(1000)->addText("PAGE\nNR", ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $table->addCell(6500)->addText("TITLE / SUMMARY / LINK", ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $table->addCell(2500)->addText("Publisher / Author", ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);

            foreach ($news as $index => $item) {
                $table->addRow();
                $table->addCell(1000)->addText($index + 1, ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
                $cell2 = $table->addCell(6500);
                $cell2->addText($item->title, ['name' => 'Arial', 'size' => 10], ['spaceAfter' => 100]);
                $paragraphs = explode("\n", $item->summary);
                $firstParagraph = '';
                foreach ($paragraphs as $p) {
                    $p = trim($p);
                    if (!empty($p)) { $firstParagraph = $p; break; }
                }
                if (!empty($firstParagraph)) { $cell2->addText($firstParagraph, ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH, 'spaceAfter' => 100]); }
                if($item->url) { $cell2->addText($item->url, ['name' => 'Arial', 'size' => 9, 'color' => '0000FF', 'underline' => 'single'], ['spaceAfter' => 0]); }
                $cell3 = $table->addCell(2500);
                $cell3->addText($item->media_outlet, ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
                if (!empty($item->reporter)) { $cell3->addText($item->reporter, ['name' => 'Arial', 'size' => 9], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]); }
            }

            $section->addTextBreak(2);
            $sigTable = $section->addTable();
            $sigTable->addRow();
            $c1 = $sigTable->addCell(5000);
            $c1->addText("Prepared By:", ['name' => 'Arial', 'bold' => true], ['spaceAfter' => 0]);
            $c1->addTextBreak(2);
            $c1->addText("Allen D Guballo", ['name' => 'Arial', 'bold' => true], ['spaceAfter' => 0]);
            $c1->addText("AM            PAF", ['name' => 'Arial'], ['spaceAfter' => 0]);
            $c2 = $sigTable->addCell(5000);
            $c2->addText("Approved By:", ['name' => 'Arial', 'bold' => true], ['spaceAfter' => 0]);
            $c2->addTextBreak(2);
            $c2->addText("Ryann R Velez", ['name' => 'Arial', 'bold' => true], ['spaceAfter' => 0]);
            $c2->addText("MAJ     (Inf) PA", ['name' => 'Arial'], ['spaceAfter' => 0]);

            // NEWS CLIPPINGS
            $section->addPageBreak();
            foreach ($news as $index => $item) {
                $section->addText(($index + 1) . ". " . $item->title, ['name' => 'Arial', 'bold' => true, 'size' => 12], ['spaceBefore' => 200, 'spaceAfter' => 100]);
                if (!empty($item->image_path)) {
                    $imageLocation = storage_path('app/public/' . str_replace('\\', '/', $item->image_path));
                    if (file_exists($imageLocation)) {
                        try {
                            $section->addImage($imageLocation, [
                                'width' => 250, 
                                'wrappingStyle' => 'square', 
                                'positioning' => 'absolute',
                                'posHorizontal' => 'left',
                                'marginTop' => 5,
                                'marginRight' => 10,
                            ]);
                        } catch (\Exception $e) {}
                    }
                }
                $publisherAuthor = $item->media_outlet . ($item->reporter ? " | " . $item->reporter : "");
                $section->addText($publisherAuthor, ['name' => 'Arial', 'italic' => true, 'size' => 10, 'color' => '555555'], ['spaceAfter' => 100]);
                $paragraphs = explode("\n", $item->summary);
                foreach ($paragraphs as $p) {
                    $p = trim($p);
                    if (!empty($p)) { $section->addText($p, ['name' => 'Arial', 'size' => 11], ['alignment' => Jc::BOTH, 'spaceAfter' => 100]); }
                }
                $section->addTextBreak(2);
            }

            $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
            $fileName = "EMC_News_Clippings_" . date('Y-m-d') . ".docx";
            $tempFile = tempnam(sys_get_temp_dir(), $fileName);
            $objWriter->save($tempFile);
            return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
        });
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