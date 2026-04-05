'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        const authenticateUser = async () => {
            if (token) {
                localStorage.setItem('token', token);
                try {
                    const response = await authAPI.getMe();
                    localStorage.setItem('user', JSON.stringify(response.data));
                    toast.success('Successfully logged in with Google!');
                    router.push('/dashboard');
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    toast.error('Failed to finish authentication');
                    router.push('/login');
                }
            } else {
                toast.error('Authentication failed');
                router.push('/login');
            }
        };

        authenticateUser();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
}
