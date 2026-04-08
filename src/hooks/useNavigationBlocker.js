import { useEffect, useCallback } from 'react';
import { useQuizLock } from '../context/QuizLockContext';

/**
 * Hook to block navigation when quiz is locked.
 * Usage: Call this in components that have navigation links (like Sidebar, Navbar)
 */
export function useNavigationBlocker() {
  const { isQuizLocked, attemptNavigation } = useQuizLock();

  // Handle link clicks
  const handleLinkClick = useCallback((e, navigateCallback) => {
    if (isQuizLocked) {
      e.preventDefault();
      e.stopPropagation();
      attemptNavigation(navigateCallback);
      return false;
    }
    return true;
  }, [isQuizLocked, attemptNavigation]);

  // Check if navigation should be blocked
  const shouldBlockNavigation = useCallback(() => {
    return isQuizLocked;
  }, [isQuizLocked]);

  return {
    isQuizLocked,
    handleLinkClick,
    shouldBlockNavigation
  };
}
