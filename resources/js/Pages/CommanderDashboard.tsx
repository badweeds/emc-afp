import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Shield, AlertTriangle, CheckCircle2, MinusCircle, Newspaper, Building, Calendar, MapPin, Activity } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  media_outlet: string;
  topic: string;
  category: 'Favorable' | 'Neutral' | 'Unfavorable';
  unit_involved: string;
  date: string;
}

interface CommanderDashboardProps {
  stats: {
    total: number;
    favorable: number;
    neutral: number;
    unfavorable: number;
  };
  recentNews: NewsArticle[];
}

export default function CommanderDashboard({ stats, recentNews }: CommanderDashboardProps) {
  return (
    <AuthenticatedLayout>
      <Head title="Commander's Dashboard - EMC" />

      <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-0">
        
        {/* DASHBOARD HEADER */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 border-l-8 border-l-[#1E293B] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E293B] uppercase tracking-wide">
              Commander's Overview
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Information Environment Monitoring & Assessment (CIEMA)
            </p>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2">
            <Shield className="size-5 text-[#7B1E1E]" />
            <span className="font-bold text-slate-800 uppercase tracking-widest text-sm">EastMinCom Sec. Level</span>
          </div>
        </div>

        {/* HIGH-LEVEL STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                Total Intelligence
                <Newspaper className="size-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-slate-800">{stats.total}</div>
              <p className="text-xs text-slate-400 font-medium mt-1">Processed Reports</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-green-600 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-green-700 uppercase tracking-wider flex justify-between items-center">
                Favorable
                <CheckCircle2 className="size-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-green-700">{stats.favorable}</div>
              <p className="text-xs text-green-600/70 font-bold mt-1">Positive Environment Gains</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-slate-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
                Neutral
                <MinusCircle className="size-5 text-slate-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-slate-700">{stats.neutral}</div>
              <p className="text-xs text-slate-500 font-bold mt-1">Standard Operations / Informational</p>
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-[#7B1E1E] bg-red-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#7B1E1E] uppercase tracking-wider flex justify-between items-center">
                Critical / Unfavorable
                <AlertTriangle className="size-5 text-[#7B1E1E]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-[#7B1E1E]">{stats.unfavorable}</div>
              <p className="text-xs text-red-700/70 font-bold mt-1">Adversarial & Threat Narratives</p>
            </CardContent>
          </Card>
        </div>

        {/* RECENT INTELLIGENCE FEED */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
              <Activity className="size-5 text-[#7B1E1E]" /> Latest Intelligence Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {recentNews.length > 0 ? (
                recentNews.map((news) => (
                  <div key={news.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    
                    {/* Left Side: Title and Meta */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {news.category === 'Favorable' && <span className="bg-green-100 text-green-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-green-200">Favorable</span>}
                        {news.category === 'Neutral' && <span className="bg-slate-100 text-slate-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-300">Neutral</span>}
                        {news.category === 'Unfavorable' && <span className="bg-red-100 text-red-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-red-200 flex items-center gap-1"><AlertTriangle className="size-3" /> Unfavorable</span>}
                        
                        <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="size-3.5" /> {new Date(news.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {news.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5"><Newspaper className="size-4 text-slate-400" /> {news.media_outlet}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="size-4 text-slate-400" /> {news.topic}</span>
                        <span className="flex items-center gap-1.5 text-[#1E293B] font-bold"><Building className="size-4 text-[#7B1E1E]" /> {news.unit_involved}</span>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-medium">
                  No recent intelligence reports available for review.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}