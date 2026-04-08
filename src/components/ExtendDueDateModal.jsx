import React, { useState } from 'react';
import { Clock, Calendar, AlertCircle, X, Check } from 'lucide-react';
import { Button } from './common/Button';
import { Card, CardHeader, CardTitle, CardContent } from './common/Card';
import { useToast } from './common/Toast';

export function ExtendDueDateModal({ isOpen, onClose, item, itemType, onExtend }) {
  const { addToast } = useToast();
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !item) return null;

  const currentDueDate = itemType === 'quiz' 
    ? item.available_until 
    : item.due_date;

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
  };

  const currentFormatted = formatDateTimeLocal(currentDueDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newDate || !newTime) {
      addToast('Please select both date and time', 'error');
      return;
    }

    const newDueDate = new Date(`${newDate}T${newTime}`);
    
    if (newDueDate <= new Date(currentDueDate)) {
      addToast('New due date must be later than current due date', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await onExtend(item.id, {
        newDueDate: newDueDate.toISOString(),
        reason: reason.trim()
      });
      addToast('Due date extended successfully! Students will be notified.', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to extend due date:', error);
      addToast(error.message || 'Failed to extend due date', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-slide-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Extend Due Date
          </CardTitle>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Due Date */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Current Due Date
              </label>
              <p className="text-slate-900 font-medium">
                {currentDueDate 
                  ? new Date(currentDueDate).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Not set'
                }
              </p>
            </div>

            {/* New Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={currentFormatted.date}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Reason for Extension
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Technical issues, student requests..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                This will be included in the notification to students
              </p>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                All enrolled students will receive a notification about this extension.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isLoading}
                disabled={!newDate || !newTime}
              >
                <Check className="w-4 h-4 mr-2" />
                Extend Due Date
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
