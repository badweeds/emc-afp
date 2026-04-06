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
    try {
      const response = await axios.post('/analyze-news', { content: rawContent });
      setData(prev => ({
        ...prev,
        summary: response.data.summary || '',
        category: response.data.category || ''
      }));
      toast.success("AI Analysis Complete!");
    } catch (error) {
      toast.error("AI Analysis failed.");
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

  return (
    <AuthenticatedLayout
      header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Add Intelligence Report</h2>}
    >
      <Head title="Add News - EMC" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* AI AUTO-ANALYZER */}
        <Card className="border-t-4 border-t-blue-600 shadow-md">
          <CardHeader className="bg-blue-50/50">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Sparkles className="size-5" /> AI Auto-Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Paste Full Article Text Here</Label>
              <Textarea 
                placeholder="Paste news text here for AI to summarize..."
                className="min-h-[120px] bg-slate-50"
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleAIAnalysis} disabled={isAnalyzing} className="bg-blue-600 hover:bg-blue-700">
              {isAnalyzing ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
              {isAnalyzing ? "Analyzing..." : "Auto-Fill with AI"}
            </Button>
          </CardContent>
        </Card>

        {/* OFFICIAL FORM */}
        <Card className="shadow-md border-t-4 border-t-[#7B1E1E]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#7B1E1E]">
              <PlusCircle className="size-5" /> News Record Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Image Upload */}
              <div className="p-4 bg-slate-50 border border-dashed rounded-lg">
                <Label className="mb-2">Article Screenshot (Optional)</Label>
                {imagePreview ? (
                  <div className="relative inline-block mt-2">
                    <img src={imagePreview} alt="Preview" className="h-40 rounded-md shadow" />
                    <button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="size-4" /></button>
                  </div>
                ) : (
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="bg-white mt-2" />
                )}
              </div>

              {/* Title & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Headline / Title *</Label>
                  <Input value={data.title} onChange={e => setData('title', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Executive Summary *</Label>
                  <Textarea rows={3} value={data.summary} onChange={e => setData('summary', e.target.value)} required />
                </div>
              </div>

              {/* Media Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="space-y-2">
                  <Label>Media Scope *</Label>
                  <Select value={data.scope} onValueChange={(val) => { setData('scope', val); setData('media_outfit', ''); }}>
                    <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="National">National</SelectItem>
                      <SelectItem value="International">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Media Outfit *</Label>
                  <Select value={data.media_outfit} onValueChange={(val) => setData('media_outfit', val)} disabled={!data.scope}>
                    <SelectTrigger><SelectValue placeholder="Select outfit" /></SelectTrigger>
                    <SelectContent>
                      {currentMediaList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      <SelectItem value="Others">Others (Manual Input)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.media_outfit === 'Others' && (
                  <div className="space-y-2">
                    <Label>Specify Media Name *</Label>
                    <Input value={data.custom_media_outfit} onChange={e => setData('custom_media_outfit', e.target.value)} required />
                  </div>
                )}
              </div>

              {/* Unit & Sentiment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Unit Involved *</Label>
                  <Select value={data.unit_involved} onValueChange={(val) => setData('unit_involved', val)}>
                    <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                    <SelectContent>
                      {militaryUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Topic *</Label>
                  <Input value={data.topic} onChange={e => setData('topic', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Category (Sentiment) *</Label>
                  <Select value={data.category} onValueChange={(val) => setData('category', val)}>
                    <SelectTrigger><SelectValue placeholder="Select sentiment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Favorable">Favorable</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Unfavorable">Unfavorable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>News Link (URL)</Label>
                  <Input type="url" value={data.url} onChange={e => setData('url', e.target.value)} />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" disabled={processing} className="bg-[#7B1E1E] hover:bg-[#7B1E1E]/90 px-10">
                  {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Save News Entry
                </Button>
                <Button type="button" variant="outline" onClick={() => { reset(); setImagePreview(null); }}>Reset</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}