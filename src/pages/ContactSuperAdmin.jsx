import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Inbox,
  RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function ContactSuperAdmin() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Fetch existing messages to Super Admin
  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/support/my-messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Filter only super admin messages
        const superAdminMessages = data.data.filter(msg => msg.is_super_admin_message);
        setMessages(superAdminMessages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/support/super-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          category
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast('Message sent to Super Admin successfully!', 'success');
        setSubject('');
        setMessage('');
        setCategory('general');
        fetchMessages(); // Refresh the list
      } else {
        addToast(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addToast('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Contact Super Admin
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Need help? Send a message directly to the Super Admin team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message Form */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Send New Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Issue</option>
                  <option value="urgent">Urgent Matter</option>
                  <option value="feature">Feature Request</option>
                  <option value="billing">Billing/Subscription</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your message"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white resize-none"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !subject.trim() || !message.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Previous Messages */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Your Messages
              </h2>
              <button
                onClick={fetchMessages}
                className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingMessages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  No messages yet
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Your messages to Super Admin will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg border ${
                      msg.status === 'resolved'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : msg.status === 'in_progress'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                        {msg.subject}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(msg.status)}
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {getStatusText(msg.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {msg.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="capitalize">{msg.category}</span>
                      <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    {msg.admin_response && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-700 rounded-lg">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          Response:
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {msg.admin_response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-purple-900 dark:text-purple-300 mb-1">
                What happens next?
              </h3>
              <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                <li>• Your message will be sent directly to the Super Admin team</li>
                <li>• You'll receive a notification when they respond</li>
                <li>• Response time is typically 24-48 hours</li>
                <li>• For urgent issues, mark your message as "Urgent Matter"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
