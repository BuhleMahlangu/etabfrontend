import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';

export const LoadingScreen = ({ message = 'Loading...' }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    'Preparing your learning space...',
    'Gathering study materials...',
    'Connecting to your classroom...',
    'Loading your assignments...',
    'Setting up your dashboard...',
    'Almost there...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center z-50">
      <div className="text-center max-w-md px-6">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
            <GraduationCap className="w-16 h-16 text-blue-600 mx-auto" />
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-green-400 p-2 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          E-Tab Learning
        </h2>

        {/* Progress Bar */}
        <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
        </div>

        {/* Message */}
        <p className="text-slate-600 dark:text-slate-400 text-sm animate-pulse">
          {tips[tipIndex]}
        </p>

        {/* Loading dots */}
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for cards
export const CardSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

// Skeleton for list items
export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 animate-pulse flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Shimmer effect for loading states
export const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
  </div>
);
