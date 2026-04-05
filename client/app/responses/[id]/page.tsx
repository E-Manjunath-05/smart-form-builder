'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { responsesAPI } from '@/lib/api';
import { saveAs } from 'file-saver';

export default function ResponsesPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params?.id;

    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [responses, setResponses] = useState([]);
    const [formTitle, setFormTitle] = useState('');

    useEffect(() => {
        if (formId) {
            loadResponses();
        }
    }, [formId]);

    const loadResponses = async () => {
        try {
            const response = await responsesAPI.getFormResponses(formId);
            setResponses(response.data.responses || []);
            setFormTitle(response.data.form?.title || 'Form Responses');
        } catch (error) {
            toast.error('Failed to load responses');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await responsesAPI.exportResponses(formId);
            const blob = new Blob([response.data], { type: 'text/csv' });
            saveAs(blob, `${formTitle.replace(/\s+/g, '_')}_responses.csv`);
            toast.success('Responses exported successfully!');
        } catch (error) {
            toast.error('Failed to export responses');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950">
                <Spinner size="lg" />
            </div>
        );
    }

    // Extract all unique question labels from responses (answers is an array)
    const questionLabels = responses.length > 0 && responses[0].answers?.length > 0
        ? responses[0].answers.map((answer: any) => answer.questionLabel)
        : [];

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-400/10 blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-cyan-300/15 to-blue-400/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />

            <div className="container mx-auto px-6 py-10 relative z-10">
                <div className="mb-10 flex justify-between items-center animate-fadeInUp">
                    <div>
                        <h1 className="text-4xl font-extrabold gradient-text mb-2">
                            {formTitle}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{responses.length} response(s)</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="bordered"
                            className="border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors font-medium"
                            onPress={() => router.push('/dashboard')}
                            startContent={<ArrowLeftIcon className="w-5 h-5" />}
                        >
                            Back
                        </Button>
                        {responses.length > 0 && (
                            <Button
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                onPress={handleExport}
                                isLoading={exporting}
                                startContent={!exporting && <ArrowDownTrayIcon className="w-5 h-5" />}
                            >
                                Export CSV
                            </Button>
                        )}
                    </div>
                </div>

                {responses.length === 0 ? (
                    <Card className="premium-card rounded-3xl animate-fadeInUp">
                        <CardBody className="text-center p-16">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">📊</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">No Responses Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Responses will appear here once people submit the form.</p>
                        </CardBody>
                    </Card>
                ) : (
                    <Card className="premium-card rounded-3xl animate-fadeInUp overflow-hidden">
                        {/* Accent bar */}
                        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                        <CardBody className="p-6">
                            <div className="overflow-x-auto">
                                <Table aria-label="Form responses table">
                                    <TableHeader>
                                        <TableColumn>Submitted At</TableColumn>
                                        {questionLabels.map((label, index) => (
                                            <TableColumn key={index}>{label}</TableColumn>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {responses.map((response: any, rIndex: number) => (
                                            <TableRow key={response._id || rIndex}>
                                                <TableCell>
                                                    {new Date(response.submittedAt).toLocaleString()}
                                                </TableCell>
                                                {response.answers?.map((answer: any, aIndex: number) => (
                                                    <TableCell key={aIndex}>
                                                        {Array.isArray(answer.answer)
                                                            ? answer.answer.join(', ')
                                                            : answer.answer || '-'}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
}
