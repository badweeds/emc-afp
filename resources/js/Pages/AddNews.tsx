import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';

const newsSources = [
  "Inquirer", 
  "Philippine Star", 
  "Manila Bulletin", 
  "GMA News", 
  "ABS-CBN News", 
  "Rappler", 
  "Local Radio", 
  "Social Media",
  "Others"
];

export default function AddNews() {
  // 1. CHANGED: sentiment -> category, published_at -> date
  const { data, setData, post, processing, reset } = useForm({
    title: '',
    summary: '',
    media_outfit: '',
    topic: '',
    unit_involved: '',
    category: '', 
    url: '',
    date: new Date().toISOString().split('T')[0] 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 2. CHANGED: updated validation to check for category instead of sentiment
    if (!data.title || !data.summary || !data.media_outfit || !data.topic || !data.category || !data.unit_involved) {
      toast.error('Please fill in all required fields');
      return;
    }

    post('/news', {
      onSuccess: () => {
        toast.success('News article saved to the database successfully!');
        reset(); 
      },
      onError: () => {
        toast.error('Failed to save. Please check your inputs.');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8">
      <Head title="Add News - EMC" />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#1E293B]">Add News</h1>
        <p className="text-gray-500 mt-1">Input monitored news into the consolidated database</p>
      </div>

      {/* Form Card */}
      <Card className="shadow-md max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="size-5" />
            News Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter news title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                placeholder="Enter news summary for the Commander's review"
                rows={4}
                value={data.summary}
                onChange={(e) => setData('summary', e.target.value)}
                required
              />
            </div>

            {/* Source and Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="media_outfit">Media Source *</Label>
                <Select 
                  value={data.media_outfit} 
                  onValueChange={(value) => setData('media_outfit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select news source" />
                  </SelectTrigger>
                  <SelectContent>
                    {newsSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Prevalent Issue / Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g. Encounter, Outreach, Surrender"
                  value={data.topic}
                  onChange={(e) => setData('topic', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Unit Involved and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_involved">Unit Involved *</Label>
                <Select 
                  value={data.unit_involved} 
                  onValueChange={(value) => setData('unit_involved', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMC">EMC</SelectItem>
                    <SelectItem value="10ID">10ID</SelectItem>
                    <SelectItem value="4ID">4ID</SelectItem>
                    <SelectItem value="TF Davao">TF Davao</SelectItem>
                    <SelectItem value="1001Bde">1001Bde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 3. CHANGED: Now says Category and uses Favorable/Neutral/Unfavorable */}
              <div className="space-y-2">
                <Label htmlFor="category">Category (Sentiment) *</Label>
                <Select 
                  value={data.category} 
                  onValueChange={(value) => setData('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Favorable">Favorable</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Unfavorable">Unfavorable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 4. CHANGED: id and value mapped to data.date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={data.date}
                  onChange={(e) => setData('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">News Link (URL)</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/news"
                  value={data.url}
                  onChange={(e) => setData('url', e.target.value)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={processing}
                className="bg-[#7B1E1E] hover:bg-[#7B1E1E]/90"
              >
                {processing ? 'Saving to Database...' : 'Save News Entry'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => reset()}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}