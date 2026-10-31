import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  RotateCcw, 
  Layers, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { InterviewEvaluation, InterviewQuestion, InterviewSession } from '../../types/career';

export const MockInterviewArena: React.FC = () => {
  const { profile, interviews, addInterviewSession } = useCareerData();

  const [mode, setMode] = useState<'technical' | 'behavioral' | 'system_design'>('technical');
  const [difficulty, setDifficulty] = useState<'Junior' | 'Mid' | 'Senior'>('Mid');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewEvaluation | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);

  const handleStartQuestion = async () => {
    setIsGeneratingQuestion(true);
    setCurrentEvaluation(null);
    setUserAnswer('');
    try {
      const response = await fetch('/api/interviews/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: profile.targetRoleTitle,
          mode,
          difficulty
        })
      });

      if (!response.ok) throw new Error('Question generation failed');
      const q: InterviewQuestion = await response.json();
      setCurrentQuestion(q);
    } catch (err) {
      console.error('Interview start error:', err);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleToggleVoiceDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Dictate directly using Wispr Flow.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const response = await fetch('/api/interviews/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: profile.targetRoleTitle,
          question: currentQuestion,
          userAnswer
        })
      });

      if (!response.ok) throw new Error('Evaluation service failed');
      const evalData: InterviewEvaluation = await response.json();
      setCurrentEvaluation(evalData);

      const session: InterviewSession = {
        id: `session-${Date.now()}`,
        userId: profile.uid,
        targetRole: profile.targetRoleTitle,
        mode,
        question: currentQuestion,
        userAnswer,
        evaluation: evalData,
        status: 'evaluated',
        timestamp: new Date().toISOString()
      };

      addInterviewSession(session);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Mock Interview Arena</h1>
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
              Agent 6 Rubric
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Role-specific interview simulations evaluated on technical depth and reasoning. Scores are internal benchmarks, not guarantees of employment.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-600 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          <span>Sessions Evaluated: <strong className="text-purple-700 font-bold">{interviews.length}</strong></span>
        </div>
      </div>

      {/* Mode & Difficulty Selector Banner with 3D Card Depth */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 card-3d">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Interview Mode</label>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              {(['technical', 'behavioral', 'system_design'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    px-3 py-1.5 rounded-lg capitalize font-bold transition-all
                    ${mode === m ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                  `}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Depth</label>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              {(['Junior', 'Mid', 'Senior'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`
                    px-3 py-1.5 rounded-lg font-bold transition-all
                    ${difficulty === d ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                  `}
                >
                  {d} Level
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStartQuestion}
          disabled={isGeneratingQuestion}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs shadow-purple-600/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Sparkles className={`w-4 h-4 ${isGeneratingQuestion ? 'animate-spin' : ''}`} />
          <span>{isGeneratingQuestion ? 'Agent 6 Formulating...' : 'Generate Interview Question'}</span>
        </button>
      </div>

      {/* Active Question & Response Area */}
      {currentQuestion ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 card-3d">
          {/* Question Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                {currentQuestion.category.replace('_', ' ')} Question ({currentQuestion.difficulty})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Targeting {profile.targetRoleTitle}</span>
            </div>

            <div className="bg-purple-50/60 border border-purple-100 p-5 rounded-2xl text-base font-bold text-slate-900 leading-relaxed shadow-xs">
              "{currentQuestion.question}"
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
              <span>Key expectations: {currentQuestion.expectedKeyPoints.join(' • ')}</span>
            </div>
          </div>

          {/* User Answer Form */}
          <form onSubmit={handleEvaluateAnswer} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Your Response (Type or Dictate via Wispr Flow):
              </label>
              <button
                type="button"
                onClick={handleToggleVoiceDictation}
                className={`
                  text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors font-semibold
                  ${isRecording 
                    ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-purple-700 hover:bg-purple-50'}
                `}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Listening...' : 'Dictate with Voice'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="State your technical reasoning, trade-offs, architecture decisions, and concrete examples..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 leading-relaxed font-sans"
              required
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Evaluated against the 5-criteria weighted technical rubric
              </span>

              <button
                type="submit"
                disabled={!userAnswer.trim() || isEvaluating}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs shadow-purple-600/25 transition-colors flex items-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Agent 6 Evaluating Rubric...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit for Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Evaluation Report Breakdown */}
          {currentEvaluation && (
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200/90 p-5 rounded-2xl">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overall Rubric Score</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900">{currentEvaluation.overallScore}%</span>
                    <span className={`text-xs font-bold ${currentEvaluation.overallScore >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {currentEvaluation.overallScore >= 75 ? 'Passing (Evidence Elevated)' : 'Needs Conceptual Depth'}
                    </span>
                  </div>
                </div>

                {/* Weighted 5 Dimensions */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-[10px] text-slate-400 font-bold">Technical (30%)</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{currentEvaluation.technicalScore}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-[10px] text-slate-400 font-bold">Concepts (25%)</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{currentEvaluation.conceptualScore}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-[10px] text-slate-400 font-bold">Problem Solving (20%)</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{currentEvaluation.problemSolvingScore}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-[10px] text-slate-400 font-bold">Clarity (15%)</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{currentEvaluation.communicationScore}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                    <div className="text-[10px] text-slate-400 font-bold">Practical (10%)</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{currentEvaluation.practicalScore}%</div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strengths Identified
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 font-medium">
                    {currentEvaluation.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Areas for Improvement
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 font-medium">
                    {currentEvaluation.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Answer & Action Tip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-purple-700">Model High-Performance Response:</div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{currentEvaluation.suggestedAnswer}</p>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 font-medium">
                  <strong className="text-slate-800 font-bold">Pro Tip: </strong>{currentEvaluation.improvementTip}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-xs card-3d">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
            <Mic className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Ready for Technical Simulation?</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            Select your interview mode above and click "Generate Interview Question" to begin your structured mock session.
          </p>
        </div>
      )}
    </div>
  );
};
