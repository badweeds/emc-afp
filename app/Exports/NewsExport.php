<?php

namespace App\Exports;

use App\Models\NewsArticle;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NewsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function collection()
    {
        return NewsArticle::orderBy('date', 'asc')->get();
    }

    public function headings(): array
    {
        return ['DATE', 'TITLE', 'MEDIA OUTFIT', 'UNIT INVOLVED', 'ISSUE/TOPIC', 'CATEGORY', 'SUMMARY', 'URL/LINK'];
    }

    public function map($news): array
    {
        return [$news->date, $news->title, $news->media_outfit, $news->unit_involved, $news->topic, $news->category, $news->summary, $news->url];
    }

    public function styles(Worksheet $sheet)
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}