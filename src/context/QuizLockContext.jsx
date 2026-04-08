import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Cache bust: 1730609857
const QuizLockContext = createContext(null);

export function QuizLockProvider({ children }) {
  const [isQuizLocked, setIsQuizLocked] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Prevent browser refresh/close
  useEffect(() => {
    if (!isQuizLocked) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You are in the middle of a quiz. If you leave, your quiz will be submitted automatically.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isQuizLocked]);

  // Prevent keyboard shortcuts
  useEffect(() => {
    if (!isQuizLocked) return;

    const handleKeyDown = (e) => {
      // Prevent Alt+Left/Right (browser back/forward)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        return;
      }
      
      // Prevent F5 refresh
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuizLocked]);

  const lockQuiz = useCallback((data) => {
    setQuizData(data);
    setIsQuizLocked(true);
    if (data?.timeRemaining) {
      setTimeRemaining(data.timeRemaining);
    }
  }, []);

  const unlockQuiz = useCallback(() => {
    setIsQuizLocked(false);
    setQuizData(null);
    setTimeRemaining(0);
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  }, []);

  const updateTimeRemaining = useCallback((time) => {
    setTimeRemaining(time);
  }, []);

  // Handle navigation attempt
  const attemptNavigation = useCallback((navigateCallback) => {
    if (isQuizLocked) {
      setPendingNavigation(() => navigateCallback);
      setShowNavigationWarning(true);
      return false;
    }
    return true;
  }, [isQuizLocked]);

  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      pendingNavigation();
    }
    setShowNavigationWarning(false);
    setPendingNavigation(null);
    unlockQuiz();
  }, [pendingNavigation, unlockQuiz]);

  const cancelNavigation = useCallback(() => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  }, []);

  return (
    <QuizLockContext.Provider
      value={{
        isQuizLocked,
        quizData,
        timeRemaining,
        showNavigationWarning,
        lockQuiz,
        unlockQuiz,
        updateTimeRemaining,
        attemptNavigation,
        confirmNavigation,
        cancelNavigation
      }}
    >
      {children}
    </QuizLockContext.Provider>
  );
}

export function useQuizLock() {
  const context = useContext(QuizLockContext);
  if (!context) {
    throw new Error('useQuizLock must be used within QuizLockProvider');
  }
  return context;
}
