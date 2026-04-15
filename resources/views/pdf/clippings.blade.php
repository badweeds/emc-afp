<!DOCTYPE html>
<html>
<head>
    <style>
        @page { margin: 80px 50px; }
        body { font-family: 'Helvetica', sans-serif; color: #1a1a1a; }
        .cover { text-align: center; margin-top: 100px; }
        .military-title { font-size: 28pt; font-weight: bold; color: #7B1E1E; letter-spacing: 4px; }
        .date-box { margin-top: 150px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 20px 0; }
        .toc-header { background-color: #7B1E1E; color: white; padding: 10px; font-weight: bold; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 10px; vertical-align: top; font-size: 10pt; }
        .summary { font-size: 9pt; color: #444; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="cover">
        <div class="military-title">TEAM EASTMINCOM</div>
        <p>Public Information Office</p>
        <div class="date-box">
            <h2 style="margin:0;">WEEKLY NEWS CLIPPINGS</h2>
            <p style="font-size: 14pt;">{{ $date_range }}</p>
        </div>
    </div>
    <div style="page-break-after: always;"></div>
    <div class="toc-header">TABLE OF CONTENTS</div>
    <table>
        <thead>
            <tr>
                <th style="width: 30px;">NR</th>
                <th>TITLE / SUMMARY / LINK</th>
                <th style="width: 120px;">PUBLISHER</th>
            </tr>
        </thead>
        <tbody>
            @foreach($news as $index => $item)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>
                    <div style="font-weight: bold;">{{ $item->title }}</div>
                    <div class="summary">{{ $item->summary }}</div>
                    <div style="font-size: 8pt; color: blue; margin-top: 5px;">{{ $item->url }}</div>
                </td>
                <td><div style="font-weight: bold;">{{ $item->media_outlet }}</div></td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>