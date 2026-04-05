'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Radio, RadioGroup } from '@heroui/radio';
import { Checkbox, CheckboxGroup } from '@heroui/checkbox';
import toast from 'react-hot-toast';
import { formsAPI, responsesAPI } from '@/lib/api';

export default function FormSharePage() {
    const params = useParams();
    const shareLink = params?.shareLink;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        if (shareLink) {
            loadForm();
        }
    }, [shareLink]);

    const loadForm = async () => {
        try {
            const response = await formsAPI.getFormByShareLink(shareLink);
            setFormData(response.data);

            // Initialize answers object
            const initialAnswers = {};
            response.data.questions.forEach((q) => {
                initialAnswers[q.questionId] = q.type === 'checkbox' ? [] : '';
            });
            setAnswers(initialAnswers);
        } catch (error) {
            toast.error('Form not found or has been deleted');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleCheckboxChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const missingRequired = formData.questions.filter(
            (q) => q.required && (!answers[q.questionId] || (Array.isArray(answers[q.questionId]) && answers[q.questionId].length === 0))
        );

        if (missingRequired.length > 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Transform answers object to array format expected by backend
        const answersArray = formData.questions.map((question) => ({
            questionId: question.questionId,
            questionLabel: question.label,
            answer: answers[question.questionId] || (question.type === 'checkbox' ? [] : ''),
        }));

        setSubmitting(true);
        try {
            await responsesAPI.submitResponse(formData._id, answersArray);
            toast.success('Response submitted successfully!');
            setSubmitted(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit response');
        } finally {
            setSubmitting(false);
        }
    };

    const renderQuestion = (question) => {
        switch (question.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
            case 'date':
                return (
                    <Input
                        type={question.type}
                        placeholder={question.placeholder}
                        value={answers[question.questionId] || ''}
                        onChange={(e) => handleInputChange(question.questionId, e.target.value)}
                        required={question.required}
                        size="lg"
                        variant="bordered"
                        classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        placeholder={question.placeholder}
                        value={answers[question.questionId] || ''}
                        onChange={(e) => handleInputChange(question.questionId, e.target.value)}
                        required={question.required}
                        className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl min-h-[130px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 hover:border-indigo-400 text-gray-800 dark:text-gray-200"
                    />
                );

            case 'radio':
                return (
                    <RadioGroup
                        value={answers[question.questionId] || ''}
                        onValueChange={(value) => handleInputChange(question.questionId, value)}
                        isRequired={question.required}
                    >
                        {question.options?.map((option) => (
                            <Radio key={option.value} value={option.value}>
                                {option.label}
                            </Radio>
                        ))}
                    </RadioGroup>
                );

            case 'checkbox':
                return (
                    <CheckboxGroup
                        value={answers[question.questionId] || []}
                        onValueChange={(value) => handleCheckboxChange(question.questionId, value)}
                        isRequired={question.required}
                    >
                        {question.options?.map((option) => (
                            <Checkbox key={option.value} value={option.value}>
                                {option.label}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                );

            case 'select':
                return (
                    <select
                        value={answers[question.questionId] || ''}
                        onChange={(e) => handleInputChange(question.questionId, e.target.value)}
                        required={question.required}
                        className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-200 hover:border-indigo-400 text-gray-800 dark:text-gray-200"
                    >
                        <option value="">Select an option</option>
                        {question.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            default:
                return null;
        }
    };

    const bgClass = "min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950";

    if (loading) {
        return (
            <div className={`${bgClass} flex items-center justify-center`}>
                <Spinner size="lg" />
            </div>
        );
    }

    if (!formData) {
        return (
            <div className={`${bgClass} flex items-center justify-center p-4`}>
                <Card className="max-w-md premium-card rounded-3xl animate-fadeInUp">
                    <CardBody className="text-center p-10">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Form Not Found</h2>
                        <p className="text-gray-500 dark:text-gray-400">This form may have been deleted or the link is invalid.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (formData.deadline && new Date() > new Date(formData.deadline)) {
        return (
            <div className={`${bgClass} flex items-center justify-center p-4`}>
                <Card className="max-w-md premium-card rounded-3xl animate-fadeInUp">
                    <CardBody className="text-center p-10">
                        <div className="text-6xl mb-4">⏰</div>
                        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-3">Form Closed</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">The deadline to fill out this form has passed.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className={`${bgClass} flex items-center justify-center p-4`}>
                <Card className="max-w-md premium-card rounded-3xl animate-fadeInUp">
                    <CardBody className="text-center p-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <span className="text-4xl text-white">✓</span>
                        </div>
                        <h2 className="text-3xl font-extrabold gradient-text mb-3">
                            Thank You!
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Your response has been submitted successfully.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className={`${bgClass} py-12 px-4`}>
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-400/10 blur-[100px] animate-blob" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-cyan-300/15 to-blue-400/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />

            <div className="container mx-auto max-w-3xl relative z-10">
                {/* Form Header */}
                <Card className="premium-card rounded-3xl mb-8 relative overflow-hidden animate-fadeInUp">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                    <CardHeader className="flex flex-col items-start px-8 pt-8 pb-6">
                        <h1 className="text-4xl font-extrabold gradient-text mb-3">
                            {formData.title}
                        </h1>
                        {formData.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">{formData.description}</p>
                        )}
                        {formData.deadline && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-semibold border border-amber-200 dark:border-amber-800">
                                ⏰ Deadline: {new Date(formData.deadline).toLocaleString()}
                            </div>
                        )}
                    </CardHeader>
                </Card>

                {/* Questions */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {formData.questions
                        .sort((a, b) => a.order - b.order)
                        .map((question, index) => (
                            <Card key={question.questionId} className="premium-card rounded-2xl overflow-hidden animate-fadeInUp" style={{ animationDelay: `${index * 0.06}s` }}>
                                <div className="h-0.5 bg-gradient-to-r from-indigo-400/30 to-purple-400/30" />
                                <CardBody className="p-6">
                                    <label className="block mb-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                {index + 1}
                                            </div>
                                            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                                {question.label}
                                                {question.required && <span className="text-red-400 ml-1">*</span>}
                                            </span>
                                        </div>
                                    </label>
                                    {renderQuestion(question)}
                                </CardBody>
                            </Card>
                        ))}

                    <div className="flex justify-center pt-6 pb-10 animate-fadeInUp stagger-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold px-16 py-7 text-lg shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.45)] hover:scale-105 transition-all duration-300"
                            isLoading={submitting}
                        >
                            Submit Response
                        </Button>
                    </div>
                </form>

                <div className="text-center mt-4 text-gray-400 dark:text-gray-600 text-sm font-medium">
                    <p>Powered by Smart Form Builder</p>
                </div>
            </div>
        </div>
    );
}
