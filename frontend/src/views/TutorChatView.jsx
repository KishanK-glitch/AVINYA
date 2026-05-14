import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Bot, User, Sparkles, Brain, BookOpen, ChevronRight } from 'lucide-react';
import { tutorChatHistory } from '../mockData';

// ─── Message Bubble ───────────────────────────────────────────────────────────

function AgentBadge({ agent }) {
  const config = {
    Tutor:   { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Brain    },
    Curator: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: BookOpen },
  };
  const c = config[agent] || config.Tutor;
  const Icon = c.icon;
  return (
    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      <Icon className="w-2.5 h-2.5" /> {agent}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  // Simple markdown bold renderer
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|```[^`]+```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('```') && part.endsWith('```')) {
        return (
          <code key={i} className="block bg-slate-800 text-emerald-300 text-[11px] p-3 rounded-lg my-2 font-mono whitespace-pre-wrap">
            {part.slice(3, -3).trim()}
          </code>
        );
      }
      return part.split('\n').map((line, j) => (
        <span key={j}>{line}{j < part.split('\n').length - 1 && <br />}</span>
      ));
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
        ${isUser
          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
          : 'bg-slate-100 text-slate-600'}`}
      >
        {isUser ? 'KK' : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isUser && (
          <div className="flex items-center gap-2">
            <AgentBadge agent={msg.agent} />
            <span className="text-[10px] text-slate-400">{msg.time}</span>
          </div>
        )}
        <div className={`px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'bubble-user' : 'bubble-agent text-slate-700'}`}>
          {renderContent(msg.content)}
        </div>
        {isUser && <span className="text-[10px] text-slate-400">{msg.time}</span>}
      </div>
    </div>
  );
}

// ─── Voice Premium Toggle ─────────────────────────────────────────────────────

function VoiceToggle() {
  const [active, setActive] = useState(false);

  const handleToggle = () => {
    if (!active) {
      alert('🎙️ Premium Voice Assistance\n\nThis feature activates real-time speech-to-text input and voice synthesis for the Tutor agent. Available with Premium subscription.\n\n[DEMO] Voice mode enabled — in production this would initialise the Web Speech API and connect to the TTS pipeline.');
    }
    setActive(v => !v);
  };

  return (
    <button
      id="voice-toggle-btn"
      onClick={handleToggle}
      className={`
        flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold
        border-2 transition-all duration-200 relative overflow-hidden
        ${active
          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-lg shadow-violet-200'
          : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'}
      `}
    >
      {active ? (
        <>
          <Volume2 className="w-4 h-4 animate-pulse" />
          Voice Active
          <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          Premium Voice
        </>
      )}
    </button>
  );
}

// ─── Topic Sidebar ────────────────────────────────────────────────────────────

const TOPICS = [
  { id: 1, label: 'Q, K, V Matrices', done: true  },
  { id: 2, label: 'Scaled Dot-Product', done: true  },
  { id: 3, label: 'Softmax Layer', done: false },
  { id: 4, label: 'Multi-Head Attention', done: false },
  { id: 5, label: 'Positional Encoding', done: false },
];

function TopicPanel() {
  return (
    <div className="w-56 flex-shrink-0 border-l border-slate-100 bg-slate-50 p-4 space-y-4 hidden lg:block">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Session Topics</p>
        <div className="space-y-1.5">
          {TOPICS.map(t => (
            <div key={t.id} className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors
              ${t.done ? 'text-emerald-700' : 'text-slate-600 hover:bg-white'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {t.done && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agents Active</p>
        {[['Tutor','bg-indigo-500'],['Curator','bg-emerald-500']].map(([name, bg]) => (
          <div key={name} className="flex items-center gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${bg}`} />
            <span className="text-[11px] text-slate-600">{name} Agent</span>
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
        Go to Exam <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Tutor Chat View ──────────────────────────────────────────────────────────

export default function TutorChatView() {
  const [messages, setMessages] = useState(tutorChatHistory);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = {
      id: messages.length + 1,
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate agent response (replace with real WebSocket/API call)
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'agent',
        agent: 'Tutor',
        content: "Great question! Let me break that down for you. The core idea here is that attention allows every token to \"attend\" to every other token, with the score representing relevance. The softmax ensures these scores sum to 1, creating a probability distribution over the context window.\n\nShall I walk through the matrix multiplication in detail, or move on to how Multi-Head Attention extends this?",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1800);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fadeIn">
      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-display">Tutor Chat</h1>
            <p className="text-xs text-slate-500">Topic: Transformer Attention Mechanism</p>
          </div>
          <VoiceToggle />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-slate-50">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-slate-500" />
              </div>
              <div className="bubble-agent px-4 py-3 flex items-center gap-1">
                {[0,1,2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400"
                    style={{ animation: `blink 1.2s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                id="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask the Tutor a question… (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="w-full resize-none px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                style={{ minHeight: 48, maxHeight: 128 }}
              />
            </div>
            <button
              id="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
            >
              <Send className="w-4.5 h-4.5" size={18} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Tutor + Curator agents are active · Responses powered by Gemini 2.5
          </p>
        </div>
      </div>

      {/* ── Topic Sidebar ── */}
      <TopicPanel />
    </div>
  );
}
