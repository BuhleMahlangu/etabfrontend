import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';
import { format, differenceInDays, isPast, isToday } from 'date-fns';

export function DeadlineCard({ deadline }) {
  const dueDate = new Date(deadline.due_date);
  const daysLeft = differenceInDays(dueDate, new Date());
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);

  const getStatusColor = () => {
    if (isOverdue) return 'text-red-600 bg-red-50';
    if (isDueToday) return 'text-amber-600 bg-amber-50';
    if (daysLeft <= 3) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStatusText = () => {
    if (isOverdue) return 'Overdue';
    if (isDueToday) return 'Due Today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor()}`}>
          {isOverdue ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <Clock className="w-6 h-6" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-slate-900 truncate">{deadline.title}</h4>
              <p className="text-sm text-slate-500">{deadline.subject_name}</p>
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
            <span>Due: {format(dueDate, 'MMM d, yyyy')}</span>
            {deadline.max_marks && (
              <span>{deadline.max_marks} marks</span>
            )}
          </div>
          
          {deadline.description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {deadline.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}