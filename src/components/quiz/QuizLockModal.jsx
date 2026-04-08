import React, { useEffect, useState } from 'react';
import { useQuizLock } from '../../context/QuizLockContext';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

// Small floating timer widget shown during quiz
export function QuizTimerWidget() {
  const { isQuizLocked, quizData, timeRemaining, updateTimeRemaining } = useQuizLock();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 60 && timeRemaining > 0) {
      const interval = setInterval(() => setBlink(prev => !prev), 500);
      return () => clearInterval(interval);
    }
  }, [timeRemaining]);

  if (!isQuizLocked) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 60;

  return (
    <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg border shadow-lg ${
      isLowTime 
        ? blink 
          ? 'bg-red-500 text-white border-red-600 animate-pulse' 
          : 'bg-red-100 text-red-700 border-red-300'
        : 'bg-white text-slate-700 border-slate-200'
    }`}>
      <Clock className="w-4 h-4" />
      <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
      {isLowTime && <span className="text-xs font-medium ml-1">Time running out!</span>}
    </div>
  );
}

// Navigation warning dialog shown when user tries to leave
export function NavigationWarningDialog() {
  const { 
    showNavigationWarning,
    confirmNavigation,
    cancelNavigation 
  } = useQuizLock();

  if (!showNavigationWarning) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Leave Quiz?</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm">
            <strong>Warning:</strong> You are currently taking a quiz. If you leave this page, 
            your quiz will be automatically submitted and you may not be able to retake it.
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={cancelNavigation}
          >
            Stay on Quiz
          </Button>
          <Button 
            variant="danger" 
            className="flex-1 bg-red-600 hover:bg-red-700" 
            onClick={confirmNavigation}
          >
            Leave & Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

// Full screen lock overlay (shown only when explicitly needed, not during normal quiz)
export function QuizLockOverlay() {
  const { isQuizLocked, quizData, timeRemaining } = useQuizLock();
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 60 && timeRemaining > 0) {
      const interval = setInterval(() => setBlink(prev => !prev), 500);
      return () => clearInterval(interval);
    }
  }, [timeRemaining]);

  if (!isQuizLocked) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 60;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/95 flex flex-col items-center justify-center">
      {/* Lock Icon */}
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-blue-400" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-2">
        Quiz Paused
      </h2>
      
      <p className="text-slate-400 text-center max-w-md mb-8">
        You are taking <span className="text-white font-medium">{quizData?.title || 'a quiz'}</span>.<br />
        Please return to the quiz tab to continue.
      </p>

      {/* Timer Display */}
      <div className={`flex items-center gap-3 px-8 py-4 rounded-xl border-2 ${
        isLowTime 
          ? blink 
            ? 'bg-red-500/20 border-red-500 text-red-400' 
            : 'bg-red-500/10 border-red-500/50 text-red-400'
          : 'bg-blue-500/10 border-blue-500/50 text-blue-400'
      }`}>
        <Clock className={`w-6 h-6 ${isLowTime && blink ? 'animate-pulse' : ''}`} />
        <span className="text-4xl font-mono font-bold">
          {formatTime(timeRemaining)}
        </span>
      </div>

      <p className="mt-6 text-slate-500 text-sm">
        Do not close this window or refresh the page.
      </p>
    </div>
  );
}

// Default export - combines all components
export function QuizLockModal() {
  return (
    <>
      <QuizTimerWidget />
      <NavigationWarningDialog />
    </>
  );
}
