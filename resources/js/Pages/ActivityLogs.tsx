import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { History, Search, Building, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface LogItem {
  id: number;
  user: { name: string; unit: string; role: string } | null;
  action: string;
  description: string;
  created_at: string;
}

interface PaginatedData {
  data: LogItem[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function ActivityLogs({ logs, filters }: { logs: PaginatedData, filters: { search: string } }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Wait for the user to stop typing before searching the database (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== filters.search) {
        router.get('/admin/logs', { search: searchTerm }, { preserveState: true, replace: true });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <AuthenticatedLayout>
      <Head title="System Activity Logs - EMC" />
      <div className="space-y-5 max-w-6xl mx-auto p-6 lg:p-0">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E293B]">System Activity Logs</h1>
            <p className="text-slate-500 mt-1 font-medium">
              Global audit trail across all military units (Total: {logs.total})
            </p>
          </div>
        </div>

        <Card className="shadow-md bg-white border border-slate-200 border-t-4 border-t-[#1E293B]">
          <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-[#1E293B]">
              <History className="size-5" /> Audit Trail
            </CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="Search database..." 
                className="pl-9 bg-white text-slate-900 border-slate-300 w-full" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-800">Date & Time</TableHead>
                    <TableHead className="font-bold text-slate-800">Personnel</TableHead>
                    <TableHead className="font-bold text-slate-800">Unit</TableHead>
                    <TableHead className="font-bold text-slate-800">Action</TableHead>
                    <TableHead className="font-bold text-slate-800">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.data.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No logs found.</TableCell></TableRow>
                  ) : (
                    logs.data.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50 border-b border-slate-100">
                        <TableCell className="text-slate-600 text-xs font-semibold whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <User className="size-3 text-slate-400" />
                            {log.user?.name || 'System / Deleted User'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 whitespace-nowrap">
                            <Building className="size-3" />
                            {log.user?.unit || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs text-[#1E293B] uppercase tracking-wider">{log.action}</span>
                        </TableCell>
                        <TableCell className="text-slate-700 text-sm max-w-sm truncate">
                          {log.description}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* PAGINATION CONTROLS */}
            {logs.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white rounded-b-xl">
                <span className="text-sm text-slate-500">
                  Showing page <span className="font-bold text-slate-800">{logs.current_page}</span> of <span className="font-bold text-slate-800">{logs.last_page}</span>
                </span>
                <div className="flex gap-1">
                  {logs.links.map((link, index) => {
                    // Skip the previous/next labels from Laravel, replace with icons if needed
                    let label = link.label;
                    if (label.includes('Previous')) label = '«';
                    if (label.includes('Next')) label = '»';

                    return link.url ? (
                      <Link 
                        key={index} 
                        href={link.url} 
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${link.active ? 'bg-[#1E293B] text-white font-bold' : 'text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                      >
                        <span dangerouslySetInnerHTML={{ __html: label }}></span>
                      </Link>
                    ) : (
                      <span key={index} className="px-3 py-1 text-sm rounded-md text-slate-400 border border-slate-100" dangerouslySetInnerHTML={{ __html: label }}></span>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}