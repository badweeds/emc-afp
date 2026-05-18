import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { toast } from 'sonner';
import { Globe, Search, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function PublicStream() {
  const [searchQuery, setSearchQuery] = useState('Eastern Mindanao Command');
  const [selectedScope, setSelectedScope] = useState('Philippines'); // Scope filter parameter state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);

  const fetchLiveStream = async () => {
    setIsSearching(true);
    try {
      // Pass the selected scope toggle directly to the background API
      const response = await axios.get('/api/search-public-news', { 
        params: { 
          query: searchQuery,
          scope: selectedScope 
        } 
      });
      setSearchResults(response.data);
      if (response.data.length === 0) {
        toast.info("No matching updates located within this search scope in the past 2 months.");
      }
    } catch (err: any) {
      const actualError = err.response?.data?.error || err.message || "Unknown error";
      toast.error(`Failed to parse public media engine logs: ${actualError}`, { duration: 6000 });
    } finally {
      setIsSearching(false);
    }
  };

  // Re-fetch automatically whenever the user changes the location filter option
  useEffect(() => {
    fetchLiveStream();
  }, [selectedScope]);

  const handleLiveAIAnalysis = async (article: any) => {
    setAnalyzingUrl(article.url);
    toast.info("AI is evaluating article operational metrics... Please wait.");
    
    try {
      const response = await axios.post('/analyze-news', { 
        url: article.url,
        title: article.title,
        media_outlet: article.media_outlet,
        date: article.date
      });
      
      router.visit('/add-news', {
        method: 'get',
        data: {
          title: response.data.title || article.title,
          url: response.data.url || article.url,
          date: response.data.date || article.date,
          source: response.data.media_outlet || article.media_outlet,
          summary: response.data.summary || '',
          category: response.data.category || '',
          reporter: response.data.reporter || '',
          scope: response.data.scope || '',
          unit_involved: response.data.unit_involved || '',
          topic: response.data.topic || '',
        }
      });
    } catch (err: any) {
      const actualError = err.response?.data?.error || err.message || "Web scraper extraction failure.";
      toast.error(`AI Analysis Failed: ${actualError}`, { duration: 6000 });
    } finally {
      setAnalyzingUrl(null);
    }
  };

  const dropdownItemClass = "text-slate-800 cursor-pointer focus:bg-[#1A237E] focus:text-white font-medium py-2";

  return (
    <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Live Media Monitor Radar</h2>}>
      <Head title="Live Media Monitor - EMC" />

      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-t-4 border-t-sky-600 shadow-md bg-white">
          <CardHeader className="bg-sky-50/50 border-b border-sky-100">
            <CardTitle className="text-sky-950 flex items-center gap-2 text-md font-bold">
              <Globe className="size-5 text-sky-600" /> Open-Source Media (OSINT) Streaming Network
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Scope filter Selection Tool */}
              <div className="w-full sm:w-48 shrink-0">
                <Select value={selectedScope} onValueChange={(val) => setSelectedScope(val)}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900 font-bold focus:ring-sky-600 h-10">
                    <SelectValue placeholder="Select Coverage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl z-50">
                    <SelectItem value="Philippines" className={dropdownItemClass}>🇵🇭 Philippines</SelectItem>
                    <SelectItem value="International" className={dropdownItemClass}>🌐 International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 flex gap-2">
                <Input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search any Command metrics (e.g., 10ID, EastMinCom, NPA encounter)..."
                  className="bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-600 focus:ring-sky-600 font-medium h-10"
                  onKeyDown={e => e.key === 'Enter' && fetchLiveStream()}
                />
                <Button type="button" onClick={fetchLiveStream} disabled={isSearching || analyzingUrl !== null} className="bg-sky-600 hover:bg-sky-700 text-white font-bold shrink-0 h-10">
                  {isSearching ? <Loader2 className="size-4 animate-spin mr-2" /> : <Search className="size-4 mr-2" />}
                  Scan Network
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {isSearching ? (
                <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center justify-center gap-2">
                  <Loader2 className="size-8 animate-spin text-sky-600" />
                  Intercepting live public feeds...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((article, idx) => {
                  const isThisAnalyzing = analyzingUrl === article.url;
                  return (
                    <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors text-base leading-snug">{article.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Network Outlet: <span className="text-slate-700 font-bold">{article.media_outlet}</span> | Published: {article.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                        <a href={article.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-3 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 gap-1 w-1/2 md:w-auto">
                          <ExternalLink className="size-3.5" /> Source
                        </a>
                        <Button 
                          onClick={() => handleLiveAIAnalysis(article)} 
                          disabled={analyzingUrl !== null}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex gap-1 w-1/2 md:w-auto"
                        >
                          {isThisAnalyzing ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                          {isThisAnalyzing ? "Analyzing..." : "Analyze"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 font-medium border border-dashed rounded-lg">
                  No active streaming feeds found within this scope context. Modify parameters or try changing scope settings.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}