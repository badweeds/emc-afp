<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; 
use App\Models\NewsArticle;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\NewsExport;

// PHPWord classes for the identical military format
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// 1. DASHBOARD
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

// 2. NEWS MANAGEMENT (ADD NEWS & AI INTEGRATION)
Route::middleware('auth')->group(function () {
    Route::get('/add-news', function () {
        return Inertia::render('AddNews');
    });

    // --- SUPERCHARGED AI AUTO-ANALYZER ROUTE ---
    Route::post('/analyze-news', function (Request $request) {
        $request->validate(['content' => 'required|string']);

        $apiKey = env('GEMINI_API_KEY');
        
        $prompt = 'You are a military intelligence analyst. Read the following pasted text (which may contain a news article, URL, reporter name, etc.). 
        Extract the following details and output ONLY a valid JSON object matching these exact keys:
        1. "summary": A professional, concise 2-sentence summary of the news.
        2. "category": Sentiment towards the military/government. Exactly one of: "Favorable", "Neutral", "Unfavorable".
        3. "title": The headline of the article (or generate one if missing).
        4. "reporter": The name of the reporter/author (or empty string if not found).
        5. "url": Any website link found in the text (or empty string if not found).
        
        Text: ' . $request->content;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ]
        ]);

        if ($response->successful()) {
            $result = $response->json();
            $aiText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
            
            // Clean the response to ensure it's pure JSON
            $aiText = str_replace(['```json', '```'], '', $aiText);
            return response()->json(json_decode(trim($aiText), true));
        }

        return response()->json(['error' => 'AI Analysis failed.'], 500);
    });

    // --- SAVE NEWS ENTRY ---
    Route::post('/news', function (Request $request) {
        $validated = $request->validate([
            'title' => 'required', 
            'summary' => 'required', 
            'media_outfit' => 'required',
            'reporter' => 'nullable|string', // Reporter field added
            'topic' => 'required', 
            'unit_involved' => 'required', 
            'category' => 'required',
            'date' => 'required', 
            'url' => 'nullable|url',
            'scope' => 'nullable|string',
            'image' => 'nullable|image|max:5120' // 5MB Max for Screenshots
        ]);

        // Handle Image Upload securely
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('news_images', 'public');
            // THE WINDOWS FIX: Force forward slashes before saving to the database
            $validated['image_path'] = str_replace('\\', '/', $path);
        }

        unset($validated['image']);

        NewsArticle::create($validated);
        return redirect()->back();
    });

    // --- UPDATE NEWS ENTRY (HANDLES IMAGE REPLACEMENT) ---
    // NOTE: Inertia uses POST with _method=patch for file uploads.
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
            'url' => 'nullable|url',
            'scope' => 'nullable|string',
            'image' => 'nullable|image|max:5120'
        ]);

        // If a new image is uploaded, process it and update the path
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

// 3. MONITORING, ANALYTICS, & REPORTS
Route::get('/monitoring', function () {
    return Inertia::render('NewsMonitoring', ['news' => NewsArticle::orderBy('date', 'desc')->get()]);
})->middleware(['auth']);

Route::get('/analytics', function () {
    return Inertia::render('Analytics', ['news' => NewsArticle::all()]);
})->middleware(['auth']);

Route::get('/reports', function () {
    return Inertia::render('Reports', ['news' => NewsArticle::orderBy('date', 'desc')->get()]);
})->middleware(['auth']);


// --- 4. IDENTICAL DOCX EXPORT ---
Route::get('/export/docx', function (Request $request) {
    $from = $request->query('from');
    $to = $request->query('to');
    $news = NewsArticle::whereBetween('date', [$from, $to])->orderBy('date', 'asc')->get();
    
    $phpWord = new PhpWord();
    $section = $phpWord->addSection();
    $tight = ['spaceAfter' => 0, 'spaceBefore' => 0];

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

    // TABLE OF CONTENTS HEADER
    $section->addText("TABLE OF CONTENTS", ['name' => 'Arial', 'size' => 11, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
    $redDate = "1700 " . date('d', strtotime($from)) . "- 1700 " . date('d F Y', strtotime($to));
    $section->addText($redDate, ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FF0000'], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
    
    $section->addTextBreak(1);

    // UNIFIED TABLE
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
        $table->addCell(1000)->addText($index + 1, ['name' => 'Arial'], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        $cell = $table->addCell(6500);
        $cell->addText($item->title, ['name' => 'Arial', 'bold' => true, 'size' => 10, 'color' => '1E3A8A'], ['spaceAfter' => 0]);
        $cell->addText($item->summary, ['name' => 'Arial', 'size' => 9], ['spaceAfter' => 0]);
        if($item->url) {
            $cell->addText($item->url, ['name' => 'Arial', 'size' => 8, 'color' => '0000FF', 'underline' => 'single'], ['spaceAfter' => 0]);
        }
        // Updated to show Reporter alongside Media Outfit
        $publisherAuthor = $item->media_outfit . ($item->reporter ? "\n" . $item->reporter : "");
        $table->addCell(2500)->addText($publisherAuthor, ['name' => 'Arial', 'bold' => true, 'size' => 10], ['spaceAfter' => 0]);
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


// --- 5. THE ULTIMATE WINDOWS IMAGE FIX (WITH DEBUGGER) ---
Route::get('/news-image/{path}', function ($path) {
    $cleanPath = str_replace('\\', '/', $path);
    $filePath = storage_path('app/public/' . $cleanPath);
    
    if (!file_exists($filePath)) {
        dd("DEBUG ERROR: The image does not exist at this exact folder location: " . $filePath);
    }
    
    return response()->file($filePath);
})->where('path', '.*');

require __DIR__.'/auth.php';