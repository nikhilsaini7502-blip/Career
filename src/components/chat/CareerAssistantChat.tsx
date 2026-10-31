import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { ChatMessage } from '../../types/career';

export const CareerAssistantChat: React.FC = () => {
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
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  // Handle Speech Recognition for Wispr Flow / Web Speech
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecognitionError('Speech recognition is not supported in this browser. You can use Wispr Flow desktop dictation directly into the text field.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      setRecognitionError('Microphone access unavailable. Dictate directly using Wispr Flow.');
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

      if (!response.ok) throw new Error('Chat API call failed');
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
      console.error('Chat error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveAction = (proposalText: string) => {
    handleSendMessage(`I approve the proposed roadmap adaptation: "${proposalText.slice(0, 100)}"`);
  };

  const quickPrompts = [
    { label: '📊 Analyze My Skill Gaps', query: 'What skills am I missing for my target role?' },
    { label: '🎯 Generate 8-Week Roadmap', query: 'Create an 8-week personalized learning roadmap for me.' },
    { label: '🛠️ Recommend Portfolio Projects', query: 'Recommend practical portfolio projects to prove my skill gaps.' },
    { label: '🔄 Evaluate My Progress', query: 'Evaluate my recent learning progress and adapt my roadmap if needed.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs card-3d">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-base">Agent 0: Career Orchestrator</h2>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                Multi-Agent Dispatcher
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Coordinating 8 specialist agents & deep reasoning for {profile.targetRoleTitle}
            </p>
          </div>
        </div>

        {/* Wispr Flow Voice Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-purple-700 font-medium">
          <Mic className="w-3.5 h-3.5 text-purple-600" />
          <span>Wispr Flow Dictation Ready</span>
        </div>
      </div>

      {/* Message History Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          return (
            <div 
              key={msg.id} 
              className={`flex gap-3 sm:gap-4 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div 
                className={`
                  w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-xs
                  ${isUser 
                    ? 'bg-purple-600 text-white' 
                    : isSystem 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-white border border-purple-200 text-purple-700'}
                `}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[85%] sm:max-w-[78%]">
                <div 
                  className={`
                    p-4 rounded-2xl text-sm leading-relaxed shadow-xs
                    ${isUser 
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-600/15' 
                      : isSystem 
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none' 
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'}
                  `}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* If action required (e.g. human approval for roadmap change) */}
                  {msg.agentTrace?.actionRequired && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                      <button
                        onClick={() => handleApproveAction(msg.content)}
                        className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Roadmap Adaptation
                      </button>
                    </div>
                  )}
                </div>

                {/* Agent Execution Trace Badge */}
                {msg.agentTrace && (
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pl-1 font-medium">
                    <span className="flex items-center gap-1 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md text-purple-700 font-mono font-bold">
                      <Layers className="w-3 h-3 text-purple-600" />
                      {msg.agentTrace.orchestratorRoute}
                    </span>
                    {msg.agentTrace.specialistsInvoked?.map((agent, i) => (
                      <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                        {agent.replace('Agent ', 'A')}
                      </span>
                    ))}
                    {msg.agentTrace.thinkingDurationMs && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {msg.agentTrace.thinkingDurationMs}ms
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming/Loading Indicator */}
        {isSubmitting && (
          <div className="flex gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-4 text-xs text-purple-800 font-medium flex items-center gap-3 shadow-xs">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Orchestrating specialist agents & reasoning with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-bold whitespace-nowrap text-[11px] uppercase tracking-wider">Suggested:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            disabled={isSubmitting}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 transition-colors disabled:opacity-50 font-medium shadow-xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Composer (Supports Wispr Flow & Native Speech) */}
      <div className="p-4 bg-white border-t border-slate-200">
        {recognitionError && (
          <div className="mb-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
            <span>{recognitionError}</span>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`
              p-3 rounded-xl border transition-all flex items-center justify-center
              ${isRecording 
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-purple-700 hover:bg-purple-50'}
            `}
            title={isRecording ? 'Listening... click to stop' : 'Voice dictation (Wispr Flow / Mic)'}
            aria-label="Voice Dictation"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything, dictate via Wispr Flow, or request roadmap updates..."
            disabled={isSubmitting}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || isSubmitting}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-xs shadow-purple-600/25 flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
