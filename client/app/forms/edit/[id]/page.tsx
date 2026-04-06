'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
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
    const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        questions: [],
        isPublished: false,
        shareLink: '',
    });

    const toggleQuestion = (id: string) => {
        if (expandedQuestions.includes(id)) {
            setExpandedQuestions(expandedQuestions.filter((qId) => qId !== id));
        } else {
            setExpandedQuestions([...expandedQuestions, id]);
        }
    };

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
        const newId = `q_${Date.now()}`;
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    questionId: newId,
                    type: 'text',
                    label: '',
                    placeholder: '',
                    required: false,
                    options: [],
                    order: formData.questions.length,
                },
            ],
        });
        setExpandedQuestions([...expandedQuestions, newId]);
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
                            placeholder="Enter your form title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            size="lg"
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{ inputWrapper: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors mt-2 h-14' }}
                        />
                        <Textarea
                            label="Description (Optional)"
                            placeholder="What is this form about?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            minRows={3}
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{ inputWrapper: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors mt-2' }}
                        />
                        <Input
                            type="datetime-local"
                            label="Deadline (Optional)"
                            placeholder="Select deadline"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            size="lg"
                            variant="bordered"
                            labelPlacement="outside"
                            classNames={{ inputWrapper: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors mt-2 h-14' }}
                        />
                    </CardBody>
                </Card>

                {/* Questions */}
                <div className="space-y-4 mb-6">
                    {formData.questions.map((question, qIndex) => {
                        const isExpanded = expandedQuestions.includes(question.questionId);
                        return (
                            <div key={question.questionId} className="animate-fadeInUp" style={{ animationDelay: `${qIndex * 0.05}s` }}>
                                {/* Collapsible Header */}
                                <div 
                                    className="flex items-center justify-between p-4 mb-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors border-gray-200 dark:border-gray-700/50 rounded-2xl cursor-pointer shadow-sm group"
                                    onClick={() => toggleQuestion(question.questionId)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60'}`}>
                                            {qIndex + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {question.label || 'New Question'}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{question.type} • {question.required ? 'Required' : 'Optional'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            color="danger"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40"
                                            isIconOnly
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                removeQuestion(qIndex);
                                            }}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                        <div className="text-gray-400 dark:text-gray-500 px-2 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Container */}
                                {isExpanded && (
                                    <Card className="premium-card rounded-2xl mb-6 ml-4 border-l-4 border-l-indigo-500 border border-gray-100 dark:border-gray-800/60 shadow-lg overflow-visible animate-fadeIn">
                                        <CardBody className="p-6 space-y-6">
                                            <div className="grid md:grid-cols-2 gap-5 place-items-start">
                                                <Select
                                                    label="Question Type"
                                                    selectedKeys={[question.type]}
                                                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                                    variant="bordered"
                                                    classNames={{ trigger: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors w-full' }}
                                                >
                                                    {questionTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>

                                                <div className="flex items-center gap-3 pt-2 pl-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`required-${question.questionId}`}
                                                        checked={question.required}
                                                        onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
                                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                    <label htmlFor={`required-${question.questionId}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none border border-transparent hover:border-gray-200 dark:hover:border-gray-700 p-1.5 rounded-lg transition-colors">
                                                        Required Field
                                                    </label>
                                                </div>
                                            </div>

                                            <Input
                                                label="Question Label"
                                                value={question.label}
                                                onChange={(e) => updateQuestion(qIndex, 'label', e.target.value)}
                                                required
                                                variant="bordered"
                                                size="lg"
                                                classNames={{ inputWrapper: 'border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-400 transition-colors focus-within:!border-indigo-500 bg-indigo-50/10 dark:bg-indigo-900/10' }}
                                            />

                                            <Input
                                                label="Placeholder (Optional)"
                                                value={question.placeholder}
                                                onChange={(e) => updateQuestion(qIndex, 'placeholder', e.target.value)}
                                                variant="bordered"
                                                classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                                            />

                                            {/* Options for radio, checkbox, select */}
                                            {needsOptions(question.type) && (
                                                <div className="p-5 rounded-xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 shadow-inner">
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        Options
                                                    </label>
                                                    <div className="space-y-3">
                                                        {question.options?.map((option, oIndex) => (
                                                            <div key={`${question.questionId}-option-${oIndex}`} className="flex gap-2 items-center animate-fadeIn group/option">
                                                                <div className="text-gray-400 w-4 text-center text-xs font-bold">{oIndex + 1}.</div>
                                                                <Input
                                                                    placeholder={`Enter option ${oIndex + 1}`}
                                                                    value={option.label}
                                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                    className="flex-1"
                                                                    variant="faded"
                                                                    classNames={{ inputWrapper: 'border-transparent hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors bg-white dark:bg-gray-900/50 shadow-sm' }}
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    isIconOnly
                                                                    variant="ghost"
                                                                    color="danger"
                                                                    className="opacity-20 group-hover/option:opacity-100 transition-opacity"
                                                                    onPress={() => removeOption(qIndex, oIndex)}
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        className="w-full mt-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-100 dark:border-indigo-800 border-dashed hover:border-indigo-400 hover:bg-indigo-100 transition-all cursor-pointer"
                                                        onPress={() => addOption(qIndex)}
                                                        startContent={<PlusIcon className="w-4 h-4" />}
                                                    >
                                                        Add New Option
                                                    </Button>
                                                </div>
                                            )}
                                        </CardBody>
                                    </Card>
                                )}
                            </div>
                        );
                    })}
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
