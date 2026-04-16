import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Calendar, User, Building, Link as LinkIcon } from 'lucide-react';

interface NewsItem {
  id?: number;
  title: string;
  summary: string;
  media_outlet: string;
  reporter: string | null;
  topic: string;
  unit_involved: string;
  category: string;
  url: string;
  date: string;
  image_path: string | null;
}

interface NewsModalProps {
  news: NewsItem | null;
  open: boolean;
  onClose: () => void;
}

export function NewsModal({ news, open, onClose }: NewsModalProps) {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white p-0 rounded-xl shadow-2xl border-0">
        
        {/* Dynamic Image Banner */}
        {news.image_path && (
          <div className="w-full bg-slate-100 flex items-center justify-center overflow-hidden rounded-t-xl border-b border-slate-200">
            <img 
              src={`/news-image/${news.image_path}`} 
              alt="News Clipping" 
              className="w-full max-h-[400px] object-contain" 
            />
          </div>
        )}

        <div className="p-8 md:p-10">
          
          {/* Top Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md tracking-wide uppercase border border-slate-200">
              {news.topic}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-md tracking-wide uppercase border ${
              news.category === 'Favorable' ? 'bg-green-100 text-green-800 border-green-200' :
              news.category === 'Unfavorable' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'
            }`}>
              {news.category} Sentiment
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md tracking-wide uppercase border border-blue-100">
              {news.unit_involved}
            </span>
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              {news.title}
            </DialogTitle>
            <DialogDescription className="hidden">Intelligence Report Details</DialogDescription>
          </DialogHeader>

          {/* THE FIX: Correctly mapped Media Outlet to Building and Reporter to User */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 mb-8 pb-6 border-b border-slate-200">
            
            {/* Building Icon -> Media Outlet (Publisher) */}
            {news.media_outlet && (
                <div className="flex items-center gap-2">
                    <Building className="size-4 text-[#7B1E1E]"/> 
                    <span className="font-bold text-slate-800">{news.media_outlet}</span>
                </div>
            )}

            {/* User Icon -> Reporter (Author) */}
            {news.reporter && (
                <div className="flex items-center gap-2">
                    <User className="size-4 text-[#7B1E1E]"/> 
                    <span className="font-medium">{news.reporter}</span>
                </div>
            )}

            {/* Calendar Icon -> Date */}
            {news.date && (
                <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-[#7B1E1E]"/> 
                    <span className="font-medium">{news.date}</span>
                </div>
            )}

            {/* Link Icon -> URL */}
            {news.url && (
              <a href={news.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                <LinkIcon className="size-4"/> <span>Original Source</span>
              </a>
            )}
          </div>

          {/* Article Body */}
          <div className="text-lg text-slate-800 leading-relaxed space-y-5 tracking-wide">
            {news.summary.split('\n').map((paragraph, idx) => {
              const cleanParagraph = paragraph.trim();
              if (!cleanParagraph) return null;
              return (
                <p key={idx} className="text-justify">
                  {cleanParagraph}
                </p>
              );
            })}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}