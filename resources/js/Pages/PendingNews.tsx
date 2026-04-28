import React, { useState } from 'react';
import DashboardLayout from '@/Components/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { CheckCircle, Trash2, Edit } from 'lucide-react';
import NewsModal from '@/Components/NewsModal';

export default function PendingNews({ pendingNews, auth }: any) {
    const [selectedNews, setSelectedNews] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleApprove = (id: number) => {
        if (confirm('Are you sure you want to approve this news article?')) {
            router.post(`/admin/news/${id}/approve`, {}, { preserveScroll: true });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this pending article?')) {
            router.delete(`/news/${id}`, { preserveScroll: true });
        }
    };

    const handleEdit = (news: any) => {
        setSelectedNews(news);
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Pending News Approvals" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Pending News Approvals</h1>
                </div>

                <div className="grid gap-4">
                    {pendingNews.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center text-gray-500">
                                No pending news articles to approve.
                            </CardContent>
                        </Card>
                    ) : (
                        pendingNews.map((news: any) => (
                            <Card key={news.id}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-lg font-bold">{news.title}</CardTitle>
                                        <p className="text-sm text-gray-500">
                                            {news.media_outlet} • {new Date(news.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(news)}>
                                            <Edit className="w-4 h-4 mr-2" /> View/Edit
                                        </Button>
                                        <Button variant="default" size="sm" onClick={() => handleApprove(news.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(news.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-700 line-clamp-3">{news.summary}</p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{news.category}</span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{news.topic}</span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{news.unit_involved}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* FIX 1: Changed 'isOpen' to 'open' and 'newsToEdit' to 'news' to match the Modal! */}
            <NewsModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                news={selectedNews} 
            />
        </DashboardLayout>
    );
}