// @ts-nocheck
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Newspaper, Radio, Shield, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { StatCard } from '@/Components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { NewsModal } from '@/Components/NewsModal';

export default function Dashboard({ auth, stats, recentNews }: any) {
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const riskData = [
    { name: 'Favorable', value: stats?.favorable || 0, fill: '#16A34A' },
    { name: 'Neutral', value: stats?.neutral || 0, fill: '#64748B' },
    { name: 'Unfavorable', value: stats?.unfavorable || 0, fill: '#DC2626' },
  ];

  return (
    <AuthenticatedLayout
        header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Commander's Overview</h2>}
    >
      <Head title="Dashboard - EMC" />
      
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">
              Strategic News Intelligence Overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Current Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              System Operational
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Reports" value={stats?.total || 0} icon={Newspaper} color="#7B1E1E" />
          <StatCard title="Favorable" value={stats?.favorable || 0} icon={Shield} color="#16A34A" />
          <StatCard title="Neutral" value={stats?.neutral || 0} icon={Radio} color="#64748B" />
          <StatCard title="Unfavorable" value={stats?.unfavorable || 0} icon={AlertTriangle} color="#DC2626" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md border-t-4 border-t-[#1E293B]">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-l-4 border-l-[#7B1E1E] flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-[#7B1E1E] text-lg font-bold flex items-center gap-2">
                <Shield className="size-5" />
                Commander's Briefing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <p className="text-sm text-gray-600 leading-relaxed">
                The monitoring database currently contains <span className="font-bold text-[#1E293B]">{stats?.total || 0}</span> total intelligence items. 
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-xs font-bold text-red-400 uppercase mb-2 tracking-widest">Priority Alert</p>
                <p className="text-2xl font-bold text-red-700">
                  {stats?.unfavorable || 0} Reports
                </p>
                <p className="text-sm text-red-600 mt-1 italic">Requiring immediate command review.</p>
              </div>
              
              <Link href="/monitoring">
                <Button className="w-full bg-[#1E293B] hover:bg-[#1E293B]/90 group">
                  Access Monitoring Vault
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md overflow-hidden border-t-4 border-t-slate-200">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Recent Intelligence Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Title</TableHead>
                  <TableHead className="font-bold">Media Source</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="text-right font-bold">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!recentNews || recentNews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-gray-400 italic font-medium">
                      Intelligence database is empty. No recent entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentNews.map((news: any) => (
                    <TableRow key={news.id} className="hover:bg-blue-50/30 transition-colors cursor-default">
                      <TableCell className="font-semibold text-slate-700 max-w-md truncate">{news.title}</TableCell>
                      <TableCell className="text-slate-500 font-medium">{news.media_outfit}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          news.category === 'Favorable' ? 'bg-green-100 text-green-700 border border-green-200' :
                          news.category === 'Unfavorable' ? 'bg-red-100 text-red-700 border border-red-200' : 
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {news.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 tabular-nums">{news.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-[#7B1E1E]/10 hover:text-[#7B1E1E]" onClick={() => setSelectedNews(news)}>
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedNews && (
          <NewsModal news={selectedNews} open={!!selectedNews} onClose={() => setSelectedNews(null)} />
        )}
      </div>
    </AuthenticatedLayout>
  );
}