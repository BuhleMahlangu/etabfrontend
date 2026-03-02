import React from 'react';
import { SubjectBrowser } from '../components/SubjectBrowser';

export function SubjectsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Optional: Add page header or breadcrumbs */}
      <SubjectBrowser />
    </div>
  );
}