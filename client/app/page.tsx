'use client';

import { Button } from '@heroui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950">
      {/* Animated background blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-300/40 to-purple-400/30 blur-[100px] animate-blob" />
      <div className="absolute bottom-[-15%] left-[-8%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-400/20 blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-pink-300/20 to-violet-400/15 blur-[80px] animate-blob" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-5xl mx-auto text-center">

          {/* Hero Section */}
          <div className="mb-16 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/30">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              AI-Powered Form Builder
            </div>
            <h1 className="text-7xl md:text-8xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent animate-gradient">
                Smart Form
              </span>
              <br />
              <span className="text-gray-800 dark:text-white">Builder</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Create beautiful forms with AI assistance, collect responses, and export data — all in seconds.
            </p>
            <div className="flex gap-4 justify-center animate-fadeInUp stagger-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-semibold px-10 py-6 text-lg shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.45)] hover:scale-105 transition-all duration-300"
                onPress={() => router.push('/register')}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-2 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-300 font-semibold px-10 py-6 text-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-300"
                onPress={() => router.push('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="group p-8 premium-card rounded-3xl animate-fadeInUp stagger-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">AI-Powered</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Generate complete forms from simple text descriptions. AI handles the structure, types, and validation.
              </p>
            </div>
            <div className="group p-8 premium-card rounded-3xl animate-fadeInUp stagger-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">QR Code Sharing</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Share forms instantly with auto-generated QR codes. Perfect for events, classrooms, and surveys.
              </p>
            </div>
            <div className="group p-8 premium-card rounded-3xl animate-fadeInUp stagger-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Export Data</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Export responses to CSV with one click. Analyze data your way, no lock-in.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
