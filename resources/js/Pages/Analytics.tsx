import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Head } from '@inertiajs/react';

// Define the structure of our database news
interface NewsItem {
  id: number;
  title: string;
  category: string;
  media_outfit: string;
  date: string;
}

export default function Analytics({ news = [] }: { news: NewsItem[] }) {
  
  // 1. Calculate Sentiment (Risk) Distribution
  const riskData = [
    { name: 'Favorable', value: news.filter(n => n.category === 'Favorable').length, fill: '#16A34A' },
    { name: 'Neutral', value: news.filter(n => n.category === 'Neutral').length, fill: '#64748B' },
    { name: 'Unfavorable', value: news.filter(n => n.category === 'Unfavorable').length, fill: '#DC2626' },
  ];

  // 2. Calculate News per Source (Top 5)
  const sourceCounts: Record<string, number> = {};
  news.forEach(n => {
    sourceCounts[n.media_outfit] = (sourceCounts[n.media_outfit] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Calculate News Over Time (Group by Date)
  const dateCounts: Record<string, number> = {};
  news.forEach(n => {
    dateCounts[n.date] = (dateCounts[n.date] || 0) + 1;
  });
  const timelineData = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 lg:p-8">
      <Head title="Analytics - EMC" />
      <div>
        <h1 className="text-3xl font-semibold text-[#1E293B]">Analytics</h1>
        <p className="text-gray-500 mt-1">Data-driven insights from the consolidated database</p>
      </div>

      {/* Line Chart: Trends over time */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Monitoring Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#7B1E1E" strokeWidth={3} dot={{ fill: '#7B1E1E' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Sentiment */}
        <Card className="shadow-md">
          <CardHeader><CardTitle>Sentiment Split</CardTitle></CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {riskData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Sources */}
        <Card className="shadow-md">
          <CardHeader><CardTitle>Top Media Sources</CardTitle></CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="source" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#7B1E1E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}