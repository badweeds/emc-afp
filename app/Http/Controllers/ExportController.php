<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsArticle;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\NewsExport;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;
use Illuminate\Support\Str;

class ExportController extends Controller
{
    public function excel()
    {
        return Excel::download(new NewsExport, 'PIO_EMC_Yearly_News_Data.xlsx');
    }

    public function docx(Request $request)
    {
        $from = $request->query('from');
        $to = $request->query('to');
        
        $news = NewsArticle::where('status', 'approved')
                    ->whereBetween('date', [$from, $to])
                    ->orderBy('date', 'asc')->get();
        
        $criticalNews = NewsArticle::where('status', 'approved')
                        ->whereBetween('date', [$from, $to])
                        ->where('category', 'Unfavorable')
                        ->limit(3)
                        ->get();

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

        // CIEMA REPORT PAGE
        $section->addText("COMMANDER’S INFORMATION ENVIRONMENT MONITORING & ASSESSMENT (CIEMA)", ['name' => 'Arial', 'size' => 12, 'bold' => true], ['alignment' => Jc::CENTER]);
        $timeRange = "1700H " . date('d', strtotime($from)) . " – 1700H " . date('d F Y', strtotime($to));
        $section->addText($timeRange, ['name' => 'Arial', 'size' => 11, 'bold' => true], ['alignment' => Jc::CENTER]);
        $section->addTextBreak(1);

        $section->addText("1. INFORMATION ENVIRONMENT STATUS: HIGHLY SENSITIVE SOVEREIGNTY AND ENVIRONMENTAL SECURITY NARRATIVE WITH STRONG ALLIANCE AND INTERNAL STABILITY DRIVERS", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
        $section->addText("The Information Environment during the reporting period is highly sensitive and strategically elevated, driven by intensified maritime security and environmental concerns in the West Philippine Sea (WPS). Reports alleging the use of cyanide by Chinese maritime militia near the BRP Sierra Madre significantly heighten the gravity of the situation, expanding the narrative from sovereignty disputes to environmental degradation and threats to personnel and resources. This development amplifies national and international attention and reinforces urgency in maritime protection efforts.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
        $section->addText("Simultaneously, alliance-driven narratives remain prominent through ongoing multilateral maritime cooperative activities involving the Philippines, United States, and Australia. These joint drills, particularly focused on logistics interoperability, reinforce collective security posture and operational readiness in the WPS, contributing to deterrence and regional stability.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
        $section->addText("At the regional level, the Information Environment remains stable and institutionally positive, supported by sustained civil-military operations and internal security gains. Initiatives such as joint coastal patrols and whole-of-nation peace and development approaches highlight continued community engagement and the consolidation of gains against insurgent threats.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);

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

        $section->addText("4. NARRATIVE TREND", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
        $section->addText("The dominant narrative during the reporting period is sovereignty-driven with a strong environmental security dimension. The alleged cyanide use near Ayungin Shoal introduces a critical shift in discourse, linking maritime disputes to ecological damage, food security risks, and potential harm to deployed personnel. This significantly elevates the sensitivity and urgency of the information environment.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
        $section->addText("Adversarial framing is highly evident, with foreign maritime activities portrayed as both coercive and destructive. This reinforces a defensive national posture and strengthens calls for accountability and adherence to international law.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
        $section->addText("Meanwhile, alliance-driven narratives remain strong, with joint exercises highlighting interoperability and collective deterrence. Internal narratives remain stable and positive, driven by sustained peace-building gains and proactive civil-military engagement. The overall direction is escalating at the strategic level while stable domestically.", ['name' => 'Arial', 'size' => 10], ['alignment' => Jc::BOTH]);
        $section->addTextBreak(1);

        $section->addText("5. OPPORTUNITIES FOR COMMAND EXPLOITATION", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
        $section->addListItem("Reinforce messaging on protection of maritime environment, resources, and personnel in the West Philippine Sea.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addListItem("Highlight multilateral cooperation as a force multiplier for deterrence and operational readiness.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addListItem("Amplify internal security gains and whole-of-nation peace-building initiatives.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addListItem("Promote civil-military maritime patrols and community security efforts.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addTextBreak(1);

        $section->addText("6. RECOMMENDATION", ['name' => 'Arial', 'size' => 11, 'bold' => true]);
        $section->addListItem("Intensify strategic communication on environmental protection and sovereignty in maritime areas.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addListItem("Enhance monitoring of adversarial narratives and external influence operations.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addListItem("Sustain messaging on alliance cooperation and interoperability benefits.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addListItem("Continue highlighting internal stability and peace-building successes to maintain public confidence.", 0, ['name' => 'Arial', 'size' => 10]);
        $section->addTextBreak(1);

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
    }
}