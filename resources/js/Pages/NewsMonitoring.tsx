import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Components/ui/table';
import { Label } from '../Components/ui/label';
import { Textarea } from '../Components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../Components/ui/dialog';
import { Eye, Pencil, Trash2, Search, Filter, X, ImageIcon } from 'lucide-react';
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

const mediaSources = {
  Local: ["Mindanao Times", "RMN DXDC 621 Davao", "SunStar Davao", "News Fort", "Bombo Radyo Davao", "PTV Davao", "Radyo Pilipinas Davao", "Edge Davao", "MDDN", "Mindanao Today", "MindaNews", "Bombo Radyo CDO", "SunStar Zamboanga", "CIO Davao City", "SunStar CDO", "Radyo Pilipinas Butuan", "Mindanao Gold Star Daily", "Bombo Radyo Butuan", "Brigada News Agusan", "RMN Malaybalay", "Mindanao Journal", "Superbalita Davao", "Mindanao Examiner", "Brigada News Gensan", "Brigada News CDO", "Brigada News Butuan", "Central Minda Newswatch", "News NOW", "PIA Caraga Region", "PIA Davao Region", "RPN DXKO CDO", "Davao Today", "NDBC News", "CDO Today", "Bombo Radyo Iloilo", "One Mindanao", "PLN Media", "Radyo Bandera Iloilo", "Watchmen Daily Journal", "RPN"],
  National: ["PNA", "PIA", "Manila Bulletin", "Kalinaw News", "Newsline Philippines", "Philippine Daily Inquirer", "The Manila Times", "Rappler", "The Philippine Star", "SMNI News", "PRWC", "Daily Tribune", "GMA News", "ABS-CBN News", "DZAR 1026", "Business Mirror", "Bombo Radyo PH", "Malaya Business Insight", "Manila Standard", "People's Tonight", "Remate", "Abante", "Global Daily Mirror", "RMN Manila", "Balita", "CNN Philippines", "Kidlat News Channel", "Net25 News", "One News", "PTV", "Radyo Agila", "Radyo Inquirer", "Journal News Online", "Dailymotion", "Filipino News", "PageOne PH", "Radyo Pilipinas", "Radyo Pilipinas Manila", "News 5", "ANC", "Brigada News PH", "Bulgar Online", "DWDD", "DZRH", "Radyo Natin Nationwide", "Tempo", "UNTV News and Rescue", "Maharlika TV", "Super Radyo DZBB"],
  International: ["News Beezer", "Benar News", "Republic Asia Media", "News 360", "Reuters", "US News"]
};

