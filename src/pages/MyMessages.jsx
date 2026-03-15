import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  ChevronLeft,
  MessageCircle,
  Clock,
  Send,
  User,
  BookOpen,
  X,
  RefreshCw,
  Search
} from 'lucide-react';
import { subjectMessageAPI } from '../services/api';
import { useToast } from '../components/common/Toast';

export const MyMessages = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await subjectMessageAPI.getConversations();
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      addToast('Failed to load conversations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversation) => {
    try {
      const response = await subjectMessageAPI.getSubjectMessages(
        conversation.subject_id,
        conversation.other_user_id
      );
      
      if (response.success) {
        setMessages(response.data || []);
        
        // Mark messages as read
        if (conversation.unread_count > 0) {
          await subjectMessageAPI.markAsRead({
            subjectId: conversation.subject_id,
            senderId: conversation.other_user_id
          });
          
          // Update unread count locally
          setConversations(prev => prev.map(c => 
            c.id === conversation.id ? { ...c, unread_count: 0 } : c
          ));
        }
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      addToast('Failed to load messages', 'error');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSending(true);
    try {
      const response = await subjectMessageAPI.sendMessage({
        subjectId: selectedConversation.subject_id,
        recipientId: selectedConversation.other_user_id,
        message: newMessage
      });
      
      if (response.success) {
        setNewMessage('');
        fetchMessages(selectedConversation);
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
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-6rem)]">
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
            <p className="text-slate-500 dark:text-slate-400">Communicate with your teachers</p>
          </div>
        </div>
        <button
          onClick={fetchConversations}
          className="p-2 text-slate-400 hover:text-slate-600"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden flex h-[calc(100%-5rem)]">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No messages yet</p>
                <p className="text-xs text-slate-400 mt-1">Go to a subject to message your teacher</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.other_user_first_name?.[0]}{conv.other_user_last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {conv.other_user_first_name} {conv.other_user_last_name}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{conv.subject_name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 truncate mt-1">
                          {conv.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{formatDate(conv.created_at)}</p>
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
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {selectedConversation.other_user_first_name?.[0]}{selectedConversation.other_user_last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {selectedConversation.other_user_first_name} {selectedConversation.other_user_last_name}
                    </p>
                    <p className="text-xs text-slate-500">{selectedConversation.subject_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                  const isMe = msg.sender_id !== selectedConversation.other_user_id;
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
                <p className="text-slate-500">Select a conversation to view messages</p>
                <p className="text-sm text-slate-400 mt-2">
                  Or go to a subject to start a new conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
