import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { History, Search, Building, User } from 'lucide-react';

interface LogItem {
  id: number;
  user: { name: string; unit: string; role: string } | null;
  action: string;
  description: string;
  created_at: string;
}

export default function ActivityLogs({ logs }: { logs: LogItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.user?.unit && log.user.unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AuthenticatedLayout>
      <Head title="System Activity Logs - EMC" />
      <div className="space-y-5 max-w-6xl mx-auto p-6 lg:p-0">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E293B]">System Activity Logs</h1>
            <p className="text-slate-500 mt-1 font-medium">Global audit trail across all military units</p>
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
                placeholder="Search logs, users, or units..." 
                className="pl-9 bg-white text-slate-900 border-slate-300 w-full" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="font-bold text-slate-800">Date & Time</TableHead>
                    <TableHead className="font-bold text-slate-800">Personnel</TableHead>
                    <TableHead className="font-bold text-slate-800">Unit</TableHead>
                    <TableHead className="font-bold text-slate-800">Action</TableHead>
                    <TableHead className="font-bold text-slate-800">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-500">No logs found.</TableCell></TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50 border-b border-slate-100">
                        <TableCell className="text-slate-600 text-xs font-semibold">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <User className="size-3 text-slate-400" />
                            {log.user?.name || 'System / Deleted User'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
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
          </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}