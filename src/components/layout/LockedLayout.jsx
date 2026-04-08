import React from 'react';
import { useQuizLock } from '../../context/QuizLockContext';
import { QuizLockModal } from '../quiz/QuizLockModal';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function LockedLayout({ children, userRole }) {
  const { isQuizLocked } = useQuizLock();

  // When quiz is locked, render ONLY the quiz content with no navigation
  if (isQuizLocked) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Render only the children (quiz content) */}
        {children}
        
        {/* Quiz lock UI (timer widget + navigation warning) */}
        <QuizLockModal />
      </div>
    );
  }

  // Normal layout when quiz is not locked
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex">
        {userRole !== 'admin' && userRole !== 'school_admin' && <Sidebar />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
