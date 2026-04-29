// @ts-nocheck
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Newspaper, Radio, Shield, AlertTriangle, Eye, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { StatCard } from '@/Components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import  NewsModal  from '@/Components/NewsModal';

// Import the Carousel components
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/Components/ui/carousel";

export default function Dashboard({ auth, stats, recentNews, carouselNews }: any) {
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const riskData = [
    { name: 'Favorable', value: stats?.favorable || 0, fill: '#1B5E20' }, 
    { name: 'Neutral', value: stats?.neutral || 0, fill: '#424242' },     
    { name: 'Unfavorable', value: stats?.unfavorable || 0, fill: '#DC2626' }, 
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard - EMC" />
      
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">
              Strategic News Intelligence Overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Current Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              System Operational
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Reports" value={stats?.total || 0} icon={Newspaper} color="#1A237E" />
          <StatCard title="Favorable" value={stats?.favorable || 0} icon={Shield} color="#1B5E20" />
          <StatCard title="Neutral" value={stats?.neutral || 0} icon={Radio} color="#424242" />
          <StatCard title="Unfavorable" value={stats?.unfavorable || 0} icon={AlertTriangle} color="#DC2626" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md border-t-4 border-t-[#1A237E] bg-white">
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

          <Card className="shadow-md border-l-4 border-l-[#FBC02D] flex flex-col justify-between bg-white">
            <CardHeader>
              <CardTitle className="text-[#1A237E] text-lg font-bold flex items-center gap-2">
                <Shield className="size-5 text-[#FBC02D]" />
                Commander's Briefing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <p className="text-sm text-gray-600 leading-relaxed">
                The monitoring database currently contains <span className="font-bold text-[#1A237E]">{stats?.total || 0}</span> total intelligence items. 
              </p>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-inner">
                <p className="text-xs font-bold text-red-500 uppercase mb-1 tracking-widest">Priority Alert</p>
                <p className="text-3xl font-black text-red-700">
                  {stats?.unfavorable || 0} <span className="text-lg font-bold text-red-600">Reports</span>
                </p>
                <p className="text-sm text-red-600 mt-1 font-medium">Requiring immediate command review.</p>
              </div>
              
              <Link href="/monitoring">
                <Button className="w-full bg-[#1A237E] hover:bg-[#1A237E]/90 text-white group shadow-md">
                  Access Monitoring Vault
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FEATURED VISUAL REPORTS */}
        <Card className="shadow-lg overflow-hidden border-t-4 border-t-[#FBC02D] bg-white">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100">
            <CardTitle className="text-[#1A237E] font-bold uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="size-5 text-[#FBC02D]" />
              Featured Visual Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!carouselNews || carouselNews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <ImageIcon className="size-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No visual reports uploaded yet.</p>
                <p className="text-sm text-slate-400">Add news with images to see them featured here.</p>
              </div>
            ) : (
              <Carousel 
                opts={{ align: "start", loop: true }}
                className="w-full relative"
              >
                <CarouselContent className="-ml-4">
                  {carouselNews.map((news: any) => (
                    <CarouselItem key={news.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <a 
                        href={news.url || '#'} 
                        target={news.url ? "_blank" : "_self"}
                        rel="noopener noreferrer" 
                        className="block group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all h-[260px] border border-slate-200"
                        onClick={(e) => {
                            if (!news.url) {
                                e.preventDefault();
                                setSelectedNews(news);
                            }
                        }}
                      >
                        {/* THE FIX: Using your custom web.php route and the correct 'image_path' column! */}
                        <img 
                          src={`/news-image/${news.image_path}`} 
                          alt={news.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                             // If it STILL fails, it replaces the broken icon with a clean placeholder
                             e.currentTarget.src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80"; 
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A237E]/95 via-[#1A237E]/40 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-[#FBC02D] text-[#1A237E] text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-sm">
                              {news.media_outlet}
                            </span>
                            <span className="text-white/90 text-xs font-medium drop-shadow-md">
                              {news.date}
                            </span>
                          </div>
                          <h3 className="text-white font-bold leading-tight line-clamp-3 group-hover:text-[#FBC02D] transition-colors drop-shadow-lg">
                            {news.title}
                          </h3>
                        </div>
                      </a>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                <div className="hidden md:block">
                    <CarouselPrevious className="-left-5 bg-white shadow-lg hover:bg-slate-100 text-[#1A237E] border-slate-200" />
                    <CarouselNext className="-right-5 bg-white shadow-lg hover:bg-slate-100 text-[#1A237E] border-slate-200" />
                </div>
              </Carousel>
            )}
          </CardContent>
        </Card>

        {/* Recent Intelligence Table */}
        <Card className="shadow-md overflow-hidden border-t-4 border-t-slate-200 bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Recent Database Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Title</TableHead>
                  <TableHead className="font-bold text-slate-700">Media Source</TableHead>
                  <TableHead className="font-bold text-slate-700">Category</TableHead>
                  <TableHead className="font-bold text-slate-700">Date</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Details</TableHead>
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
                      <TableCell className="font-semibold text-slate-800 max-w-md truncate">{news.title}</TableCell>
                      <TableCell className="text-slate-600 font-medium">{news.media_outlet}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          news.category === 'Favorable' ? 'bg-green-100 text-green-800 border border-green-200' :
                          news.category === 'Unfavorable' ? 'bg-red-100 text-red-800 border border-red-200' : 
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {news.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 tabular-nums">{news.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-[#1A237E]/10 hover:text-[#1A237E]" onClick={() => setSelectedNews(news)}>
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