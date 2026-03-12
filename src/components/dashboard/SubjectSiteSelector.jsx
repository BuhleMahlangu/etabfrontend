import React, { useState, useRef, useEffect } from 'react';
import { useSubject } from './SubjectContext';
import { BookOpen, ChevronDown, Check, GraduationCap } from 'lucide-react';

export const SubjectSiteSelector = () => {
  const { availableSubjects, currentSubject, selectSubject, loading } = useSubject();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="h-12 w-64 bg-slate-200 animate-pulse rounded-lg" />
    );
  }

  if (availableSubjects.length === 0) {
    return (
      <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
        No subjects assigned
      </div>
    );
  }

  if (!currentSubject) {
    return (
      <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm">
        Select a subject
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all min-w-[280px] max-w-[400px]"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {currentSubject?.subjectCode?.replace(/-.*$/, '').slice(0, 2) || 'S'}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">
            {currentSubject?.subjectName || 'Select Subject'}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {currentSubject?.grades?.length || 0} grade(s) • {currentSubject?.department}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[400px] overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
              Your Subject Sites ({availableSubjects.length})
            </p>
            
            <div className="space-y-1 mt-1">
              {availableSubjects.map((subject) => (
                <button
                  key={subject.subjectId}
                  onClick={() => {
                    selectSubject(subject);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                    currentSubject?.subjectId === subject.subjectId
                      ? 'bg-blue-50 border border-blue-100'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    currentSubject?.subjectId === subject.subjectId
                      ? 'bg-blue-200 text-blue-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {subject.subjectCode?.replace(/-.*$/, '').slice(0, 2) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${
                      currentSubject?.subjectId === subject.subjectId ? 'text-blue-900' : 'text-slate-700'
                    }`}>
                      {subject.subjectName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <GraduationCap className="w-3 h-3" />
                      <span className="truncate">
                        {subject.grades.map(g => g.gradeName).join(', ')}
                      </span>
                    </div>
                  </div>
                  {currentSubject?.subjectId === subject.subjectId && (
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                  {subject.isPrimary && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      Primary
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {availableSubjects.length > 1 && (
            <div className="border-t border-slate-100 p-3 bg-slate-50">
              <p className="text-xs text-slate-500 text-center">
                Click any subject to switch context
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};