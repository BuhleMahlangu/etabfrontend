import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  FileText, 
  Calendar, 
  AlertCircle,
  BookOpen,
  Award,
  Megaphone,
  Clock,
  Filter,
  RefreshCw,
  ChevronRight,
  X
} from 'lucide-react';
import { notificationAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const Notifications = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    materials: 0,
    deadlines: 0,
    announcements: 0
  });
  const [filter, setFilter] = useState('all'); // all, unread, materials, deadlines, announcements
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter === 'unread') params.unreadOnly = true;
      
      const response = await notificationAPI.getMyNotifications(params);
      if (response.success) {
        setNotifications(response.data);
        setHasMore(response.pagination.totalPages > page);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationAPI.markAsRead(id);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        addToast('Marked as read', 'success');
      }
    } catch (err) {
      addToast('Failed to mark as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setStats(prev => ({ ...prev, unread: 0 }));
        addToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      addToast('Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await notificationAPI.delete(id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        addToast('Notification deleted', 'success');
      }
    } catch (err) {
      addToast('Failed to delete notification', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'material': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'deadline': return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'announcement': return <Megaphone className="w-5 h-5 text-purple-600" />;
      case 'grade': return <Award className="w-5 h-5 text-green-600" />;
      case 'assignment': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'material': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'deadline': return 'bg-orange-100 dark:bg-orange-900/30';
      case 'announcement': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'grade': return 'bg-green-100 dark:bg-green-900/30';
      case 'assignment': return 'bg-indigo-100 dark:bg-indigo-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on type
    switch (notification.type) {
      case 'material':
        navigate('/materials');
        break;
      case 'assignment':
        navigate('/learner/assignments');
        break;
      case 'deadline':
        navigate('/deadlines');
        break;
      case 'announcement':
        navigate('/subjects');
        break;
      default:
        break;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Stay updated with your learning activities
            </p>
          </div>
          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { id: 'all', label: 'All', count: stats.total, icon: Bell },
          { id: 'unread', label: 'Unread', count: stats.unread, icon: AlertCircle, highlight: true },
          { id: 'material', label: 'Materials', count: stats.materials, icon: FileText },
          { id: 'deadline', label: 'Deadlines', count: stats.deadlines, icon: Calendar },
          { id: 'announcement', label: 'Announcements', count: stats.announcements, icon: Megaphone },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`p-4 rounded-xl text-left transition-all ${
              filter === item.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                : 'bg-white dark:bg-slate-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <item.icon className={`w-5 h-5 ${filter === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.highlight && item.count > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {item.count}
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold ${filter === item.id ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {item.count}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No notifications
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {filter === 'all' 
                ? "You're all caught up!" 
                : `No ${filter} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-semibold ${
                          notification.is_read 
                            ? 'text-slate-700 dark:text-slate-300' 
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notification.created_at)}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        {notification.subject_name && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {notification.subject_name}
                          </span>
                        )}
                        {!notification.is_read && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="p-4 text-center border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
