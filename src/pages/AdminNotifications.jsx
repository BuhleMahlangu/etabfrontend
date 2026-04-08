import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  Send, 
  AlertTriangle, 
  Info, 
  Bell,
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/Toast';
import { notificationAPI } from '../services/api';

export const AdminNotifications = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const notificationTypes = [
    { id: 'announcement', label: 'General Announcement', icon: Megaphone, color: 'blue' },
    { id: 'maintenance', label: 'System Maintenance', icon: AlertTriangle, color: 'orange' },
    { id: 'update', label: 'System Update', icon: Info, color: 'green' },
    { id: 'alert', label: 'Important Alert', icon: Bell, color: 'red' },
  ];

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      addToast('Please fill in both title and message', 'error');
      return;
    }

    setSending(true);
    try {
      const response = await notificationAPI.sendGlobal({
        title: title.trim(),
        message: message.trim(),
        type
      });

      if (response.success) {
        addToast(`Notification sent to ${response.data.recipientsCount} users successfully!`, 'success');
        setTitle('');
        setMessage('');
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      addToast(error.response?.data?.message || 'Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const selectedType = notificationTypes.find(t => t.id === type);
  const TypeIcon = selectedType?.icon || Megaphone;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Send Global Notification</h1>
          <p className="text-slate-500">Send announcements to all users in the system</p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="mb-6 bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Important Notice</h3>
              <p className="text-sm text-amber-700 mt-1">
                This will send a notification to <strong>ALL users</strong> in the system (learners, teachers, and school admins). 
                Please use this feature responsibly for important announcements only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className={`w-5 h-5 text-${selectedType?.color}-600`} />
            Compose Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Notification Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {notificationTypes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      type === t.id
                        ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-700`
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium text-center">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Scheduled Maintenance on March 25th"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">
                Keep it short and descriptive
              </span>
              <span className="text-xs text-slate-400">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your notification message here..."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-400">
                Provide clear details about the announcement
              </span>
              <span className="text-xs text-slate-400">
                {message.length}/1000
              </span>
            </div>
          </div>

          {/* Preview */}
          {(title || message) && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Preview
              </label>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${selectedType?.color}-100`}>
                    <TypeIcon className={`w-5 h-5 text-${selectedType?.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {title || 'Notification Title'}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {message || 'Notification message will appear here...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={type === 'alert' ? 'error' : type === 'maintenance' ? 'warning' : 'info'}>
                        {selectedType?.label}
                      </Badge>
                      <span className="text-xs text-slate-400">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!title.trim() || !message.trim() || sending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send to All Users
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Confirm Send</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-700 mb-2">
                  You are about to send this notification to:
                </p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Users className="w-4 h-4" />
                  <span>All users in the system</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700">{title}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{message}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Yes, Send Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
