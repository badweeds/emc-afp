import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // THE FIX: Back to your standard system layout!
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { CheckCircle, Trash2, Edit, Eye } from 'lucide-react';
import NewsModal from '@/Components/NewsModal';
import { EditModal, NewsItem } from './NewsMonitoring'; 

export default function PendingNews({ pendingNews, auth }: any) {
    const [viewNews, setViewNews] = useState<NewsItem | null>(null);
    const [editNews, setEditNews] = useState<NewsItem | null>(null);

    const handleApprove = (id: number) => {
        if (confirm('Are you sure you want to approve this news article?')) {
            router.post(`/admin/news/${id}/approve`, {}, { preserveScroll: true });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to reject and delete this pending article?')) {
            router.delete(`/news/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pending News Approvals" />
            
            {/* MATCHED STYLING: Uses the exact same spacing and wrappers as NewsMonitoring */}
            <div className="space-y-5 max-w-6xl mx-auto p-6 lg:p-0">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1E293B]">Pending News Approvals</h1>
                        <p className="text-slate-500 mt-1 font-medium">Review, edit, or reject news articles submitted by personnel.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {pendingNews.length === 0 ? (
                        <Card className="shadow-md bg-white border border-slate-200">
                            <CardContent className="p-12 text-center text-slate-500 font-medium">
                                No pending news articles to approve. You're all caught up!
                            </CardContent>
                        </Card>
                    ) : (
                        pendingNews.map((news: NewsItem) => (
                            <Card key={news.id} className="shadow-sm bg-white border border-slate-200 hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
                                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold text-[#1E293B]">{news.title}</CardTitle>
                                        <p className="text-sm text-slate-500 mt-1 font-medium">
                                            {news.media_outlet} • {new Date(news.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => setViewNews(news)} className="text-slate-600 hover:text-slate-900 bg-white">
                                            <Eye className="w-4 h-4 mr-2" /> View
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setEditNews(news)} className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50 bg-white">
                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                        </Button>
                                        <Button variant="default" size="sm" onClick={() => handleApprove(news.id)} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(news.id)} className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
                                            <Trash2 className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">{news.summary}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${news.category === 'Favorable' ? 'bg-green-100 text-green-800' : news.category === 'Unfavorable' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {news.category}
                                        </span>
                                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium border border-slate-200">{news.topic}</span>
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium border border-blue-100">{news.unit_involved}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Reading View Modal */}
            <NewsModal 
                open={!!viewNews} 
                onClose={() => setViewNews(null)} 
                news={viewNews} 
            />

            {/* Edit Modal from NewsMonitoring */}
            {editNews && (
                <EditModal 
                    item={editNews} 
                    onClose={() => setEditNews(null)} 
                />
            )}

        </AuthenticatedLayout>
    );
}