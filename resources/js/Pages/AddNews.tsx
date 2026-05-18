import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Sparkles, Loader2, Save, X, Lock } from 'lucide-react';
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
  const { auth } = usePage<any>().props;
  const userRole = auth.user.role;
  const userUnit = auth.user.unit;
  
  const isUnitRestricted = userRole === 'admin' || userRole === 'user';

  const [rawContent, setRawContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, setData, post, processing, reset, transform, errors } = useForm({
    title: '',
    summary: '',
    scope: '', 
    media_outlet: '',
    custom_media_outlet: '', 
    reporter: '', 
    topic: '',
    custom_topic: '', 
    unit_involved: isUnitRestricted ? userUnit : '', 
    category: '', 
    url: '',
    date: new Date().toISOString().split('T')[0],
    image: null as File | null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryTitle = params.get('title');
    const queryUrl = params.get('url');
    const queryDate = params.get('date');
    const querySource = params.get('source');
    const querySummary = params.get('summary');
    const queryCategory = params.get('category');
    const queryReporter = params.get('reporter');
    const queryScope = params.get('scope');
    const queryUnit = params.get('unit_involved');
    const queryTopic = params.get('topic');

    if (queryTitle || queryUrl) {
      let derivedScope = queryScope || 'National';
      let derivedOutlet = 'Others';
      let derivedCustom = querySource || '';

      if (querySource) {
        if (mediaSources.Local.includes(querySource)) {
          derivedScope = 'Local'; derivedOutlet = querySource; derivedCustom = '';
        } else if (mediaSources.National.includes(querySource)) {
          derivedScope = 'National'; derivedOutlet = querySource; derivedCustom = '';
        } else if (mediaSources.International.includes(querySource)) {
          derivedScope = 'International'; derivedOutlet = querySource; derivedCustom = '';
        }
      }

      let finalUnit = queryUnit || '';
      if (finalUnit) {
        const matchedUnit = militaryUnits.find(
          u => u.toLowerCase() === finalUnit.toLowerCase() || 
               u.toLowerCase().includes(finalUnit.toLowerCase()) ||
               finalUnit.toLowerCase().includes(u.toLowerCase())
        );
        if (matchedUnit) finalUnit = matchedUnit;
      }

      let finalTopic = queryTopic || '';
      let finalCustomTopic = '';
      if (queryTopic) {
        const matchedTopic = topicsList.find(
          t => t.toLowerCase() === queryTopic.toLowerCase() ||
               t.toLowerCase().includes(queryTopic.toLowerCase()) ||
               queryTopic.toLowerCase().includes(t.toLowerCase())
        );
        if (matchedTopic) {
          finalTopic = matchedTopic;
        } else {
          finalTopic = 'Others';
          finalCustomTopic = queryTopic;
        }
      }

      setData(prev => ({
        ...prev,
        title: queryTitle || prev.title,
        url: queryUrl || prev.url,
        date: queryDate || prev.date,
        summary: querySummary || prev.summary,
        category: queryCategory || prev.category,
        reporter: queryReporter || prev.reporter,
        scope: derivedScope,
        media_outlet: derivedOutlet,
        custom_media_outlet: derivedCustom,
        unit_involved: isUnitRestricted ? userUnit : (finalUnit || prev.unit_involved),
        topic: finalTopic || prev.topic,
        custom_topic: finalCustomTopic || prev.custom_topic,
      }));
      
      toast.success("News report analyzed and pre-filled perfectly! Please review before saving.");
    }
  }, []);

  transform((formData) => ({
    ...formData,
    media_outlet: formData.media_outlet === 'Others' ? formData.custom_media_outlet : formData.media_outlet,
    topic: formData.topic === 'Others' ? formData.custom_topic : formData.topic,
    unit_involved: isUnitRestricted ? userUnit : formData.unit_involved,
  }));

  const handleAIAnalysis = async () => {
    if (!rawContent && !data.url) {
      toast.error("Please paste text parameters or provide an active web link URL!");
      return;
    }
    setIsAnalyzing(true);
    toast.info("Crawling news source page and analyzing context variables...");
    
    try {
      const response = await axios.post('/analyze-news', { content: rawContent, url: data.url });
      
      const aiScope = response.data.scope || data.scope;
      const aiMedia = response.data.media_outlet || '';
      const allKnownSources = [...mediaSources.Local, ...mediaSources.National, ...mediaSources.International];
      
      let finalMediaOutlet = aiMedia;
      let finalCustomOutlet = '';
      
      if (aiMedia && !allKnownSources.includes(aiMedia)) {
          finalMediaOutlet = 'Others';
          finalCustomOutlet = aiMedia;
      }

      let aiUnit = response.data.unit_involved || '';
      if (aiUnit) {
        const matchedUnit = militaryUnits.find(
          u => u.toLowerCase() === aiUnit.toLowerCase() || u.toLowerCase().includes(aiUnit.toLowerCase())
        );
        if (matchedUnit) aiUnit = matchedUnit;
      }

      let rawAiTopic = response.data.topic || '';
      let finalTopic = rawAiTopic;
      let finalCustomTopic = '';

      if (rawAiTopic) {
        const matchedTopic = topicsList.find(t => t.toLowerCase() === rawAiTopic.toLowerCase() || t.toLowerCase().includes(rawAiTopic.toLowerCase()));
        if (matchedTopic) {
          finalTopic = matchedTopic;
        } else {
          finalTopic = 'Others';
          finalCustomTopic = rawAiTopic;
        }
      }

      setData(prev => ({
        ...prev,
        title: response.data.title || prev.title,
        summary: response.data.summary || prev.summary,
        category: response.data.category || prev.category,
        reporter: response.data.reporter || prev.reporter,
        url: response.data.url || prev.url,
        scope: aiScope,
        media_outlet: finalMediaOutlet || prev.media_outlet,
        custom_media_outlet: finalCustomOutlet || prev.custom_media_outlet,
        unit_involved: isUnitRestricted ? userUnit : (aiUnit || prev.unit_involved),
        topic: finalTopic || prev.topic,
        custom_topic: finalCustomTopic || prev.custom_topic,
        date: response.data.date || prev.date,
      }));
      toast.success("AI Analysis Complete!");
    } catch (error: any) {
      toast.error(`Analysis Failed: ${error.response?.data?.error || error.message}`);
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
        toast.success('News report processed cleanly into the system.');
        reset();
        setRawContent('');
        setImagePreview(null);
      },
      onError: (err) => {
        toast.error(`Processing Error: ${Object.values(err).join(' | ')}`);
      }
    });
  };

  const currentMediaList = data.scope ? mediaSources[data.scope as keyof typeof mediaSources] : [];
  const dropdownItemClass = "text-slate-800 cursor-pointer focus:bg-[#7B1E1E] focus:text-white font-medium py-2";

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Add News Report</h2>}>
      <Head title="Add News - EMC" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* MANUAL BACKUP TEXT EXTRACTION BOX */}
        <Card className="border-t-4 border-t-[#1E293B] shadow-md bg-white">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-[#1E293B] flex items-center gap-2 text-md font-bold">
              <Sparkles className="size-5" /> Manual Text Analysis Overlay
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Pasted Document Field (Optional fallback if link analysis was already used)</Label>
              <Textarea 
                placeholder="Pasting custom raw reports here allows manual re-evaluation if needed..."
                className="min-h-[100px] bg-slate-50 border-slate-300 text-slate-800 focus:border-[#1E293B] focus:ring-[#1E293B]"
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
              />
            </div>
            <Button type="button" onClick={handleAIAnalysis} disabled={isAnalyzing} className="bg-[#1E293B] hover:bg-[#1E293B]/90 text-white font-bold">
              {isAnalyzing ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
              Re-Analyze Active Parameters
            </Button>
          </CardContent>
        </Card>

        {/* REGISTRY FORM */}
        <Card className="shadow-md border-t-4 border-t-[#7B1E1E] bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-[#7B1E1E] text-md font-bold">
              <PlusCircle className="size-5" /> News Document Registry Sheet
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                <Label className="mb-2 text-slate-700 font-bold">Operational Image / Article Screenshot (Optional)</Label>
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
                  <Label className="text-slate-700 font-bold">Headline / Document Title *</Label>
                  <Input value={data.title} onChange={e => setData('title', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Executive Operational Summary *</Label>
                  <Textarea rows={3} value={data.summary} onChange={e => setData('summary', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
                </div>
              </div>

              {/* Media Selection & Reporter */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Media Reach Profile *</Label>
                  <Select value={data.scope} onValueChange={(val) => { setData('scope', val); setData('media_outlet', ''); }}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select scope" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50">
                      <SelectItem value="Local" className={dropdownItemClass}>Local</SelectItem>
                      <SelectItem value="National" className={dropdownItemClass}>National</SelectItem>
                      <SelectItem value="International" className={dropdownItemClass}>International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Media Network Outlet *</Label>
                  <Select value={data.media_outlet} onValueChange={(val) => setData('media_outlet', val)} disabled={!data.scope}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select outlet" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50 max-h-[300px]">
                      {currentMediaList.map(s => <SelectItem key={s} value={s} className={dropdownItemClass}>{s}</SelectItem>)}
                      <SelectItem value="Others" className="text-[#7B1E1E] font-bold cursor-pointer focus:bg-[#7B1E1E] focus:text-white py-2 border-t mt-1">Others (Manual Input)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.media_outlet === 'Others' && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold">Specify Media Label *</Label>
                    <Input value={data.custom_media_outlet} onChange={e => setData('custom_media_outlet', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Press Correspondent / Reporter</Label>
                  <Input value={data.reporter} onChange={e => setData('reporter', e.target.value)} placeholder="e.g., Tom Rapliza" className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
              </div>

              {/* Unit, Topic, Sentiment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold flex items-center gap-1">
                    Command Unit Involved *
                    {isUnitRestricted && <Lock className="size-3 text-red-500" />}
                  </Label>
                  <Select value={data.unit_involved} onValueChange={(val) => setData('unit_involved', val)} disabled={isUnitRestricted}>
                    <SelectTrigger className={`border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E] ${isUnitRestricted ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-white'}`}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50 max-h-[300px]">
                      {militaryUnits.map(unit => <SelectItem key={unit} value={unit} className={dropdownItemClass}>{unit}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.unit_involved && <p className="text-red-500 text-xs mt-1">{errors.unit_involved}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Strategic Topic Group *</Label>
                  <Select value={data.topic} onValueChange={(val) => setData('topic', val)}>
                    <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-medium focus:ring-[#7B1E1E]"><SelectValue placeholder="Select topic" /></SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl z-50 max-h-[300px]">
                      {topicsList.map(topic => <SelectItem key={topic} value={topic} className={dropdownItemClass}>{topic}</SelectItem>)}
                      <SelectItem value="Others" className="text-[#7B1E1E] font-bold cursor-pointer focus:bg-[#7B1E1E] focus:text-white py-2 border-t mt-1">Others (Manual Input)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Category (Sentiment Weight) *</Label>
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

              {data.topic === 'Others' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 max-w-md">
                  <Label className="text-slate-700 font-bold">Specify Topic Metric *</Label>
                  <Input value={data.custom_topic} onChange={e => setData('custom_topic', e.target.value)} required placeholder="Enter manual description" className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
              )}

              {/* Date & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Incident Reporting Date *</Label>
                  <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">News Source Hyperlink (URL)</Label>
                  <Input type="text" value={data.url} onChange={e => setData('url', e.target.value)} className="border-slate-300 text-slate-900 bg-white focus:border-[#7B1E1E] focus:ring-[#7B1E1E]" />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <Button type="submit" disabled={processing} className="bg-[#7B1E1E] hover:bg-[#7B1E1E]/90 text-white font-bold px-10 shadow-md">
                  {processing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Document
                </Button>
                <Button type="button" variant="outline" onClick={() => { reset(); setImagePreview(null); }} className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold">
                  Reset Entry
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}