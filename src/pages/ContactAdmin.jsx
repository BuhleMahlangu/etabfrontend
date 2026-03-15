import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Send,
  Clock,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  HelpCircle,
  AlertCircle,
  Inbox,
  X
} from 'lucide-react';
import { supportAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export const ContactAdmin = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });

  const categories = [
    { value: 'general', label: 'General Inquiry', icon: HelpCircle },
    { value: 'account', label: 'Account Issues', icon: AlertCircle },
    { value: 'technical', label: 'Technical Support', icon: RefreshCw },
    { value: 'billing', label: 'Billing/Payments', icon: CheckCircle },
    { value: 'other', label: 'Other', icon: MessageCircle }
  ];

  useEffect(() => {
    fetchMyMessages();
  }, []);

  const fetchMyMessages = async () => {
    try {
      setLoading(true);
      const response = await supportAPI.getMyMessages();
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      addToast('Failed to load your messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const response = await supportAPI.sendMessage(formData);
      
      if (response.success) {
        addToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        setFormData({ subject: '', message: '', category: 'general' });
        setShowForm(false);
        fetchMyMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      addToast('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved'
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.open}`}>
        {status === 'open' && <Clock className="w-3 h-3" />}
        {status === 'in_progress' && <RefreshCw className="w-3 h-3" />}
        {status === 'resolved' && <CheckCircle className="w-3 h-3" />}
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Contact Admin</h1>
            <p className="text-slate-500 dark:text-slate-400">Get help with your account or report issues</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <MessageCircle className="w-4 h-4" />
          New Message
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Open Requests</p>
          <p className="text-2xl font-bold text-yellow-600">
            {messages.filter(m => m.status === 'open').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {messages.filter(m => m.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {messages.filter(m => m.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Your Messages
          </h2>
          <button
            onClick={fetchMyMessages}
            className="p-2 text-slate-400 hover:text-slate-600"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {loading && messages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No messages yet</p>
            <p className="text-sm text-slate-400">Click "New Message" to get help from admin</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => setSelectedMessage(msg)}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {msg.subject}
                      </h3>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{msg.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Sent on {formatDate(msg.created_at)}
                    </p>
                  </div>
                  {msg.admin_response && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Replied
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Contact Admin
              </h3>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="5"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Message Details
                </h3>
                {getStatusBadge(selectedMessage.status)}
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Original Message */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedMessage.subject}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {formatDate(selectedMessage.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400">
                    {categories.find(c => c.value === selectedMessage.category)?.label || selectedMessage.category}
                  </span>
                </div>
              </div>
              
              {/* Admin Response */}
              {selectedMessage.admin_response ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Admin Response
                    </h4>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {formatDate(selectedMessage.responded_at)}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                    {selectedMessage.admin_response}
                  </p>
                  {selectedMessage.admin_first_name && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      — {selectedMessage.admin_first_name} {selectedMessage.admin_last_name}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Waiting for admin response...</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
