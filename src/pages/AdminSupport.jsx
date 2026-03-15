import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Send,
  Clock,
  CheckCircle,
  RefreshCw,
  ChevronLeft,
  Inbox,
  Search,
  Filter,
  User,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const AdminSupport = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    open_count: 0,
    in_progress_count: 0,
    resolved_count: 0,
    total_count: 0
  });
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  const statusOptions = [
    { value: 'open', label: 'Open', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-700' }
  ];

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await adminAPI.getAllSupportMessages(params);
      
      if (response.success) {
        setMessages(response.data || []);
        setStats(response.stats || {
          open_count: 0,
          in_progress_count: 0,
          resolved_count: 0,
          total_count: 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      addToast('Failed to load support messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!selectedMessage || !responseText.trim()) return;
    
    setIsResponding(true);
    try {
      const response = await adminAPI.respondToMessage(selectedMessage.id, {
        response: responseText,
        status: 'resolved'
      });
      
      if (response.success) {
        addToast('Response sent successfully', 'success');
        setResponseText('');
        setSelectedMessage(null);
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to respond:', err);
      addToast('Failed to send response', 'error');
    } finally {
      setIsResponding(false);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await adminAPI.updateMessageStatus(messageId, newStatus);
      addToast(`Status updated to ${newStatus}`, 'success');
      
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
      
      fetchMessages();
    } catch (err) {
      console.error('Failed to update status:', err);
      addToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await adminAPI.deleteMessage(messageId);
      addToast('Message deleted', 'success');
      setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      console.error('Failed to delete:', err);
      addToast('Failed to delete message', 'error');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      msg.subject?.toLowerCase().includes(query) ||
      msg.message?.toLowerCase().includes(query) ||
      msg.user_first_name?.toLowerCase().includes(query) ||
      msg.user_last_name?.toLowerCase().includes(query) ||
      msg.user_email?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status) => {
    const option = statusOptions.find(s => s.value === status);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${option?.color || 'bg-slate-100 text-slate-700'}`}>
        {status === 'open' && <Clock className="w-3 h-3" />}
        {status === 'in_progress' && <RefreshCw className="w-3 h-3" />}
        {status === 'resolved' && <CheckCircle className="w-3 h-3" />}
        {option?.label || status}
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Support Messages</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage user support requests and feedback</p>
          </div>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2 text-slate-400 hover:text-slate-600"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Messages</p>
          <p className="text-2xl font-bold">{stats.total_count}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Open</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.open_count}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.in_progress_count}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved_count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Inbox className="w-5 h-5" />
            Support Requests ({filteredMessages.length})
          </h2>
        </div>
        
        {loading && messages.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      setSelectedMessage(msg);
                      setResponseText('');
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {msg.subject}
                      </h3>
                      {getStatusBadge(msg.status)}
                      {!msg.admin_response && msg.status !== 'resolved' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                          Awaiting Response
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{msg.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {msg.user_first_name} {msg.user_last_name} ({msg.user_role})
                      </span>
                      <span>{msg.user_email}</span>
                      <span>{formatDate(msg.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={msg.status}
                      onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                      className="text-sm px-2 py-1 border border-slate-200 dark:border-slate-700 rounded"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail & Response Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Support Request
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
            
            {/* User Info */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {selectedMessage.user_first_name?.[0]}{selectedMessage.user_last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {selectedMessage.user_first_name} {selectedMessage.user_last_name}
                  </p>
                  <p className="text-sm text-slate-500">{selectedMessage.user_email} • {selectedMessage.user_role}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Original Message */}
              <div className="border-l-4 border-slate-300 dark:border-slate-600 pl-4">
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
                  <span className="inline-block px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400 capitalize">
                    {selectedMessage.category}
                  </span>
                </div>
              </div>
              
              {/* Previous Response */}
              {selectedMessage.admin_response && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Your Response
                    </h4>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {formatDate(selectedMessage.responded_at)}
                    </span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {selectedMessage.admin_response}
                  </p>
                </div>
              )}
              
              {/* Response Form */}
              {selectedMessage.status !== 'resolved' && (
                <form onSubmit={handleRespond} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Your Response
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Type your response..."
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(null)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedMessage.id, 'in_progress')}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      disabled={selectedMessage.status === 'in_progress'}
                    >
                      Mark In Progress
                    </button>
                    <button
                      type="submit"
                      disabled={isResponding}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isResponding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send & Resolve
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              {selectedMessage.status === 'resolved' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedMessage.id, 'open')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                  >
                    Reopen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