const allSourcesFlat = [...mediaSources.Local, ...mediaSources.National, ...mediaSources.International];

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
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">News Monitoring</h2>}>
      <Head title="News Monitoring - EMC" />

      <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8">
        
        {/* THE FIX: Forced white background on the Header so it is always readable */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1E293B]">News Monitoring</h1>
            <p className="text-slate-500 mt-1 font-medium">Monitor, edit, and update all news entries</p>
          </div>
        </div>

        {/* THE FIX: Added bg-white to explicitly stop Dark Mode from turning the card dark grey */}
        <Card className="shadow-md bg-white border border-slate-200 border-t-4 border-t-[#1E293B]">
          <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-[#1E293B]"><Filter className="size-5" /> Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input placeholder="Search titles, summaries, or reporters..." className="pl-10 bg-white text-slate-900 border-slate-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300"><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent className="max-h-[300px] bg-white">
                  <SelectItem value="all">All Sources</SelectItem>
                  {allSourcesFlat.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Favorable">Favorable</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Unfavorable">Unfavorable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* THE FIX: Added bg-white to the Table Card */}
        <Card className="shadow-md bg-white border border-slate-200 border-t-4 border-t-[#7B1E1E]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-slate-800 font-bold">Title</TableHead>
                  <TableHead className="text-slate-800 font-bold">Source</TableHead>
                  <TableHead className="text-slate-800 font-bold">Reporter</TableHead>
                  <TableHead className="text-slate-800 font-bold">Category</TableHead>
                  <TableHead className="text-slate-800 font-bold">Date</TableHead>
                  <TableHead className="text-right text-slate-800 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNews.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No reports found.</TableCell></TableRow>
                ) : (
                  filteredNews.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50 border-b border-slate-100">
                      <TableCell className="font-semibold text-slate-900 max-w-sm truncate">{item.title}</TableCell>
                      <TableCell className="text-slate-700">{item.media_outfit}</TableCell>
                      <TableCell className="text-slate-500">{item.reporter || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.category === 'Favorable' ? 'bg-green-100 text-green-800' :
                          item.category === 'Unfavorable' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                        }`}>{item.category}</span>
                      </TableCell>
                      <TableCell className="text-slate-700">{item.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedNews(item)} className="text-slate-600 hover:text-[#1E293B] hover:bg-slate-100"><Eye className="size-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditNews(item)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"><Pencil className="size-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50"><Trash2 className="size-4" /></Button>
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
    </AuthenticatedLayout>
  );
}

function EditModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(item.image_path ? `/news-image/${item.image_path}` : null);
  
  let initialScope = 'Local'; 
  let initialMediaOutfit = item.media_outfit;
  let initialCustomOutfit = '';

  if (mediaSources.National.includes(item.media_outfit)) {
      initialScope = 'National';
  } else if (mediaSources.International.includes(item.media_outfit)) {
      initialScope = 'International';
  } else if (!mediaSources.Local.includes(item.media_outfit)) {
      initialScope = 'Local';
      initialMediaOutfit = 'Others';
      initialCustomOutfit = item.media_outfit;
  }

  const { data, setData, post, processing, transform } = useForm({
    title: item.title,
    summary: item.summary,
    scope: initialScope,
    media_outfit: initialMediaOutfit,
    custom_media_outfit: initialCustomOutfit,
    reporter: item.reporter || '',
    topic: item.topic,
    unit_involved: item.unit_involved,
    category: item.category,
    date: item.date,
    url: item.url || '',
    image: null as File | null,
  });

  transform((formData) => ({
    ...formData,
    media_outfit: formData.media_outfit === 'Others' ? formData.custom_media_outfit : formData.media_outfit,
  }));

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

  const currentMediaList = data.scope ? mediaSources[data.scope as keyof typeof mediaSources] : [];
  const dropdownItemClass = "text-slate-800 cursor-pointer focus:bg-[#7B1E1E] focus:text-white font-medium py-2";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl rounded-xl border border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-4 mb-2">
          <DialogTitle className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <Pencil className="size-5 text-[#7B1E1E]" /> Edit Intelligence Report
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6">
          <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center transition-all hover:bg-slate-100">
            <Label className="mb-4 text-slate-800 font-bold text-center w-full flex items-center justify-center gap-2">
              <ImageIcon className="size-5 text-slate-500" /> Article Screenshot
            </Label>
            {imagePreview ? (
              <div className="relative w-full flex justify-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                <img src={imagePreview} alt="Preview" className="max-h-56 w-auto object-contain rounded-md" />
                <button type="button" onClick={() => { setImagePreview(null); setData('image', null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 hover:scale-110 transition-all"><X className="size-4" /></button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <Input type="file" accept="image/*" onChange={handleImageChange} className="bg-white text-slate-700 max-w-xs cursor-pointer border-slate-300 shadow-sm" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Headline / Title *</Label>
            <Input value={data.title} onChange={e => setData('title', e.target.value)} required className="bg-white text-slate-900 border-slate-300 focus:ring-[#7B1E1E]" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Executive Summary *</Label>
            <Textarea value={data.summary} onChange={e => setData('summary', e.target.value)} rows={5} required className="bg-white text-slate-900 border-slate-300 focus:ring-[#7B1E1E]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Media Scope *</Label>
              <Select value={data.scope} onValueChange={(val) => { setData('scope', val); setData('media_outfit', ''); }}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300"><SelectValue placeholder="Select scope" /></SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="Local" className={dropdownItemClass}>Local</SelectItem>
                  <SelectItem value="National" className={dropdownItemClass}>National</SelectItem>
                  <SelectItem value="International" className={dropdownItemClass}>International</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Media Outfit *</Label>
              <Select value={data.media_outfit} onValueChange={(val) => setData('media_outfit', val)} disabled={!data.scope}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300"><SelectValue placeholder="Select outfit" /></SelectTrigger>
                <SelectContent className="bg-white z-50 max-h-[300px]">
                  {currentMediaList.map(s => <SelectItem key={s} value={s} className={dropdownItemClass}>{s}</SelectItem>)}
                  <SelectItem value="Others" className="text-[#7B1E1E] font-bold cursor-pointer focus:bg-[#7B1E1E] focus:text-white py-2 border-t mt-1">Others (Manual Input)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.media_outfit === 'Others' && (
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Specify Media *</Label>
                <Input value={data.custom_media_outfit} onChange={e => setData('custom_media_outfit', e.target.value)} required className="bg-white text-slate-900 border-slate-300 focus:ring-[#7B1E1E]" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Reporter Name</Label>
              <Input value={data.reporter} onChange={e => setData('reporter', e.target.value)} className="bg-white text-slate-900 border-slate-300" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Unit Involved</Label>
              <Input value={data.unit_involved} onChange={e => setData('unit_involved', e.target.value)} disabled className="bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Topic *</Label>
              <Select value={data.topic} onValueChange={v => setData('topic', v)}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300"><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent className="max-h-[250px] bg-white z-50">
                  {topicsList.map(topic => <SelectItem key={topic} value={topic} className="cursor-pointer">{topic}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Category (Sentiment) *</Label>
              <Select value={data.category} onValueChange={v => setData('category', v)}>
                <SelectTrigger className="bg-white text-slate-900 border-slate-300"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="Favorable" className="text-green-700 font-bold cursor-pointer">Favorable</SelectItem>
                  <SelectItem value="Neutral" className="text-slate-600 font-bold cursor-pointer">Neutral</SelectItem>
                  <SelectItem value="Unfavorable" className="text-red-700 font-bold cursor-pointer">Unfavorable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label className="font-bold text-slate-700">Date *</Label>
                <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required className="bg-white text-slate-900 border-slate-300 focus:ring-[#7B1E1E]" />
            </div>
            <div className="space-y-2">
                <Label className="font-bold text-slate-700">News Link (URL)</Label>
                <Input value={data.url} onChange={e => setData('url', e.target.value)} placeholder="https://" className="bg-white text-slate-900 border-slate-300 focus:ring-[#7B1E1E]" />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="bg-white border-slate-300 text-slate-700 hover:bg-slate-100">Cancel</Button>
            <Button type="submit" disabled={processing} className="bg-[#7B1E1E] hover:bg-[#7B1E1E]/90 text-white font-bold px-8 shadow-md">
              Save All Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}