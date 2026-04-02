<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
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
        'recentNews' => NewsArticle::orderBy('date', 'desc')->limit(5)->get()
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// 2. NEWS MANAGEMENT (RESTORED ADD NEWS)
Route::middleware('auth')->group(function () {
    Route::get('/add-news', function () {
        return Inertia::render('AddNews');
    });

    Route::post('/news', function (Request $request) {
        $validated = $request->validate([
            'title' => 'required', 'summary' => 'required', 'media_outfit' => 'required',
            'topic' => 'required', 'unit_involved' => 'required', 'category' => 'required',
            'date' => 'required', 'url' => 'nullable|url'
        ]);
        NewsArticle::create($validated);
        return redirect()->back();
    });

    Route::patch('/news/{newsArticle}', function (Request $request, NewsArticle $newsArticle) {
        $newsArticle->update($request->all());
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


// --- 4. IDENTICAL DOCX EXPORT (UNIFIED TABLE & TIGHT ALIGNMENT) ---
Route::get('/export/docx', function (Request $request) {
    $from = $request->query('from');
    $to = $request->query('to');
    $news = NewsArticle::whereBetween('date', [$from, $to])->orderBy('date', 'asc')->get();
    
    $phpWord = new PhpWord();
    $section = $phpWord->addSection();
    $tight = ['spaceAfter' => 0, 'spaceBefore' => 0];

    // --- COVER PAGE ---
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

    // --- TABLE OF CONTENTS PAGE ---
    
    // Top Titles (Arial 11 Bold)
    $section->addText("TABLE OF CONTENTS", ['name' => 'Arial', 'size' => 11, 'bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);    
    // Red Date Subtitle (Right Aligned in the image context, but we can put it on the next line or right-tabbed)
    $redDate = "1700 " . date('d', strtotime($from)) . "- 1700 " . date('d F Y', strtotime($to));
    $section->addText($redDate, ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FF0000'], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
    
    $section->addTextBreak(1);

    // --- START OF THE UNIFIED TABLE (CONNECTED BORDERS) ---
    $styleTable = ['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 80];
    $phpWord->addTableStyle('MilitaryTable', $styleTable);
    $table = $section->addTable('MilitaryTable');
    
    // ROW 1: Blue Header - Daily News Monitoring
    $table->addRow();
    $cellHeader1 = $table->addCell(10000, ['gridSpan' => 3, 'bgColor' => '07193D']);
    $cellHeader1->addText("Daily News Monitoring", ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::LEFT, 'spaceAfter' => 0]);
    
    // ROW 2: Blue Header - Time Range
    $table->addRow();
    $cellHeader2 = $table->addCell(10000, ['gridSpan' => 3, 'bgColor' => '07193D']);
    $timeRangeText = "1700H " . date('d', strtotime($from)) . " – 1700H " . date('d F Y', strtotime($to));
    $cellHeader2->addText($timeRangeText, ['name' => 'Arial', 'size' => 12, 'bold' => true, 'color' => 'FFFFFF'], ['alignment' => Jc::LEFT, 'spaceAfter' => 0]);

    // ROW 3: Column Names
    $table->addRow();
    $table->addCell(1000)->addText("PAGE\nNR", ['name' => 'Arial', 'size' => 12, 'color' => '0F4761'], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
    $table->addCell(6500)->addText("TITLE / SUMMARY / LINK", ['name' => 'Arial', 'bold' => true, 'size' => 12], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
    $table->addCell(2500)->addText("Publisher / Author", ['name' => 'Arial', 'bold' => true, 'size' => 12], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);

    // DATA ROWS
    foreach ($news as $index => $item) {
        $table->addRow();
        $table->addCell(1000)->addText($index + 1, ['name' => 'Arial'], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        $cell = $table->addCell(6500);
        $cell->addText($item->title, ['name' => 'Arial', 'bold' => true, 'size' => 10, 'color' => '1E3A8A'], ['spaceAfter' => 0]);
        $cell->addText($item->summary, ['name' => 'Arial', 'size' => 9], ['spaceAfter' => 0]);
        if($item->url) {
            $cell->addText($item->url, ['name' => 'Arial', 'size' => 8, 'color' => '0000FF', 'underline' => 'single'], ['spaceAfter' => 0]);
        }
        $table->addCell(2500)->addText($item->media_outfit, ['name' => 'Arial', 'bold' => true, 'size' => 10], ['spaceAfter' => 0]);
    }

    // --- SIGNATURE BLOCK ---
    $section->addTextBreak(2);
    $section->addText("NOTE: This is the monitored news covering the period of " . date('d-m F Y', strtotime($from)), ['name' => 'Arial', 'size' => 10]);
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

// 5. YEARLY EXCEL EXPORT
Route::get('/export/excel', function () {
    return Excel::download(new NewsExport, 'PIO_EMC_Yearly_News_Data.xlsx');
})->middleware(['auth']);

require __DIR__.'/auth.php';