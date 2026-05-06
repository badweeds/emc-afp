import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Shield, AlertTriangle, CheckCircle2, MinusCircle, Newspaper, Building, Calendar, MapPin, Activity, PieChart, TrendingUp } from 'lucide-react';

interface CommanderDashboardProps {
  stats: { total: number; favorable: number; neutral: number; unfavorable: number; };
  unitStats: { unit_involved: string; count: number }[];
  topicStats: { topic: string; count: number }[];
  recentNews: any[];
}

export default function CommanderDashboard({ stats, unitStats, topicStats, recentNews }: CommanderDashboardProps) {
  
  // Calculate percentages for the sentiment bar
  const favPct = stats.total > 0 ? (stats.favorable / stats.total) * 100 : 0;
  const neuPct = stats.total > 0 ? (stats.neutral / stats.total) * 100 : 0;
  const unfPct = stats.total > 0 ? (stats.unfavorable / stats.total) * 100 : 0;

  return (
    <AuthenticatedLayout>
      <Head title="Commander's Dashboard - EMC" />

      <div className="max-w-7xl mx-auto space-y-6 p-4 lg:p-0">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-8 border-l-[#1E293B] flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] uppercase tracking-wide">Commander's Analytics</h1>
            <p className="text-slate-500 font-medium text-sm">Real-time Information Environment Monitoring & Assessment</p>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2 hidden md:flex">
            <Shield className="size-5 text-[#7B1E1E]" />
            <span className="font-bold text-slate-800 uppercase tracking-widest text-xs">EastMinCom Executive View</span>
          </div>
        </div>

        {/* TOP ROW: KPI NUMBERS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-md border-slate-200">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Newspaper className="size-4" /> Total Reports</p>
              <div className="text-3xl font-black text-slate-800">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-b-4 border-b-green-600">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 className="size-4" /> Favorable</p>
              <div className="text-3xl font-black text-green-700">{stats.favorable}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-b-4 border-b-slate-400">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1"><MinusCircle className="size-4" /> Neutral</p>
              <div className="text-3xl font-black text-slate-600">{stats.neutral}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md border-b-4 border-b-[#7B1E1E] bg-red-50/30">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-[#7B1E1E] uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle className="size-4" /> Unfavorable</p>
              <div className="text-3xl font-black text-[#7B1E1E]">{stats.unfavorable}</div>
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE ROW: VISUAL ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sentiment Visual Bar */}
          <Card className="shadow-md">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide"><PieChart className="size-4 text-[#7B1E1E]"/> Overall Sentiment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Stacked Bar Chart */}
              <div className="w-full h-8 flex rounded-full overflow-hidden shadow-inner mb-4">
                <div style={{ width: `${favPct}%` }} className="bg-green-500 h-full transition-all duration-500"></div>
                <div style={{ width: `${neuPct}%` }} className="bg-slate-400 h-full transition-all duration-500"></div>
                <div style={{ width: `${unfPct}%` }} className="bg-[#7B1E1E] h-full transition-all duration-500"></div>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-green-600">{favPct.toFixed(1)}% Favorable</span>
                <span className="text-slate-500">{neuPct.toFixed(1)}% Neutral</span>
                <span className="text-[#7B1E1E]">{unfPct.toFixed(1)}% Threat</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Topics */}
          <Card className="shadow-md">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide"><TrendingUp className="size-4 text-[#7B1E1E]"/> Top 5 Discussed Topics</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {topicStats.map((topic, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="bg-[#1E293B] text-white size-5 flex items-center justify-center rounded-full text-[10px]">{i + 1}</span>
                    {topic.topic}
                  </span>
                  <span className="text-sm font-black text-[#7B1E1E]">{topic.count} reports</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM ROW: UNIT REPORTS & LATEST FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Reports by Unit (Left side, takes 1/3 space) */}
          <Card className="shadow-md lg:col-span-1 border-t-4 border-t-[#1E293B]">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide"><Building className="size-4 text-[#1E293B]"/> Reports by Unit</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {unitStats.map((unit, i) => {
                const maxCount = Math.max(...unitStats.map(u => u.count));
                const widthPct = (unit.count / maxCount) * 100;
                // Shorten unit names for the commander view
                const shortName = unit.unit_involved.split('(')[1]?.replace(')', '') || unit.unit_involved;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{shortName}</span>
                      <span>{unit.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#1E293B] h-2 rounded-full" style={{ width: `${widthPct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Latest Intelligence Feed (Right side, takes 2/3 space) */}
          <Card className="shadow-lg lg:col-span-2 border-t-4 border-t-[#7B1E1E]">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold text-[#1E293B] flex items-center gap-2 uppercase tracking-wide">
                <Activity className="size-4 text-[#7B1E1E]" /> Latest Intelligence Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 h-[400px] overflow-y-auto">
                {recentNews.length > 0 ? (
                  recentNews.map((news) => (
                    <div key={news.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-1">
                        {news.category === 'Favorable' && <span className="bg-green-100 text-green-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border border-green-200">Favorable</span>}
                        {news.category === 'Neutral' && <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border border-slate-300">Neutral</span>}
                        {news.category === 'Unfavorable' && <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase border border-red-200 flex items-center gap-1"><AlertTriangle className="size-3" /> Threat</span>}
                        <span className="text-[10px] font-bold text-slate-400">{new Date(news.date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-[#1E293B] ml-auto border border-[#1E293B] px-2 py-0.5 rounded">{news.media_outlet}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{news.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                        <span className="flex items-center gap-1"><MapPin className="size-3 text-slate-400" /> {news.topic}</span>
                        <span className="flex items-center gap-1"><Building className="size-3 text-slate-400" /> {news.unit_involved.split('(')[1]?.replace(')', '') || news.unit_involved}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 font-medium">No recent intelligence reports available.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}