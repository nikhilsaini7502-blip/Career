import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2, 
  Layers, 
  User, 
  Check, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { ChatMessage } from '../../types/career';

interface DockedAiCoPilotProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandFullScreen?: () => void;
}

export const DockedAiCoPilot: React.FC<DockedAiCoPilotProps> = ({ isOpen, onClose, onExpandFullScreen }) => {
  const { 
    profile, 
    userSkills, 
    learningPlan, 
    evidenceRecords, 
    messages, 
    addChatMessage, 
    addAgentLogs,
    setLearningPlan 
  } = useCareerData();

  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isSubmitting, isOpen]);

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. You can dictate using Wispr Flow directly into the input.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${text}` : text);
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isSubmitting) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    addChatMessage(userMsg);
    setInput('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.uid,
          message: query,
          profile,
          context: {
            skills: userSkills,
            learningPlan,
            recentEvidence: evidenceRecords
          }
        })
      });

      if (!response.ok) throw new Error('Co-Pilot request failed');
      const data = await response.json();
      if (data.message) {
        addChatMessage(data.message);
      }
      if (data.agentLogs && data.agentLogs.length > 0) {
        addAgentLogs(data.agentLogs);
      }
      if (data.stateUpdates?.newPlan) {
        setLearningPlan(data.stateUpdates.newPlan);
      }
    } catch (err: any) {
      console.error('Co-Pilot error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-16 right-0 w-full sm:w-96 md:w-[420px] bg-white border-l border-slate-200/90 shadow-2xl z-40 flex flex-col animate-slide-left font-sans">
      {/* Co-Pilot Header */}
      <div className="px-4 py-3.5 border-b border-slate-200/90 bg-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-900">AI Career Co-Pilot</span>
              <span className="text-[9px] bg-purple-50 text-purple-700 font-mono font-bold px-1.5 py-0.2 rounded border border-purple-200">
                Agent 0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Contextual coaching & real-time career guidance</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          {onExpandFullScreen && (
            <button
              onClick={onExpandFullScreen}
              className="p-1.5 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Expand to Full Screen View"
              aria-label="Expand Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close Co-Pilot Dock"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
              <div 
                className={`
                  w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-xs
                  ${isUser ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 border border-purple-200'}
                `}
              >
                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>

              <div className="space-y-1 max-w-[85%]">
                <div 
                  className={`
                    p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap text-xs shadow-xs
                    ${isUser 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'}
                  `}
                >
                  {msg.content}
                </div>

                {msg.agentTrace && (
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 pl-0.5">
                    <span className="text-purple-600 font-mono font-bold">{msg.agentTrace.orchestratorRoute}</span>
                    {msg.agentTrace.thinkingDurationMs && (
                      <span>• {msg.agentTrace.thinkingDurationMs}ms</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSubmitting && (
          <div className="flex gap-2 items-center text-[11px] text-purple-700 bg-purple-50/80 p-3 rounded-2xl border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-600" />
            <span className="font-medium">Co-Pilot reasoning with Gemini models...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Coach Prompts */}
      <div className="px-3 py-2 bg-white border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {[
          '📊 Analyze my gaps',
          '⚡ 3-min interview drill',
          '🎯 Tailor for this role',
          '🛠️ Project ideas'
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.slice(2))}
            disabled={isSubmitting}
            className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/80 hover:border-purple-200 transition-colors disabled:opacity-50 font-medium shadow-xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`
              p-2 rounded-xl border transition-colors flex items-center justify-center
              ${isRecording ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-purple-700 hover:bg-purple-50'}
            `}
            title="Wispr Flow Voice Dictation"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your career co-pilot..."
            disabled={isSubmitting}
            className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
          />

          <button
            type="submit"
            disabled={!input.trim() || isSubmitting}
            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl transition-colors flex items-center justify-center shadow-xs shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
