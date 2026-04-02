import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { RiskBadge } from './RiskBadge';
import { Badge } from './ui/badge';
import { ExternalLink } from 'lucide-react';
import type { NewsItem } from '../data/mockData';

interface NewsModalProps {
  news: NewsItem;
  open: boolean;
  onClose: () => void;
}

export function NewsModal({ news, open, onClose }: NewsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{news.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <RiskBadge level={news.riskLevel} />
              <Badge variant="outline">{news.category}</Badge>
              <span className="text-sm text-gray-500">
                {new Date(news.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <h3 className="font-semibold mb-2">Source</h3>
            <p className="text-gray-600">{news.source}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-gray-600 leading-relaxed">{news.summary}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">News Link</h3>
            <a 
              href={news.newsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#7B1E1E] hover:underline flex items-center gap-1"
            >
              {news.newsLink}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
