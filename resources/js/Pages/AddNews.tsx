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
import { PlusCircle, Sparkles, Loader2, Save, X } from 'lucide-react';
import axios from 'axios';

const militaryUnits = [
  "Eastern Mindanao Command (EastMinCom) Headquarters",
  "Naval Forces Eastern Mindanao (NFEM)",
  "Tactical Operations Group 10 (TOG 10)",
  "4th Infantry Division (4ID)",
  "10th Infantry Division (10ID)"
];

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

export default function AddNews() {
  const [rawContent, setRawContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, setData, post, processing, reset, transform, errors } = useForm({
    title: '',
    summary: '',
    scope: '', 
    media_outfit: '',
    custom_media_outfit: '', 
    reporter: '', 
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
      toast.error("Please paste the article details first!");
      return;
    }
    setIsAnalyzing(true);
    toast.info("AI Intelligence is analyzing the inputs...");
    
    try {
      const response = await axios.post('/analyze-news', { content: rawContent });
      
      const aiScope = response.data.scope || data.scope;
      const aiMedia = response.data.media_outfit || '';
      const allKnownSources = [...mediaSources.Local, ...mediaSources.National, ...mediaSources.International];
      
      let finalMediaOutfit = aiMedia;
      let finalCustomOutfit = '';
      
      if (aiMedia && !allKnownSources.includes(aiMedia)) {
          finalMediaOutfit = 'Others';
          finalCustomOutfit = aiMedia;
      }

      setData(prev => ({
        ...prev,
        title: response.data.title || prev.title,
        summary: response.data.summary || prev.summary,
        category: response.data.category || prev.category,
        reporter: response.data.reporter || prev.reporter,
        url: response.data.url || prev.url,
        scope: aiScope,
        media_outfit: finalMediaOutfit || prev.media_outfit,
        custom_media_outfit: finalCustomOutfit || prev.custom_media_outfit,
        unit_involved: response.data.unit_involved || prev.unit_involved,
        topic: response.data.topic || prev.topic,
        date: response.data.date || prev.date,
      }));
      toast.success("AI Auto-Fill Complete! All relevant fields have been populated.");
    } catch (error: any) {
      // THE FIX: Grab the EXACT error message sent by the Laravel Backend!
      const actualError = error.response?.data?.error || error.message || "Unknown server error.";
      toast.error(`AI Analysis Failed: ${actualError}`, { duration: 8000 });
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
      forceFormData: true,
      onSuccess: () => {
        toast.success('News saved successfully!');
        reset();
        setRawContent('');
        setImagePreview(null);
      },
      // THE FIX: Show a clear error popup if validation fails silently!
      onError: (err) => {
        const errorMessages = Object.values(err).join(' | ');
        toast.error(`Failed to Save: ${errorMessages}`);
      }
    });
  };

  const currentMediaList = data.scope ? mediaSources[data.scope as keyof typeof mediaSources] : [];
  const dropdownItemClass = "text-slate-800 cursor-pointer focus:bg-[#7B1E1E] focus:text-white font-medium py-2";

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Add Intelligence Report</h2>}>
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
              <Label className="text-slate-700 font-bold">Paste Full Details Here (URL, Reporter, Article Text)</Label>
              <Textarea 
                placeholder="Paste news text here... AI will extract the summary, category, URL, reporter, scope, media outfit, unit, date, and topic automatically!"
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
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              </div>

              {/* Title & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Headline / Title *</Label>
                  <Input value={data.title} onChange={e => setData('title', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Executive Summary *</Label>
                  <Textarea rows={3} value={data.summary} onChange={e => setData('summary', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
                </div>
              </div>

              {/* Media Selection & Reporter */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
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
                  {errors.scope && <p className="text-red-500 text-xs mt-1">{errors.scope}</p>}
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
                  {errors.media_outfit && <p className="text-red-500 text-xs mt-1">{errors.media_outfit}</p>}
                </div>

                {data.media_outfit === 'Others' && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Specify Media *</Label>
                    <Input value={data.custom_media_outfit} onChange={e => setData('custom_media_outfit', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Reporter Name</Label>
                  <Input value={data.reporter} onChange={e => setData('reporter', e.target.value)} placeholder="e.g. Tom Rapliza" className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
              </div>

              {/* Unit, Topic, Sentiment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Unit Involved *</Label>
                  <Select value={data.unit_involved} onValueChange={(val) => setData('unit_involved', val)}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select unit" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50 max-h-[300px]">
                      {militaryUnits.map(unit => <SelectItem key={unit} value={unit} className={dropdownItemClass}>{unit}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.unit_involved && <p className="text-red-500 text-xs mt-1">{errors.unit_involved}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Topic *</Label>
                  <Select value={data.topic} onValueChange={(val) => setData('topic', val)}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select topic" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50 max-h-[300px]">
                      {topicsList.map(topic => <SelectItem key={topic} value={topic} className={dropdownItemClass}>{topic}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
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
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
              </div>

              {/* Date & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Date *</Label>
                  <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">News Link (URL)</Label>
                  <Input type="text" value={data.url} onChange={e => setData('url', e.target.value)} placeholder="e.g. facebook.com/news" className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
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