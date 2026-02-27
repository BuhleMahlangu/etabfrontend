import React from 'react';
import { Bell, BookOpen, Calendar, TrendingUp, X } from 'lucide-react';
import { Card } from '../common/Card';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  general: Bell,
  deadline: Calendar,
  mark: TrendingUp,
  promotion: TrendingUp,
  material: BookOpen,
};

const colorMap = {
  general: 'bg-blue-100 text-blue-600',
  deadline: 'bg-amber-100 text-amber-600',
  mark: 'bg-emerald-100 text-emerald-600',
  promotion: 'bg-purple-100 text-purple-600',
  material: 'bg-cyan-100 text-cyan-600',
};

export function NotificationCard({ notification, onMarkAsRead }) {
  const Icon = iconMap[notification.type] || Bell;
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[notification.type] || colorMap.general}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className={`mt-1 text-sm ${!notification.is_read ? 'text-slate-600' : 'text-slate-500'}`}>
            {notification.message}
          </p>
        </div>
        
        {!notification.is_read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-slate-400 hover:text-slate-600"
            title="Mark as read"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}