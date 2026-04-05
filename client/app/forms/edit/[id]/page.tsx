'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import { Spinner } from '@heroui/spinner';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { PlusIcon, TrashIcon, ShareIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formsAPI } from '@/lib/api';
import { QRCodeCanvas } from 'qrcode.react';

const questionTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'radio', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'select', label: 'Dropdown' },
];

export default function EditFormPage() {
    const router = useRouter();
    const params = useParams();
    const formId = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        questions: [],
        isPublished: false,
        shareLink: '',
    });

    useEffect(() => {
        if (formId) {
            loadForm();
        }
    }, [formId]);

    const loadForm = async () => {
        try {
            const response = await formsAPI.getForm(formId);
            const form = response.data;
            if (form.deadline) {
                form.deadline = new Date(form.deadline).toISOString().slice(0, 16);
            } else {
                form.deadline = '';
            }
            setFormData(form);
        } catch (error) {
            toast.error('Failed to load form');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    questionId: `q_${Date.now()}`,
                    type: 'text',
                    label: '',
                    placeholder: '',
                    required: false,
                    options: [],
                    order: formData.questions.length,
                },
            ],
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setFormData({ ...formData, questions: newQuestions });
    };

    const addOption = (questionIndex) => {
        const newQuestions = [...formData.questions];
        if (!newQuestions[questionIndex].options) {
            newQuestions[questionIndex].options = [];
        }
        newQuestions[questionIndex].options.push({
            value: `option_${Date.now()}`,
            label: '',
        });
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateOption = (questionIndex, optionIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].options[optionIndex].label = value;
        newQuestions[questionIndex].options[optionIndex].value = value.toLowerCase().replace(/\s+/g, '_');
        setFormData({ ...formData, questions: newQuestions });
    };

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Please enter a form title');
            return;
        }

        if (formData.questions.length === 0) {
            toast.error('Please add at least one question');
            return;
        }

        setSaving(true);
        try {
            await formsAPI.updateForm(formId, formData);
            toast.success('Form saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save form');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!formData.title.trim() || formData.questions.length === 0) {
            toast.error('Please complete the form before publishing');
            return;
        }

        setPublishing(true);
        try {
            await handleSave();
            const response = await formsAPI.publishForm(formId);
            setFormData({ ...formData, isPublished: true, shareLink: response.data.shareLink });
            toast.success('Form published successfully!');
            setShowShareModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to publish form');
        } finally {
            setPublishing(false);
        }
    };

    const copyShareLink = () => {
        const url = `${window.location.origin}/forms/${formData.shareLink}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    const needsOptions = (type) => ['radio', 'checkbox', 'select'].includes(type);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950">
                <Spinner size="lg" />
            </div>
        );
    }

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formData.shareLink}`;

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950 py-12 px-4">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-400/10 blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-cyan-300/15 to-blue-400/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="mb-10 flex justify-between items-center animate-fadeInUp">
                    <div>
                        <h1 className="text-5xl font-extrabold gradient-text mb-2">
                            Edit Form
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            {formData.isPublished ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold border border-emerald-200 dark:border-emerald-800">● Published</span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold border border-amber-200 dark:border-amber-800">○ Draft</span>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {formData.isPublished && (
                            <>
                                <Button
                                    size="lg"
                                    variant="bordered"
                                    className="border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors font-medium"
                                    onPress={() => setShowShareModal(true)}
                                    startContent={<ShareIcon className="w-5 h-5" />}
                                >
                                    Share
                                </Button>
                                <Button
                                    size="lg"
                                    variant="bordered"
                                    className="border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-400 transition-colors font-medium"
                                    onPress={() => router.push(`/responses/${formId}`)}
                                    startContent={<EyeIcon className="w-5 h-5" />}
                                >
                                    Responses
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Form Builder */}
                <Card className="premium-card rounded-3xl mb-6 animate-fadeInUp stagger-1">
                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                    <CardBody className="p-8 space-y-5">
                        <Input
                            label="Form Title"
                            placeholder="Enter form title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            size="lg"
                            variant="bordered"
                            classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                        />
                        <Input
                            label="Description (Optional)"
                            placeholder="Enter form description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            size="lg"
                            variant="bordered"
                            classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                        />
                        <Input
                            type="datetime-local"
                            label="Deadline (Optional)"
                            placeholder="Select a deadline"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            size="lg"
                            variant="bordered"
                            classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                        />
                    </CardBody>
                </Card>

                {/* Questions */}
                <div className="space-y-4 mb-6">
                    {formData.questions.map((question, qIndex) => (
                        <Card key={question.questionId} className="premium-card rounded-2xl overflow-hidden animate-fadeInUp" style={{ animationDelay: `${qIndex * 0.05}s` }}>
                            <div className="h-0.5 bg-gradient-to-r from-indigo-400/50 to-purple-400/50" />
                            <CardBody className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                            {qIndex + 1}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Question {qIndex + 1}</h3>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        className="bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                        isIconOnly
                                        onPress={() => removeQuestion(qIndex)}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Select
                                        label="Question Type"
                                        selectedKeys={[question.type]}
                                        onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                        variant="bordered"
                                        classNames={{ trigger: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                                    >
                                        {questionTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={question.required}
                                            onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Required</label>
                                    </div>
                                </div>

                                <Input
                                    label="Question Label"
                                    placeholder="Enter question text"
                                    value={question.label}
                                    onChange={(e) => updateQuestion(qIndex, 'label', e.target.value)}
                                    required
                                    variant="bordered"
                                    classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                                />

                                <Input
                                    label="Placeholder (Optional)"
                                    placeholder="Enter placeholder text"
                                    value={question.placeholder}
                                    onChange={(e) => updateQuestion(qIndex, 'placeholder', e.target.value)}
                                    variant="bordered"
                                    classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                                />

                                {needsOptions(question.type) && (
                                    <div className="space-y-3 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50">
                                        <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Options</label>
                                        {question.options?.map((option, oIndex) => (
                                            <div key={`${question.questionId}-option-${oIndex}`} className="flex gap-2">
                                                <Input
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    value={option.label}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    className="flex-1"
                                                    variant="bordered"
                                                    classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    className="bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-colors"
                                                    isIconOnly
                                                    onPress={() => removeOption(qIndex, oIndex)}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            size="sm"
                                            variant="bordered"
                                            className="border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 transition-colors"
                                            onPress={() => addOption(qIndex)}
                                            startContent={<PlusIcon className="w-4 h-4" />}
                                        >
                                            Add Option
                                        </Button>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </div>

                <div className="flex gap-4 mb-6">
                    <Button
                        size="lg"
                        variant="bordered"
                        onPress={addQuestion}
                        startContent={<PlusIcon className="w-5 h-5" />}
                        className="flex-1 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 transition-colors font-medium"
                    >
                        Add Question
                    </Button>
                </div>

                <div className="flex gap-4 mt-10 animate-fadeInUp stagger-4">
                    <Button
                        size="lg"
                        variant="bordered"
                        className="border-2 border-gray-200 dark:border-gray-700 hover:border-red-400 transition-colors font-medium"
                        onPress={() => router.push('/dashboard')}
                    >
                        Back
                    </Button>
                    <Button
                        size="lg"
                        variant="bordered"
                        onPress={handleSave}
                        isLoading={saving}
                        className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors font-medium"
                    >
                        Save Draft
                    </Button>
                    {!formData.isPublished && (
                        <Button
                            size="lg"
                            className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-all duration-300"
                            onPress={handlePublish}
                            isLoading={publishing}
                        >
                            Publish Form
                        </Button>
                    )}
                </div>
            </div>

            {/* Share Modal */}
            <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} size="2xl" classNames={{ base: 'premium-card rounded-3xl' }}>
                <ModalContent>
                    <ModalHeader>
                        <h3 className="text-2xl font-bold gradient-text">Share Your Form</h3>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Share Link</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1"
                                        variant="bordered"
                                        classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700' }}
                                    />
                                    <Button
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg"
                                        onPress={copyShareLink}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">QR Code</label>
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <QRCodeCanvas value={shareUrl} size={200} />
                                </div>
                                <p className="text-sm text-gray-500 mt-3">Scan to access the form</p>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" className="font-medium" onPress={() => setShowShareModal(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
