import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Sparkles, Loader2, Save, Image as ImageIcon, X } from 'lucide-react';
import axios from 'axios';

const militaryUnits = [
  "Eastern Mindanao Command (EastMinCom) Headquarters",
  "Naval Forces Eastern Mindanao (NFEM)",
  "Tactical Operations Group 10 (TOG 10)",
  "4th Infantry Division (4ID)",
  "10th Infantry Division (10ID)"
];

const mediaSources = {
  Local: [
    "Mindanao Times", "RMN DXDC 621 Davao", "SunStar Davao", "News Fort", "Bombo Radyo Davao", "PTV Davao", "Radyo Pilipinas Davao", "Edge Davao", "MDDN", "Mindanao Today", "MindaNews", "Bombo Radyo CDO", "SunStar Zamboanga", "CIO Davao City", "SunStar CDO", "Radyo Pilipinas Butuan", "Mindanao Gold Star Daily", "Bombo Radyo Butuan", "Brigada News Agusan", "RMN Malaybalay", "Mindanao Journal", "Superbalita Davao", "Mindanao Examiner", "Brigada News Gensan", "Brigada News CDO", "Brigada News Butuan", "Central Minda Newswatch", "News NOW", "PIA Caraga Region", "PIA Davao Region", "RPN DXKO CDO", "Davao Today", "NDBC News", "CDO Today", "Bombo Radyo Iloilo", "One Mindanao", "PLN Media", "Radyo Bandera Iloilo", "Watchmen Daily Journal", "RPN"
  ],
  National: [
    "PNA", "PIA", "Manila Bulletin", "Kalinaw News", "Newsline Philippines", "Philippine Daily Inquirer", "The Manila Times", "Rappler", "The Philippine Star", "SMNI News", "PRWC", "Daily Tribune", "GMA News", "ABS-CBN News", "DZAR 1026", "Business Mirror", "Bombo Radyo PH", "Malaya Business Insight", "Manila Standard", "People's Tonight", "Remate", "Abante", "Global Daily Mirror", "RMN Manila", "Balita", "CNN Philippines", "Kidlat News Channel", "Net25 News", "One News", "PTV", "Radyo Agila", "Radyo Inquirer", "Journal News Online", "Dailymotion", "Filipino News", "PageOne PH", "Radyo Pilipinas", "Radyo Pilipinas Manila", "News 5", "ANC", "Brigada News PH", "Bulgar Online", "DWDD", "DZRH", "Radyo Natin Nationwide", "Tempo", "UNTV News and Rescue", "Maharlika TV", "Super Radyo DZBB"
  ],
  International: [
    "News Beezer", "Benar News", "Republic Asia Media", "News 360", "Reuters", "US News"
  ]
};

