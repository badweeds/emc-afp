import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Eye, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { NewsModal } from '../components/NewsModal';
import { toast } from 'sonner';

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  media_outfit: string;
  topic: string;
  unit_involved: string;
  category: string;
  url: string;
  date: string;
}

const newsSources = ["Inquirer", "Philippine Star", "Manila Bulletin", "GMA News", "ABS-CBN News", "Rappler", "Local Radio", "Social Media", "Others"];

export default function NewsMonitoring({ news = [] }: { news: NewsItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [editNews, setEditNews] = useState<NewsItem | null>(null); // For the Edit Modal
  
  // 1. DELETE LOGIC
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to permanently delete this news entry?')) {
      router.delete(`/news/${id}`, {
        onSuccess: () => toast.success('Entry deleted successfully'),
        onError: () => toast.error('Failed to delete')
      });
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSource = filterSource === 'all' || item.media_outfit === filterSource;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesSource && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8">
      <Head title="News Monitoring - EMC" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-[#1E293B]">News Monitoring</h1>
          <p className="text-gray-500 mt-1">Monitor and filter all news entries</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="size-5" /> Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input placeholder="Search reports..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {newsSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Favorable">Favorable</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Unfavorable">Unfavorable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No reports found.</TableCell></TableRow>
              ) : (
                filteredNews.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium max-w-md truncate">{item.title}</TableCell>
                    <TableCell>{item.media_outfit}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.category === 'Favorable' ? 'bg-green-100 text-green-700' :
                        item.category === 'Unfavorable' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>{item.category}</span>
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedNews(item)}><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditNews(item)} className="text-blue-600"><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Modal */}
      {selectedNews && <NewsModal news={selectedNews as any} open={!!selectedNews} onClose={() => setSelectedNews(null)} />}

      {/* Edit Modal Component (Logic below) */}
      {editNews && <EditModal item={editNews} onClose={() => setEditNews(null)} />}
    </div>
  );
}

// 2. THE EDIT MODAL COMPONENT
function EditModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const { data, setData, patch, processing } = useForm({
    title: item.title,
    summary: item.summary,
    media_outfit: item.media_outfit,
    topic: item.topic,
    unit_involved: item.unit_involved,
    category: item.category,
    date: item.date,
    url: item.url
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(`/news/${item.id}`, {
      onSuccess: () => {
        toast.success('Report updated successfully');
        onClose();
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Edit News Entry</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={data.title} onChange={e => setData('title', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <Textarea value={data.summary} onChange={e => setData('summary', e.target.value)} rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={data.media_outfit} onValueChange={v => setData('media_outfit', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{newsSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={data.category} onValueChange={v => setData('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Favorable">Favorable</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Unfavorable">Unfavorable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={processing} className="bg-[#7B1E1E]">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}