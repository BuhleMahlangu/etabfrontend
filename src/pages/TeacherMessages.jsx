import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  ChevronLeft,
  MessageCircle,
  Send,
  User,
  BookOpen,
  X,
  RefreshCw,
  Users,
  GraduationCap
} from 'lucide-react';
import { subjectMessageAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const TeacherMessages = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectMessageAPI.getTeacherSubjects();
      if (response.success) {
        setSubjects(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      addToast('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLearners = async (subjectId) => {
    try {
      const response = await subjectMessageAPI.getSubjectLearners(subjectId);
      if (response.success) {
        setLearners(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch learners:', err);
      addToast('Failed to load learners', 'error');
    }
  };

  const fetchMessages = async (subjectId, learnerId) => {
    try {
      const response = await subjectMessageAPI.getSubjectMessages(subjectId, learnerId);
      if (response.success) {
        setMessages(response.data || []);
        
        // Mark messages as read
        await subjectMessageAPI.markAsRead({
          subjectId: subjectId,
          senderId: learnerId
        });
        
        // Update unread count locally
        setLearners(prev => prev.map(l => 
          l.id === learnerId ? { ...l, unread_from_learner: 0 } : l
        ));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      addToast('Failed to load messages', 'error');
    }
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedLearner(null);
    setMessages([]);
    fetchLearners(subject.id);
  };

  const handleSelectLearner = (learner) => {
    setSelectedLearner(learner);
    fetchMessages(selectedSubject.id, learner.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSubject || !selectedLearner) return;
    
    setSending(true);
    try {
      const response = await subjectMessageAPI.sendMessage({
        subjectId: selectedSubject.id,
        recipientId: selectedLearner.id,
        message: newMessage
      });
      
      if (response.success) {
        setNewMessage('');
        fetchMessages(selectedSubject.id, selectedLearner.id);
        addToast('Message sent', 'success');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      addToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Student Messages</h1>
            <p className="text-slate-500 dark:text-slate-400">Communicate with your students by subject</p>
          </div>
        </div>
        <button
          onClick={fetchSubjects}
          className="p-2 text-slate-400 hover:text-slate-600"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden flex h-[calc(100%-5rem)]">
        {/* Subjects List */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Subjects
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && subjects.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No subjects assigned</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSelectSubject(subject)}
                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      selectedSubject?.id === subject.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {subject.subject_name}
                        </p>
                        <p className="text-xs text-slate-500">{subject.code}</p>
                      </div>
                      {subject.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {subject.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {subject.learner_count} students
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Learners List */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {!selectedSubject ? (
              <div className="p-8 text-center">
                <p className="text-slate-400 text-sm">Select a subject first</p>
              </div>
            ) : learners.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No students enrolled</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {learners.map((learner) => (
                  <button
                    key={learner.id}
                    onClick={() => handleSelectLearner(learner)}
                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      selectedLearner?.id === learner.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {learner.first_name?.[0]}{learner.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {learner.first_name} {learner.last_name}
                          </p>
                          {learner.unread_from_learner > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {learner.unread_from_learner}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{learner.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedLearner ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {selectedLearner.first_name?.[0]}{selectedLearner.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {selectedLearner.first_name} {selectedLearner.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{selectedSubject.subject_name}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.sender_role === 'teacher';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a student to view messages</p>
                <p className="text-sm text-slate-400 mt-2">
                  Choose a subject and then a student
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
