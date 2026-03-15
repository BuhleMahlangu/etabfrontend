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
  GraduationCap,
  MessageSquare
} from 'lucide-react';
import { subjectMessageAPI } from '../services/api';
import { subjectAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const LearnerMessages = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await subjectAPI.getMySubjects();
      if (response.success) {
        // Filter only enrolled subjects with teachers
        const enrolledSubjects = response.subjects?.doing?.filter(s => s.teacher_id) || [];
        setSubjects(enrolledSubjects);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      addToast('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (subjectId, teacherId) => {
    if (!subjectId || !teacherId) return;
    
    try {
      const response = await subjectMessageAPI.getSubjectMessages(subjectId, teacherId);
      if (response.success) {
        setMessages(response.data || []);
        
        // Mark messages as read
        await subjectMessageAPI.markAsRead({
          subjectId: subjectId,
          senderId: teacherId
        });
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      addToast('Failed to load messages', 'error');
    }
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setTeacher({
      id: subject.teacher_id,
      name: subject.teacher_name,
      first_name: subject.teacher_name?.split(' ')[0],
      last_name: subject.teacher_name?.split(' ').slice(1).join(' ')
    });
    fetchMessages(subject.id, subject.teacher_id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSubject || !teacher) return;
    
    setSending(true);
    try {
      const response = await subjectMessageAPI.sendMessage({
        subjectId: selectedSubject.id,
        recipientId: teacher.id,
        message: newMessage
      });
      
      if (response.success) {
        setNewMessage('');
        fetchMessages(selectedSubject.id, teacher.id);
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

  // Calculate unread messages for a subject
  const getUnreadCount = (subjectId) => {
    return messages.filter(m => 
      m.subject_id === subjectId && 
      m.sender_id === teacher?.id && 
      !m.is_read
    ).length;
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Messages</h1>
            <p className="text-slate-500 dark:text-slate-400">Message your teachers by subject</p>
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
        <div className="w-72 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              My Subjects
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && subjects.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No enrolled subjects</p>
                <p className="text-xs text-slate-400 mt-1">Enroll in subjects to message teachers</p>
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
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {subject.code?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {subject.name}
                        </p>
                        <p className="text-xs text-slate-500">{subject.code}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {subject.teacher_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Teacher Info */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Teacher
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {!selectedSubject ? (
              <div className="p-8 text-center">
                <p className="text-slate-400 text-sm">Select a subject first</p>
              </div>
            ) : !teacher?.id ? (
              <div className="p-8 text-center">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No teacher assigned</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </div>
                  <h3 className="text-center font-semibold text-slate-900 dark:text-slate-100">
                    {teacher.name}
                  </h3>
                  <p className="text-center text-sm text-slate-500 mt-1">
                    {selectedSubject.name}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-xs text-slate-400 text-center">
                      Subject Teacher
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedSubject && teacher ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-slate-500">{selectedSubject.name}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-2">No messages yet</p>
                    <p className="text-sm text-slate-400">
                      Start a conversation with your teacher
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_role === 'learner';
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
                            {isMe && msg.is_read && ' • Read'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
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
                <p className="text-slate-500">Select a subject to view messages</p>
                <p className="text-sm text-slate-400 mt-2">
                  Choose a subject from the list to see your teacher
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
