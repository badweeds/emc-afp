<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\NewsArticle;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\NewsExport;

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'stats' => [
            'total' => NewsArticle::count(),
            'favorable' => NewsArticle::where('category', 'Favorable')->count(),
            'neutral' => NewsArticle::where('category', 'Neutral')->count(),
            'unfavorable' => NewsArticle::where('category', 'Unfavorable')->count(),
        ],
        'recentNews' => NewsArticle::orderBy('date', 'desc')->limit(5)->get(),
        'carouselNews' => NewsArticle::whereNotNull('image_path')->orderBy('date', 'desc')->limit(10)->get()
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/add-news', function () {
        return Inertia::render('AddNews');
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
            "summary": "The FULL, comprehensive body of the news article. Retain all original paragraphs, important details, and quotes. Do NOT summarize into 2 sentences. Preserve paragraph breaks using \n.",
            "category": "Sentiment towards the military/government. Exactly one of: Favorable, Neutral, Unfavorable",
            "title": "The headline of the article (or generate one if missing)",
            "reporter": "The name of the reporter/author (or empty string if not found)",
            "url": "Any website link found in the text (or empty string if not found)",
            "media_outfit": "CRITICAL: You MUST map the publisher EXACTLY to one of the names in the Local, National, or International lists provided below. Example: If you read \'Inquirer\', you MUST output \'Philippine Daily Inquirer\'. If you read \'SunStar\', you MUST output \'SunStar Davao\'. If you absolutely cannot find a match, output the name as it appears in the text.",
            "scope": "Must be exactly one of: Local, National, International. Rule: If the media_outfit is in the Local List, scope MUST be Local. If in National List, scope MUST be National.",
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
        curl_close($ch);

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

    Route::post('/news', function (Request $request) {
        $validated = $request->validate([
            'title' => 'required', 
            'summary' => 'required', 
            'media_outfit' => 'required',
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

        NewsArticle::create($validated);
        return redirect()->back();
    });

    Route::post('/news/{newsArticle}', function (Request $request, NewsArticle $newsArticle) {
        $validated = $request->validate([
            'title' => 'required', 
            'summary' => 'required', 
            'media_outfit' => 'required',
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

Route::get('/monitoring', function () {
    return Inertia::render('NewsMonitoring', ['news' => NewsArticle::orderBy('date', 'desc')->get()]);
})->middleware(['auth']);

Route::get('/analytics', function () {
    return Inertia::render('Analytics', ['news' => NewsArticle::all()]);
})->middleware(['auth']);

Route::get('/reports', function () {
    return Inertia::render('Reports', ['news' => NewsArticle::orderBy('date', 'desc')->get()]);
})->middleware(['auth']);

// --- PERFECTLY FORMATTED DOCX EXPORT ---
Route::get('/export/docx', function (Request $request) {
    $from = $request->query('from');
    $to = $request->query('to');
    $news = NewsArticle::whereBetween('date', [$from, $to])->orderBy('date', 'asc')->get();
    
    $phpWord = new PhpWord();
    $section = $phpWord->addSection();
    
    // --- 1. COVER PAGE ---
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

    // --- 2. TABLE OF CONTENTS (SHORT SUMMARY) ---
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
    $timeRange = "1700H " . date('d', strtotime($from)) . " – 1700H " . date('d F Y', strtotime($to));
    $cellH2->addText($timeRange, ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::LEFT, 'spaceAfter' => 0]);

    $table->addRow();
    $table->addCell(1000)->addText("PAGE\nNR", ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
    $table->addCell(6500)->addText("TITLE / SUMMARY / LINK", ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
    $table->addCell(2500)->addText("Publisher / Author", ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);

    foreach ($news as $index => $item) {
        $table->addRow();
        
        $table->addCell(1000)->addText($index + 1, ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        
        $cell2 = $table->addCell(6500);
        $cell2->addText($item->title, ['name' => 'Arial', 'size' => 10], ['spaceAfter' => 100]); // Plain text title like the picture
        
        // THE FIX: Extract ONLY the very first paragraph for a small summary in the table
        $paragraphs = explode("\n", $item->summary);
        $firstParagraph = '';
        foreach ($paragraphs as $p) {
            $p = trim($p);
            if (!empty($p)) {
                $firstParagraph = $p;
                break; // Stop after the first paragraph!
            }
        }
        
        if (!empty($firstParagraph)) {
            $cell2->addText($firstParagraph, ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH, 'spaceAfter' => 100]);
        }
        
        if($item->url) {
            $cell2->addText($item->url, ['name' => 'Arial', 'size' => 9, 'color' => '0000FF', 'underline' => 'single'], ['spaceAfter' => 0]);
        }

        $cell3 = $table->addCell(2500);
        $cell3->addText($item->media_outfit, ['name' => 'Arial', 'bold' => true, 'size' => 10], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        if (!empty($item->reporter)) {
            $cell3->addText($item->reporter, ['name' => 'Arial', 'size' => 9], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        }
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
    $c2->addText("MAJ    (Inf) PA", ['name' => 'Arial'], ['spaceAfter' => 0]);


    // --- 3. FULL NEWS CLIPPINGS (WITH WRAPPED IMAGES) ---
    $section->addPageBreak();

    foreach ($news as $index => $item) {
        
        // 1. Print Number and Title (Bold)
        $section->addText(($index + 1) . ". " . $item->title, ['name' => 'Arial', 'bold' => true, 'size' => 12], ['spaceBefore' => 200, 'spaceAfter' => 100]);

        // 2. THE FIX: Image with "Square" Wrapping so text wraps to the right
        if (!empty($item->image_path)) {
            $imageLocation = storage_path('app/public/' . str_replace('\\', '/', $item->image_path));
            
            if (file_exists($imageLocation)) {
                try {
                    $section->addImage($imageLocation, [
                        'width'         => 250, // Half page width
                        'wrappingStyle' => 'square', // This forces text to wrap around it!
                        'positioning'   => 'absolute',
                        'posHorizontal' => 'left',
                        'posHorizontalRel' => 'column',
                        'posVerticalRel'  => 'line',
                        'marginTop'       => 5,
                        'marginRight'     => 10,
                    ]);
                } catch (\Exception $e) {
                    // Fail silently if image is corrupted/unsupported so the report still generates
                }
            }
        }

        // 3. Print Media Outfit / Reporter (Optional, based on your screenshot you might not even want this here, but I kept it small)
        $publisherAuthor = $item->media_outfit;
        if (!empty($item->reporter)) {
            $publisherAuthor .= " | " . $item->reporter;
        }
        $section->addText($publisherAuthor, ['name' => 'Arial', 'italic' => true, 'size' => 10, 'color' => '555555'], ['spaceAfter' => 100]);

        // 4. Print the FULL body of the article (It will automatically wrap around the image)
        $paragraphs = explode("\n", $item->summary);
        foreach ($paragraphs as $p) {
            $p = trim($p);
            if (!empty($p)) {
                $section->addText($p, ['name' => 'Arial', 'size' => 11], ['alignment' => Jc::BOTH, 'spaceAfter' => 100]);
            }
        }

        // Add a clean break between articles
        $section->addTextBreak(2);
    }

    $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
    $fileName = "EMC_News_Clippings_" . date('Y-m-d') . ".docx";
    $tempFile = tempnam(sys_get_temp_dir(), $fileName);
    $objWriter->save($tempFile);

    return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
})->middleware(['auth']);

Route::get('/export/excel', function () {
    return Excel::download(new NewsExport, 'PIO_EMC_Yearly_News_Data.xlsx');
})->middleware(['auth']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/news-image/{path}', function ($path) {
    $cleanPath = str_replace('\\', '/', $path);
    $filePath = storage_path('app/public/' . $cleanPath);
    if (!file_exists($filePath)) {
        abort(404);
    }
    return response()->file($filePath);
})->where('path', '.*');

require __DIR__.'/auth.php';