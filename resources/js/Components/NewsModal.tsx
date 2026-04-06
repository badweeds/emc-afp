import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { RiskBadge } from './RiskBadge'; // Ensure this component is updated to handle 'Favorable', etc.
import { Badge } from './ui/badge';
import { ExternalLink, Calendar, Link as LinkIcon, Building2 } from 'lucide-react';

interface NewsModalProps {
  news: {
    title: string;
    media_outfit: string;
    summary: string;
    category: string;
    date: string;
    url?: string;
  };
  open: boolean;
  onClose: () => void;
}

export function NewsModal({ news, open, onClose }: NewsModalProps) {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-[#1E293B] leading-tight">
            {news.title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-3 pt-3">
            {/* Category / Sentiment Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                news.category === 'Favorable' ? 'bg-green-100 text-green-700 border-green-200' :
                news.category === 'Unfavorable' ? 'bg-red-100 text-red-700 border-red-200' : 
                'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
                {news.category}
            </span>

            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <Calendar className="size-3.5" />
              {new Date(news.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Media Outfit Section */}
          <div className="flex gap-3">
            <div className="p-2 bg-slate-100 rounded-lg h-fit">
                <Building2 className="size-5 text-slate-600" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Media Outfit</h3>
                <p className="text-lg font-semibold text-slate-700">{news.media_outfit}</p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Intelligence Summary</h3>
            <p className="text-slate-700 leading-relaxed italic">
              "{news.summary}"
            </p>
          </div>

          {/* URL Section */}
          {news.url && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Original Source Link</h3>
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#7B1E1E] font-medium hover:underline group"
              >
                <LinkIcon className="size-4" />
                <span className="truncate max-w-md">{news.url}</span>
                <ExternalLink className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
                Close Briefing
            </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}