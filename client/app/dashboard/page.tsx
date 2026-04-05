'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, DocumentTextIcon, TrashIcon, EyeIcon, ShareIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@heroui/button';
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

export default function DashboardPage() {
    const router = useRouter();
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (userData) {
            setUser(JSON.parse(userData));
        }

        loadForms();
    }, [router]);

    const loadForms = async () => {
        try {
            const response = await formsAPI.getForms();
            setForms(response.data);
        } catch (error) {
            toast.error('Failed to load forms');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteForm = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form?')) return;

        try {
            await formsAPI.deleteForm(id);
            toast.success('Form deleted successfully');
            loadForms();
        } catch (error) {
            toast.error('Failed to delete form');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-400/10 blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-cyan-300/15 to-blue-400/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />

            {/* Header */}
            <div className="glass sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold gradient-text">
                        Smart Form Builder
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium hidden sm:inline">{user?.name}</span>
                        </div>
                        <Button size="sm" variant="flat" className="text-gray-500 hover:text-red-500 transition-colors" onPress={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-10 relative z-10">
                <div className="flex justify-between items-center mb-10 animate-fadeInUp">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white">My Forms</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">Create and manage your forms</p>
                    </div>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)] hover:scale-105 transition-all duration-300"
                        startContent={<PlusIcon className="w-5 h-5" />}
                        onPress={() => router.push('/forms/create')}
                    >
                        Create New Form
                    </Button>
                </div>

                {/* Forms Grid */}
                {forms.length === 0 ? (
                    <Card className="premium-card rounded-3xl p-12 text-center animate-fadeInUp">
                        <CardBody>
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                                <DocumentTextIcon className="w-10 h-10 text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">No forms yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Create your first form to get started</p>
                            <Button
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                onPress={() => router.push('/forms/create')}
                            >
                                Create Form
                            </Button>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form, index) => (
                            <Card key={form._id} className="premium-card rounded-2xl overflow-hidden animate-fadeInUp" style={{ animationDelay: `${index * 0.08}s` }}>
                                {/* Color accent top */}
                                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                                <CardHeader className="flex-col items-start px-6 pt-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{form.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {form.description || 'No description'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        Created {formatDate(form.createdAt)}
                                    </p>
                                </CardHeader>
                                <CardBody className="px-6 pb-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${form.isPublished
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                            }`}>
                                            {form.isPublished ? '● Published' : '○ Draft'}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {form.questions?.length || 0} questions
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                            onPress={() => router.push(`/forms/edit/${form._id}`)}
                                        >
                                            Edit
                                        </Button>
                                        {form.isPublished && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                                    startContent={<EyeIcon className="w-4 h-4" />}
                                                    onPress={() => router.push(`/responses/${form._id}`)}
                                                >
                                                    Responses
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    isIconOnly
                                                    onPress={() => {
                                                        const url = `${window.location.origin}/forms/${form.shareLink}`;
                                                        navigator.clipboard.writeText(url);
                                                        toast.success('Link copied!');
                                                    }}
                                                >
                                                    <ShareIcon className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                            isIconOnly
                                            onPress={() => handleDeleteForm(form._id)}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