export default function AddNews() {
  const [rawContent, setRawContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, setData, post, processing, reset, transform } = useForm({
    title: '',
    summary: '',
    scope: '', 
    media_outfit: '',
    custom_media_outfit: '', 
    topic: '',
    unit_involved: '',
    category: '', 
    url: '',
    date: new Date().toISOString().split('T')[0],
    image: null as File | null,
  });

  transform((formData) => ({
    ...formData,
    media_outfit: formData.media_outfit === 'Others' ? formData.custom_media_outfit : formData.media_outfit,
  }));

  const handleAIAnalysis = async () => {
    if (!rawContent) {
      toast.error("Please paste the article text first!");
      return;
    }
    setIsAnalyzing(true);
    toast.info("AI Intelligence is analyzing the news...");
    
    try {
      const response = await axios.post('/analyze-news', { content: rawContent });
      setData(prev => ({
        ...prev,
        summary: response.data.summary || '',
        category: response.data.category || ''
      }));
      toast.success("AI Analysis Complete!");
    } catch (error) {
      toast.error("AI Analysis failed. Please check your API Key and internet connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/news', {
      onSuccess: () => {
        toast.success('News saved successfully!');
        reset();
        setRawContent('');
        setImagePreview(null);
      },
    });
  };

  const currentMediaList = data.scope ? mediaSources[data.scope as keyof typeof mediaSources] : [];

  // Reusable styling class for Dropdown Items to match the Logo (Maroon Hover)
  const dropdownItemClass = "text-slate-800 cursor-pointer focus:bg-[#7B1E1E] focus:text-white font-medium py-2";

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Add Intelligence Report</h2>}
    >
      <Head title="Add News - EMC" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* AI AUTO-ANALYZER */}
        <Card className="border-t-4 border-t-[#1E293B] shadow-md bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-[#1E293B] flex items-center gap-2">
              <Sparkles className="size-5" /> AI Auto-Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Paste Full Article Text Here</Label>
              <Textarea 
                placeholder="Paste news text here for AI to summarize..."
                className="min-h-[120px] bg-slate-50 border-slate-300 text-slate-800 focus:border-[#1E293B] focus:ring-[#1E293B]"
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleAIAnalysis} disabled={isAnalyzing} className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white font-bold">
              {isAnalyzing ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
              {isAnalyzing ? "Analyzing Intelligence..." : "Auto-Fill with AI"}
            </Button>
          </CardContent>
        </Card>

        {/* OFFICIAL FORM */}
        <Card className="shadow-md border-t-4 border-t-[#7B1E1E] bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-[#7B1E1E]">
              <PlusCircle className="size-5" /> News Record Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Image Upload */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                <Label className="mb-2 text-slate-700 font-bold">Article Screenshot (Optional)</Label>
                {imagePreview ? (
                  <div className="relative inline-block mt-2">
                    <img src={imagePreview} alt="Preview" className="h-40 rounded-md shadow border border-slate-200" />
                    <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"><X className="size-4" /></button>
                  </div>
                ) : (
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="bg-white mt-2 cursor-pointer text-slate-600 border-slate-300" />
                )}
              </div>

              {/* Title & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Headline / Title *</Label>
                  <Input value={data.title} onChange={e => setData('title', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Executive Summary *</Label>
                  <Textarea rows={3} value={data.summary} onChange={e => setData('summary', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
              </div>

              {/* Media Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Media Scope *</Label>
                  <Select value={data.scope} onValueChange={(val) => { setData('scope', val); setData('media_outfit', ''); }}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select scope" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50">
                      <SelectItem value="Local" className={dropdownItemClass}>Local</SelectItem>
                      <SelectItem value="National" className={dropdownItemClass}>National</SelectItem>
                      <SelectItem value="International" className={dropdownItemClass}>International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Media Outfit *</Label>
                  <Select value={data.media_outfit} onValueChange={(val) => setData('media_outfit', val)} disabled={!data.scope}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select outfit" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50 max-h-[300px]">
                      {currentMediaList.map(s => <SelectItem key={s} value={s} className={dropdownItemClass}>{s}</SelectItem>)}
                      <SelectItem value="Others" className="text-[#7B1E1E] font-bold cursor-pointer focus:bg-[#7B1E1E] focus:text-white py-2 border-t mt-1">Others (Manual Input)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.media_outfit === 'Others' && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Specify Media Name *</Label>
                    <Input value={data.custom_media_outfit} onChange={e => setData('custom_media_outfit', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  </div>
                )}
              </div>

              {/* Unit & Sentiment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Unit Involved *</Label>
                  <Select value={data.unit_involved} onValueChange={(val) => setData('unit_involved', val)}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select unit" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50 max-h-[300px]">
                      {militaryUnits.map(unit => <SelectItem key={unit} value={unit} className={dropdownItemClass}>{unit}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Topic *</Label>
                  <Input value={data.topic} onChange={e => setData('topic', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Category (Sentiment) *</Label>
                  <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select sentiment" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50">
                      <SelectItem value="Favorable" className="text-green-700 cursor-pointer focus:bg-green-700 focus:text-white font-bold py-2">Favorable</SelectItem>
                      <SelectItem value="Neutral" className="text-slate-600 cursor-pointer focus:bg-slate-600 focus:text-white font-bold py-2">Neutral</SelectItem>
                      <SelectItem value="Unfavorable" className="text-red-700 cursor-pointer focus:bg-red-700 focus:text-white font-bold py-2">Unfavorable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Date *</Label>
                  <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">News Link (URL)</Label>
                  <Input type="url" value={data.url} onChange={e => setData('url', e.target.value)} placeholder="https://" className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button type="submit" disabled={processing} className="bg-[#7B1E1E] hover:bg-[#7B1E1E]/90 text-white font-bold px-10 shadow-md">
                  {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Save News Entry
                </Button>
                <Button type="button" variant="outline" onClick={() => { reset(); setImagePreview(null); }} className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold">
                  Reset Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}