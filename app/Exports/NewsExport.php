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
        $user = auth()->user();
        $query = NewsArticle::where('status', 'approved')->orderBy('date', 'asc');

        // DATA ISOLATION: Only export news for this specific unit
        if (in_array($user->role, ['admin', 'user'])) {
            $query->where('unit_involved', $user->unit);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return ['DATE', 'TITLE', 'MEDIA OUTLET', 'UNIT INVOLVED', 'ISSUE/TOPIC', 'CATEGORY', 'SUMMARY', 'URL/LINK'];
    }

    public function map($news): array
    {
        return [$news->date, $news->title, $news->media_outlet, $news->unit_involved, $news->topic, $news->category, $news->summary, $news->url];
    }

    public function styles(Worksheet $sheet)
    {
        return [1 => ['font' => ['bold' => true]]];
    }
}