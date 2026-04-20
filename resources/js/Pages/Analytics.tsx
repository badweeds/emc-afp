import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { 
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Head } from '@inertiajs/react';

interface NewsItem {
  id: number;
  title: string;
  category: string;
  media_outlet: string;
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
    sourceCounts[n.media_outlet] = (sourceCounts[n.media_outlet] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. THE FIX: Calculate News Over Time (Jan to Dec)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Pre-fill all 12 months with a count of 0 so the chart always shows the full year
  const monthlyData = monthNames.map(month => ({ month, count: 0 }));

  news.forEach(n => {
    if (n.date) {
      // Assuming date is in 'YYYY-MM-DD' format, split it to get the month
      const parts = n.date.split('-');
      if (parts.length >= 2) {
        // Parse the month number (01 to 12) and subtract 1 to get the array index (0 to 11)
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex <= 11) {
          monthlyData[monthIndex].count += 1;
        }
      }
    }
  });

  return (
    <AuthenticatedLayout>
      <Head title="Analytics - EMC" />
      
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-semibold text-[#1E293B]">Analytics</h1>
          <p className="text-gray-500 mt-1">Data-driven insights from the consolidated database</p>
        </div>

        {/* Line Chart: Trends over time (Now showing Jan-Dec) */}
        <Card className="shadow-md border-t-4 border-t-[#1E293B]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Monitoring Trends (Annual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* Updated XAxis to point to 'month' instead of 'date' */}
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="News Articles"
                    stroke="#7B1E1E" 
                    strokeWidth={3} 
                    dot={{ fill: '#7B1E1E', r: 4 }} 
                    activeDot={{ r: 6 }}
                />
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
                <BarChart data={sourceData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="source" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Articles" fill="#7B1E1E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}