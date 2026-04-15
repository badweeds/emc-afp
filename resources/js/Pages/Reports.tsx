import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Button } from '../Components/ui/button';
import { Label } from '../Components/ui/label';
import { Input } from '../Components/ui/input';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const handleExportDOCX = () => {
    toast.info("Generating Official News Clippings (DOCX)...");
    window.location.href = `/export/docx?from=${dateRange.from}&to=${dateRange.to}`;
  };

  const handleExportExcel = () => {
    toast.info("Generating PIO Yearly Data Sheet...");
    window.location.href = '/export/excel';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8">
      <Head title="Export Reports - EMC" />

      <div>
        <h1 className="text-3xl font-semibold text-[#1E293B]">Export Center</h1>
        <p className="text-gray-500 mt-1">Generate official formats for the Commander</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DOCX Card */}
        <Card className="shadow-md border-t-4 border-t-[#7B1E1E]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-[#7B1E1E]" />
              Weekly News Clippings (Word)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 italic">Includes Cover Page, Table of Contents, and Signature blocks.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>From Date</Label>
                <Input type="date" value={dateRange.from} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label>To Date</Label>
                <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} />
              </div>
            </div>
            <Button onClick={handleExportDOCX} className="w-full bg-[#7B1E1E] hover:bg-[#7B1E1E]/90 gap-2">
              <Download className="size-4" /> Download Official DOCX
            </Button>
          </CardContent>
        </Card>

        {/* Excel Card */}
        <Card className="shadow-md border-t-4 border-t-green-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-green-600" />
              Yearly Data Sheet (Excel)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-10">
             <p className="text-sm text-gray-500">Exports all monitored news into the PIO standard yearly raw data format.</p>
            <Button onClick={handleExportExcel} variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 gap-2">
              <Download className="size-4" /> Download PIO Yearly Excel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}