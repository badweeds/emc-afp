import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Calendar, User, Building, Link as LinkIcon, Edit, Save } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';

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
  scope?: string;
}

interface NewsModalProps {
  news: NewsItem | null;
  open: boolean;
  onClose: () => void;
  editable?: boolean; // NEW: Tells the modal if it's allowed to edit
}

export default function NewsModal({ news, open, onClose, editable = false }: NewsModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Setup our edit form
  const { data, setData, post, processing } = useForm({
    title: '', summary: '', media_outlet: '', reporter: '',
    topic: '', unit_involved: '', category: '', url: '', date: '', scope: ''
  });

  // Sync form data whenever a new article is opened
  useEffect(() => {
    if (news) {
      setData({
        title: news.title || '', summary: news.summary || '',
        media_outlet: news.media_outlet || '', reporter: news.reporter || '',
        topic: news.topic || '', unit_involved: news.unit_involved || '',
        category: news.category || '', url: news.url || '',
        date: news.date || '', scope: news.scope || ''
      });
    }
    setIsEditing(false); // Always start in view mode
  }, [news, open]);

  if (!news) return null;

  // Handle the Save button
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/news/${news.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setIsEditing(false);
        onClose(); // Close modal immediately after successful save
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-white p-0 rounded-xl shadow-2xl border-0">
        
        {/* ========================================== */}
        {/* EDIT MODE VIEW */}
        {/* ========================================== */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">Edit News Article</DialogTitle>
              <DialogDescription>Update the details before approving.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={data.title} onChange={e => setData('title', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Media Outlet</Label>
                <Input value={data.media_outlet} onChange={e => setData('media_outlet', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Reporter (Optional)</Label>
                <Input value={data.reporter} onChange={e => setData('reporter', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input value={data.topic} onChange={e => setData('topic', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Category (Sentiment)</Label>
                <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                    value={data.category} 
                    onChange={e => setData('category', e.target.value)} required
                >
                    <option value="">Select Category...</option>
                    <option value="Favorable">Favorable</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Unfavorable">Unfavorable</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Unit Involved</Label>
                <Input value={data.unit_involved} onChange={e => setData('unit_involved', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>URL (Optional)</Label>
                <Input value={data.url} onChange={e => setData('url', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Article Summary / Body</Label>
              <Textarea 
                value={data.summary} 
                onChange={e => setData('summary', e.target.value)} 
                required 
                className="min-h-[250px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={processing} className="bg-blue-700 hover:bg-blue-800 text-white">
                <Save className="size-4 mr-2" /> Save Changes
              </Button>
            </div>
          </form>

        ) : (
          
        /* ========================================== */
        /* STANDARD READING VIEW */
        /* ========================================== */
        <>
          {news.image_path && (
            <div className="w-full bg-slate-100 flex items-center justify-center overflow-hidden rounded-t-xl border-b border-slate-200">
              <img src={`/news-image/${news.image_path}`} alt="News Clipping" className="w-full max-h-[400px] object-contain" />
            </div>
          )}

          <div className="p-8 md:p-10">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md tracking-wide uppercase border border-slate-200">{news.topic}</span>
              <span className={`px-3 py-1 text-xs font-bold rounded-md tracking-wide uppercase border ${news.category === 'Favorable' ? 'bg-green-100 text-green-800 border-green-200' : news.category === 'Unfavorable' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{news.category} Sentiment</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md tracking-wide uppercase border border-blue-100">{news.unit_involved}</span>
            </div>
            
            <DialogHeader className="flex flex-row items-start justify-between gap-4 mb-6">
              <div>
                <DialogTitle className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">{news.title}</DialogTitle>
                <DialogDescription className="hidden">Intelligence Report Details</DialogDescription>
              </div>
              
              {/* EDIT BUTTON */}
              {editable && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="shrink-0">
                  <Edit className="size-4 mr-2" /> Edit Article
                </Button>
              )}
            </DialogHeader>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 mb-8 pb-6 border-b border-slate-200">
              {news.media_outlet && (<div className="flex items-center gap-2"><Building className="size-4 text-[#7B1E1E]"/> <span className="font-bold text-slate-800">{news.media_outlet}</span></div>)}
              {news.reporter && (<div className="flex items-center gap-2"><User className="size-4 text-[#7B1E1E]"/> <span className="font-medium">{news.reporter}</span></div>)}
              {news.date && (<div className="flex items-center gap-2"><Calendar className="size-4 text-[#7B1E1E]"/> <span className="font-medium">{news.date}</span></div>)}
              {news.url && (<a href={news.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"><LinkIcon className="size-4"/> <span>Original Source</span></a>)}
            </div>

            <div className="text-lg text-slate-800 leading-relaxed space-y-5 tracking-wide">
              {news.summary.split('\n').map((paragraph, idx) => {
                const cleanParagraph = paragraph.trim();
                if (!cleanParagraph) return null;
                return <p key={idx} className="text-justify">{cleanParagraph}</p>;
              })}
            </div>
          </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}