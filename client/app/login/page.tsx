'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Card, CardBody } from '@heroui/card';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (error) {
            toast.error((error as any).response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/auth/google`;
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950 flex items-center justify-center p-4">
            {/* Background blobs */}
            <div className="absolute top-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-400/20 blur-[100px] animate-blob" />
            <div className="absolute bottom-[-15%] left-[-8%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-cyan-300/20 to-blue-400/15 blur-[100px] animate-blob" style={{ animationDelay: '3s' }} />

            <div className="relative z-10 w-full max-w-md animate-fadeInUp">
                <Card className="premium-card rounded-3xl overflow-hidden">
                    {/* Top gradient accent bar */}
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                    <CardBody className="p-10">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-extrabold mb-2 gradient-text">
                                Welcome Back
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">Sign in to your account</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <Input
                                type="email"
                                label="Email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                size="lg"
                                variant="bordered"
                                classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                            />
                            <Input
                                type="password"
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                size="lg"
                                variant="bordered"
                                classNames={{ inputWrapper: 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors' }}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_36px_rgba(99,102,241,0.45)] hover:scale-[1.02] transition-all duration-300"
                                size="lg"
                                isLoading={loading}
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-gray-900 text-gray-400 font-medium">OR</span>
                            </div>
                        </div>

                        <Button
                            variant="bordered"
                            className="w-full border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300 font-medium"
                            size="lg"
                            onPress={() => handleGoogleLogin()}
                            startContent={
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            }
                        >
                            Continue with Google
                        </Button>

                        <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
