'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        questions: [],
    });

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

                                    {/* Options for radio, checkbox, select */}
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
