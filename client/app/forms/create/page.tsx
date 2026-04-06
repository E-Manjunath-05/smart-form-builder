'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input, Textarea } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import { Spinner } from '@heroui/spinner';
import { PlusIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formsAPI, aiAPI } from '@/lib/api';

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

export default function CreateFormPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiDescription, setAiDescription] = useState('');
    const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        questions: [],
    });

    const toggleQuestion = (id: string) => {
        if (expandedQuestions.includes(id)) {
            setExpandedQuestions(expandedQuestions.filter((qId) => qId !== id));
        } else {
            setExpandedQuestions([...expandedQuestions, id]);
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

    const handleAIGenerate = async () => {
        if (!aiDescription.trim()) {
            toast.error('Please enter a description for AI generation');
            return;
        }

        setAiLoading(true);
        try {
            const response = await aiAPI.generateForm(aiDescription);
            const generatedForm = response.data;

            // Ensure all questions have unique questionId
            const questionsWithIds = (generatedForm.questions || []).map((q: any, index: number) => ({
                ...q,
                questionId: q.questionId || `q_${Date.now()}_${index}`,
                options: q.options || [],
                order: index,
            }));

            setFormData({
                title: generatedForm.title || formData.title,
                description: generatedForm.description || formData.description,
                deadline: formData.deadline,
                questions: questionsWithIds,
            });

            toast.success('Form generated successfully!');
            setAiDescription('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate form');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error('Please enter a form title');
            return;
        }

        if (formData.questions.length === 0) {
            toast.error('Please add at least one question');
            return;
        }

        setLoading(true);
        try {
            const response = await formsAPI.createForm(formData);
            toast.success('Form created successfully!');
            router.push(`/forms/edit/${response.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create form');
        } finally {
            setLoading(false);
        }
    };

    const needsOptions = (type) => ['radio', 'checkbox', 'select'].includes(type);

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950 py-12 px-4">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-400/10 blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-cyan-300/15 to-blue-400/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="mb-10 animate-fadeInUp">
                    <h1 className="text-5xl font-extrabold gradient-text mb-2">
                        Create New Form
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Build your form manually or use AI to generate it</p>
                </div>

                {/* AI Generation Section */}
                <Card className="premium-card rounded-3xl mb-8 relative overflow-hidden animate-fadeInUp animate-pulse-glow">
                    <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 animate-shimmer" style={{ backgroundSize: '200% auto' }} />
                    <CardHeader className="flex flex-col items-start px-8 pt-7">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">AI Form Generator</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Describe your form and let AI create it for you</p>
                    </CardHeader>
                    <CardBody className="px-8 pb-7">
                        <div className="flex gap-4">
                            <Input
                                placeholder="E.g., Create a customer feedback form with name, email, rating, and comments"
                                value={aiDescription}
                                onChange={(e) => setAiDescription(e.target.value)}
                                className="flex-1"
                                size="lg"
                                variant="bordered"
                                classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                            />
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                                onPress={handleAIGenerate}
                                isLoading={aiLoading}
                                startContent={!aiLoading && <SparklesIcon className="w-5 h-5" />}
                            >
                                Generate
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Form Builder */}
                <form onSubmit={handleSubmit}>
                    <Card className="premium-card rounded-3xl mb-6 animate-fadeInUp stagger-2">
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

                    <div className="flex gap-4 animate-fadeInUp stagger-3">
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
                            onPress={() => router.push('/dashboard')}
                            className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:border-red-400 transition-colors font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-all duration-300"
                            isLoading={loading}
                        >
                            Create Form
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
