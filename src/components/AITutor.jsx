import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, Sparkles } from 'lucide-react';
import { aiTutorAPI } from '../services/api';

export const AITutor = ({ subject, context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(20);
  const messagesEndRef = useRef(null);

  // Load history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await aiTutorAPI.getHistory(subject);
      if (response.success) {
        const history = response.data.map(h => ([
          { type: 'user', text: h.message },
          { type: 'ai', text: h.response }
        ])).flat();
        setMessages(history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await aiTutorAPI.ask({
        message: userMessage,
        subject,
        context
      });

      if (response.success) {
        setMessages(prev => [...prev, { type: 'ai', text: response.data.response }]);
        setRemaining(response.data.remainingQuestions);
      } else {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: 'Sorry, I\'m having trouble. Please try again later.' 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: err.response?.data?.message || 'Something went wrong. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick question suggestions
  const suggestions = [
    "I don't understand this topic",
    "Can you explain this in simpler terms?",
    "Give me a hint for this question",
    "How do I approach this problem?"
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        title="Ask AI Tutor"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI Tutor</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">AI Tutor</h3>
            <p className="text-xs text-purple-100">
              {remaining} questions remaining today
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-purple-400" />
            <p className="mb-4">Hi! I'm your AI study buddy.</p>
            <p className="text-sm mb-4">I won't give you answers, but I'll help you learn!</p>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.type === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading || remaining <= 0}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || remaining <= 0}
            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          I guide you to answers, I don't give them directly
        </p>
      </div>
    </div>
  );
};
