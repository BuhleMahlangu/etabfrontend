import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  HelpCircle,
  ChevronRight,
  Filter,
  RefreshCw,
  BookOpen,
  Hourglass,
  AlertTriangle
} from 'lucide-react';
import { deadlineAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const Deadlines = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState([]);
  const [filter, setFilter] = useState('all'); // all, assignments, quizzes, overdue, due-soon
  const [counts, setCounts] = useState({
    overdue: 0,
    dueSoon: 0,
    upcoming: 0,
    total: 0
  });

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const response = await deadlineAPI.getMyDeadlines();
      if (response.success) {
        setDeadlines(response.data.allDeadlines);
        setCounts(response.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
      addToast('Failed to load deadlines', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (status, hoursRemaining) => {
    if (status === 'overdue') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'due-soon' || hoursRemaining < 24) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (hoursRemaining < 72) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getUrgencyIcon = (status) => {
    if (status === 'overdue') return <AlertTriangle className="w-5 h-5 text-red-600" />;
    if (status === 'due-soon') return <Hourglass className="w-5 h-5 text-orange-600" />;
    return <Clock className="w-5 h-5 text-blue-600" />;
  };

  const formatTimeRemaining = (hours) => {
    if (hours < 0) {
      const days = Math.abs(Math.floor(hours / 24));
      const hrs = Math.abs(hours % 24);
      if (days > 0) return `${days}d ${hrs}h overdue`;
      return `${hrs}h overdue`;
    }
    if (hours < 24) return `${hours}h left`;
    const days = Math.floor(hours / 24);
    const hrs = hours % 24;
    if (hrs > 0) return `${days}d ${hrs}h left`;
    return `${days} days left`;
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.setDate(now.getDate() + 1)).toDateString() === date.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredDeadlines = deadlines.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'assignments') return d.type === 'assignment';
    if (filter === 'quizzes') return d.type === 'quiz';
    if (filter === 'overdue') return d.status === 'overdue';
    if (filter === 'due-soon') return d.status === 'due-soon' || d.hoursRemaining < 24;
    return true;
  });

  const handleAction = (deadline) => {
    if (deadline.type === 'assignment') {
      navigate('/learner/assignments');
    } else {
      navigate('/learner/quizzes');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Upcoming Deadlines</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Track your assignments and quiz deadlines
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => setFilter('all')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-2 transition-all ${
            filter === 'all' ? 'border-blue-500' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Total Pending</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{counts.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setFilter('due-soon')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-2 transition-all ${
            filter === 'due-soon' ? 'border-orange-500' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Due Soon</p>
              <p className="text-3xl font-bold text-orange-600">{counts.dueSoon}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Hourglass className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-2">Due within 24 hours</p>
        </div>

        <div 
          onClick={() => setFilter('overdue')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-2 transition-all ${
            filter === 'overdue' ? 'border-red-500' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Overdue</p>
              <p className="text-3xl font-bold text-red-600">{counts.overdue}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setFilter('upcoming')}
          className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border-2 transition-all ${
            filter === 'upcoming' ? 'border-green-500' : 'border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Upcoming</p>
              <p className="text-3xl font-bold text-green-600">{counts.upcoming}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        {[
          { id: 'all', label: 'All', count: counts.total },
          { id: 'assignments', label: 'Assignments' },
          { id: 'quizzes', label: 'Quizzes' },
          { id: 'due-soon', label: 'Due Soon', count: counts.dueSoon },
          { id: 'overdue', label: 'Overdue', count: counts.overdue },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === f.id ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={fetchDeadlines}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredDeadlines.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              All Caught Up!
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {filter === 'all' 
                ? "You have no upcoming deadlines. Great job!"
                : "No deadlines match your current filter."
              }
            </p>
          </div>
        ) : (
          filteredDeadlines.map((deadline) => (
            <div
              key={`${deadline.type}-${deadline.id}`}
              onClick={() => handleAction(deadline)}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-l-4 p-6 cursor-pointer hover:shadow-md transition-all ${
                deadline.status === 'overdue' 
                  ? 'border-l-red-500' 
                  : deadline.status === 'due-soon' || deadline.hoursRemaining < 24
                    ? 'border-l-orange-500'
                    : 'border-l-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${
                    deadline.type === 'assignment' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' 
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                  }`}>
                    {deadline.type === 'assignment' ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <HelpCircle className="w-6 h-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        deadline.type === 'assignment'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {deadline.type === 'assignment' ? 'Assignment' : 'Quiz'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {deadline.subjectName}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {deadline.title}
                    </h3>
                    {deadline.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {deadline.description}
                      </p>
                    )}
                    
                    {/* Additional Info */}
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {deadline.maxMarks} marks
                      </span>
                      {deadline.timeLimit && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {deadline.timeLimit} mins
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Due Date & Status */}
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    getUrgencyColor(deadline.status, deadline.hoursRemaining)
                  }`}>
                    {getUrgencyIcon(deadline.status)}
                    <span>{formatTimeRemaining(deadline.hoursRemaining)}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-2">
                    {formatDueDate(deadline.dueDate)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(deadline.dueDate).toLocaleTimeString('en-ZA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Action Hint */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {deadline.type === 'assignment' 
                    ? 'Click to view assignment details'
                    : 'Click to take quiz'
                  }
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Missing icon component
const Award = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
