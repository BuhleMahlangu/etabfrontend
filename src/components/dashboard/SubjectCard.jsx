import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Clock, TrendingUp } from 'lucide-react';
import { Card } from '../common/Card';

const phaseColors = {
  Foundation: 'from-pink-500 to-rose-500',
  Intermediate: 'from-purple-500 to-indigo-500',
  Senior: 'from-blue-500 to-cyan-500',
  FET: 'from-emerald-500 to-teal-500',
};

const phaseBgColors = {
  Foundation: 'bg-pink-50',
  Intermediate: 'bg-purple-50',
  Senior: 'bg-blue-50',
  FET: 'bg-emerald-50',
};

export function SubjectCard({ subject, enrollment }) {
  const progress = enrollment?.final_mark || 0;
  const hasPassed = enrollment?.has_passed;
  
  return (
    <Link to={`/subjects/${subject.id}`}>
      <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
        {/* Header with Gradient */}
        <div className={`h-24 bg-gradient-to-r ${phaseColors[subject.phase]} relative`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-4 right-4">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-white/20 text-white backdrop-blur-sm`}>
              {subject.phase}
            </span>
          </div>
          <div className="absolute -bottom-6 left-6">
            <div className={`w-12 h-12 rounded-xl ${phaseBgColors[subject.phase]} flex items-center justify-center shadow-lg`}>
              <BookOpen className="w-6 h-6 text-slate-700" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-8 pb-4 px-4">
          <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
            {subject.name}
          </h3>
          <p className="text-sm text-slate-500 mb-4">{subject.code}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>12 Materials</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>3 Deadlines</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className={`font-medium ${
                hasPassed ? 'text-emerald-600' : progress >= 50 ? 'text-blue-600' : 'text-amber-600'
              }`}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  hasPassed ? 'bg-emerald-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            {hasPassed && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Passed
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}