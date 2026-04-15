<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 11pt; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #7B1E1E; padding-bottom: 10px; margin-bottom: 20px; }
        .military-title { font-size: 16pt; font-weight: bold; color: #7B1E1E; }
        .report-item { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
        .news-title { font-size: 13pt; font-weight: bold; color: #1e293b; }
        .meta { font-size: 9pt; color: #666; margin: 5px 0; font-weight: bold; }
        .summary { font-size: 10pt; line-height: 1.4; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 8pt; color: #777; border-top: 1px solid #eee; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="military-title">EASTERN MINDANAO COMMAND, AFP</div>
        <div style="font-weight: bold;">Daily News Monitoring Summary</div>
        <div style="font-size: 9pt;">Generated: {{ now()->format('d M Y, H:i') }}</div>
    </div>

    @foreach($news as $item)
    <div class="report-item">
        <div class="news-title">{{ $item->title }}</div>
        <div class="meta">
            {{ $item->date }} | {{ $item->media_outlet }} | Unit: {{ $item->unit_involved }} | Category: {{ $item->category }}
        </div>
        <div class="summary">{{ $item->summary }}</div>
    </div>
    @endforeach

    <div class="footer">
        CONFIDENTIAL - FOR OFFICIAL USE ONLY
    </div>
</body>
</html>