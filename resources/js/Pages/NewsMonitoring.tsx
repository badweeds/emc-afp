import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Components/ui/table';
import { Label } from '../Components/ui/label';
import { Textarea } from '../Components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../Components/ui/dialog';
import { Eye, Pencil, Trash2, Search, Filter, X } from 'lucide-react';
import { NewsModal } from '../Components/NewsModal';
import { toast } from 'sonner';

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  media_outfit: string;
  reporter: string | null;
  topic: string;
  unit_involved: string;
  category: string;
  url: string;
  date: string;
  image_path: string | null;
}

const topicsList = [
  "Accomplishment", "Checkpoint Seizure", "FRs Reconciliation", "HADR Operations", "CTG Mem Surrender", 
  "Surrender/Arms Cache", "Encounter", "Arms Cache", "Culture of Security", "Destabilization", 
  "NPA Dismantling", "Unit Installation", "E-CLIP Programs", "NPA Ambush/Atrocity", "Outreach Program", 
  "Commemoration", "CSP", "New Year's Call", "POs Programs", "New/Upgraded Facility", 
  "New Commander/Officer", "Security Operations", "Unit Visit", "Blood Donation", "Killed Soldier", 
  "Reservist Affairs", "BGen Durante Case", "Unit Anniversary", "NPA Arrest", "New Assets", 
  "CTG Mem Abduction", "POs Issues/Concerns", "Persona Non-Grata", "Harassment by Troops", "ITDS Sustainment", 
  "MILF Holding of Troops", "Sportsfest", "Troops Education", "Camp Shooting", "Drug Involvement", 
  "AFP Recruitment", "Morale & Welfare", "Soldier Recognition", "Partners Engagement", "Training/Exercise", 
  "Bomb/IED Retrieval", "Spiritual Enhancement", "BDP Project", "Killed NPA Assitance", "Chad Booc Death", 
  "NPA Condemnation", "FCEMC Appointment", "POC Engagements", "GAD", "Int'l Military Visit", 
  "Youth Empowerment", "Farewell Visit", "Govt Official Killing", "Insurgency-Free", "Ex-Troops Monitoring", 
  "Campaign Plan", "Peace Forum", "Stakeholder Support", "Stakeholder Visit", "MOA/Partnership", 
  "Environmental Activity", "Search Operation", "Promotion", "PAGs Update", "Aerial/Artillery Bombing", 
  "Illegal Firearms", "Pilgram Visit", "Kidnapped Civilians", "Transport Assistance", "Security Update", 
  "Peace Rally", "Symposium", "CTG Monitoring", "Civilian Killing", "AOR Expansion", "Fake Soldier", 
  "Event Participation", "CORPAT", "Illegal Mining", "FB Page Hacking", "Unit Recognition", "Unit Send-Off", 
  "Bomb Explosion/Scare", "Friendly Games", "Smuggling Apprehension", "PMA Examination", "Extrajudicial Killings", 
  "Peace Monument", "White Area Operations", "Election Security", "Stress Debriefing", "New Soldiers", 
  "Ceasefire", "Ramming Incident", "Troop Accident"
];

const newsSources = ["Mindanao Times", "RMN DXDC 621 Davao", "SunStar Davao", "Inquirer", "Philippine Star", "Manila Bulletin", "GMA News", "ABS-CBN News", "Rappler", "Others"];

export default function NewsMonitoring({ news = [] }: { news: NewsItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [editNews, setEditNews] = useState<NewsItem | null>(null);
  
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
                         (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.reporter && item.reporter.toLowerCase().includes(searchTerm.toLowerCase()));
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
          <p className="text-gray-500 mt-1">Monitor, edit, and update all news entries</p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="size-5" /> Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input placeholder="Search titles, summaries, or reporters..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">No reports found.</TableCell></TableRow>
              ) : (
                filteredNews.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium max-w-sm truncate">{item.title}</TableCell>
                    <TableCell>{item.media_outfit}</TableCell>
                    <TableCell className="text-gray-600">{item.reporter || 'N/A'}</TableCell>
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

      {selectedNews && <NewsModal news={selectedNews as any} open={!!selectedNews} onClose={() => setSelectedNews(null)} />}
      {editNews && <EditModal item={editNews} onClose={() => setEditNews(null)} />}
    </div>
  );
}

// 2. UPGRADED EDIT MODAL WITH IMAGE UPLOAD, REPORTER & TOPIC DROPDOWN
function EditModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(item.image_path ? `/news-image/${item.image_path}` : null);
  
  const { data, setData, post, processing } = useForm({
    _method: 'patch', 
    title: item.title,
    summary: item.summary,
    media_outfit: item.media_outfit,
    reporter: item.reporter || '',
    topic: item.topic,
    unit_involved: item.unit_involved,
    category: item.category,
    date: item.date,
    url: item.url || '',
    image: null as File | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/news/${item.id}`, {
      forceFormData: true,
      onSuccess: () => {
        toast.success('Report updated successfully');
        onClose();
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Intelligence Report</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-4">
          
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
            <Label className="mb-2 text-slate-700 font-bold">Replace Screenshot (Optional)</Label>
            {imagePreview ? (
              <div className="relative inline-block mt-2">
                <img src={imagePreview} alt="Preview" className="h-32 rounded-md shadow border border-slate-200 object-cover" />
                <button type="button" onClick={() => { setImagePreview(null); setData('image', null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"><X className="size-4" /></button>
              </div>
            ) : (
              <Input type="file" accept="image/*" onChange={handleImageChange} className="bg-white mt-2 cursor-pointer" />
            )}
            <p className="text-xs text-gray-400 mt-2">Upload a new image to replace the current one.</p>
          </div>

          <div className="space-y-2">
            <Label>Headline / Title</Label>
            <Input value={data.title} onChange={e => setData('title', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <Textarea value={data.summary} onChange={e => setData('summary', e.target.value)} rows={3} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Input value={data.media_outfit} onChange={e => setData('media_outfit', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Reporter Name</Label>
              <Input value={data.reporter} onChange={e => setData('reporter', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* UPDATED TOPIC FIELD TO DROPDOWN */}
            <div className="space-y-2">
              <Label>Topic</Label>
              <Select value={data.topic} onValueChange={v => setData('topic', v)}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {topicsList.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                </SelectContent>
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

          <div className="space-y-2">
              <Label>News Link (URL)</Label>
              <Input value={data.url} onChange={e => setData('url', e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={processing} className="bg-[#7B1E1E] hover:bg-[#7B1E1E]/90 text-white">Save All Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}