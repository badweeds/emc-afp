import { Newspaper, Radio, Shield, AlertTriangle, Eye, Pencil } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { RiskBadge } from '../components/RiskBadge';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { NewsModal } from '../components/NewsModal';

// 1. Accept the real data from Laravel as props
export default function Dashboard({ stats, recentNews }: any) {
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  // 2. Format the real stats for your Pie Chart
  const riskData = [
    { name: 'Favorable', value: stats.favorable, fill: '#16A34A' },
    { name: 'Neutral', value: stats.neutral, fill: '#64748B' },
    { name: 'Unfavorable', value: stats.unfavorable, fill: '#DC2626' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#1E293B]">Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time overview of monitored news database</p>
      </div>

      {/* Statistics Cards - Using real stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total News"
          value={stats.total}
          icon={Newspaper}
          color="#7B1E1E"
        />
        <StatCard 
          title="Favorable"
          value={stats.favorable}
          icon={Shield}
          color="#16A34A"
        />
        <StatCard 
          title="Neutral"
          value={stats.neutral}
          icon={Radio}
          color="#64748B"
        />
        <StatCard 
          title="Unfavorable"
          value={stats.unfavorable}
          icon={AlertTriangle}
          color="#DC2626"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Distribution - Pie Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Informational Card for the Commander */}
        <Card className="shadow-md border-l-4 border-l-[#7B1E1E]">
          <CardHeader>
            <CardTitle className="text-[#7B1E1E]">Commander's Briefing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              The database currently contains <span className="font-bold">{stats.total}</span> total monitored items. 
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Priority Focus</p>
              <p className="text-lg font-medium text-red-700">
                {stats.unfavorable} Unfavorable reports require immediate review.
              </p>
            </div>
            <Button className="w-full bg-[#1E293B]" onClick={() => window.location.href='/monitoring'}>
              View Full Monitoring Table
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent News Table - Using real recentNews */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent News Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentNews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                    No news data available in the database yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentNews.map((news: any) => (
                  <TableRow key={news.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium max-w-md truncate">{news.title}</TableCell>
                    <TableCell>{news.media_outfit}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        news.category === 'Favorable' ? 'bg-green-100 text-green-700' :
                        news.category === 'Unfavorable' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {news.category}
                      </span>
                    </TableCell>
                    <TableCell>{news.date}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedNews(news)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* News Detail Modal */}
      {selectedNews && (
        <NewsModal 
          news={selectedNews} 
          open={!!selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </div>
  );
}