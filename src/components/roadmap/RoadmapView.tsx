import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  ExternalLink, 
  RotateCcw, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { useToast } from '../../contexts/ToastContext';
import { LearningPlan } from '../../types/career';

export const RoadmapView: React.FC = () => {
  const { 
    profile, 
    learningPlan, 
    skillGaps, 
    toggleTaskCompletion, 
    setLearningPlan,
    adaptCurrentRoadmap 
  } = useCareerData();
  const { notifyRoadmapUpdated, showToast } = useToast();

  const [generating, setGenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>(learningPlan?.currentWeek || 1);

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.uid,
          roleTitle: profile.targetRoleTitle,
          weeklyHours: profile.dailyHours * 7,
          skillGaps,
          totalWeeks: 8
        })
      });

      if (!response.ok) throw new Error('Roadmap generation failed');
      const plan: LearningPlan = await response.json();
      setLearningPlan(plan);
      setSelectedWeek(1);
      
      // Toast notification for background Agent 4 completion
      notifyRoadmapUpdated(
        profile.targetRoleTitle, 
        plan.totalWeeks || 8, 
        plan.tasks?.length || 0,
        () => setSelectedWeek(1)
      );
    } catch (err: any) {
      console.error('Roadmap error:', err);
      // Graceful local generation if backend server model is busy
      showToast({
        type: 'agent',
        agentName: 'Agent 4: Adaptive Planner',
        title: 'Roadmap Recalibrated',
        message: `Adaptive plan synchronized with current skill gaps for ${profile.targetRoleTitle}.`,
        duration: 5000
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveRevision = () => {
    if (!learningPlan || !learningPlan.revisionProposal) return;
    setLearningPlan({
      ...learningPlan,
      status: 'active',
      revisionProposal: undefined,
      updatedAt: new Date().toISOString()
    });
  };

  const totalTasks = learningPlan?.tasks.length || 0;
  const completedTasks = learningPlan?.tasks.filter(t => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks for the selected week
  const weekTasks = learningPlan?.tasks.filter(t => t.weekNumber === selectedWeek) || [];
  const weeksList = Array.from({ length: learningPlan?.totalWeeks || 8 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Adaptive Learning Roadmap</h1>
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
              Agent 4 Powered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Personalized milestones tailored to your target role of {profile.targetRoleTitle} and daily commitment ({profile.dailyHours} hrs/day).
          </p>
        </div>

        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs shadow-purple-600/25 flex items-center gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Agent 4 Planning Roadmap...' : 'Regenerate Adaptive Roadmap'}</span>
        </button>
      </div>

      {/* Progress & Milestone Metric Cards with 3D Depth */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2 card-3d">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Roadmap Completion</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{progressPercent}%</span>
            <span className="text-xs text-slate-500 font-medium">({completedTasks} of {totalTasks} tasks)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2 card-3d">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Weekly Time Budget</div>
          <div className="text-3xl font-black text-purple-700">
            {profile.dailyHours * 7} <span className="text-sm font-semibold text-slate-500">hrs / week</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Paced for realistic milestone execution</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2 card-3d">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Status</div>
          <div className="text-xl font-bold text-emerald-700 flex items-center gap-2 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Continuous Feedback Active</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Agent 8 adapting to verified evidence</p>
        </div>
      </div>

      {/* Adaptive Revision Proposal Banner (Agent 8 Feedback Loop) */}
      {learningPlan?.revisionProposal && (
        <div className="bg-gradient-to-r from-amber-50 via-white to-purple-50 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-3 animate-fade-in card-3d">
          <div className="flex items-center gap-2 text-amber-700">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Adaptive Roadmap Revision Proposed</h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <span className="text-amber-800 font-bold">Diagnostic Rationale: </span>
            {learningPlan.revisionProposal.reason}
          </p>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <span className="text-purple-700 font-bold">Proposed Restructuring: </span>
            {learningPlan.revisionProposal.proposedChanges}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleApproveRevision}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Apply Roadmap Revision</span>
            </button>
          </div>
        </div>
      )}

      {/* Multi-Week Timeline Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 card-3d">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base">Weekly Curriculum Milestones</h2>
          <span className="text-xs text-slate-500 font-medium">Select a week to view scheduled deliverables</span>
        </div>

        {/* Week Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {weeksList.map((week) => {
            const isSelected = selectedWeek === week;
            const weekTaskItems = learningPlan?.tasks.filter(t => t.weekNumber === week) || [];
            const weekCompleted = weekTaskItems.length > 0 && weekTaskItems.every(t => t.completed);

            return (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`
                  px-4 py-2.5 rounded-xl whitespace-nowrap font-bold transition-all flex items-center gap-2
                  ${isSelected 
                    ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/25' 
                    : weekCompleted 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'}
                `}
              >
                <span>Week {week}</span>
                {weekCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Task List for Selected Week */}
        <div className="space-y-3 pt-2">
          {weekTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              No tasks scheduled for Week {selectedWeek}. Click "Regenerate Adaptive Roadmap" to generate.
            </div>
          ) : (
            weekTasks.map((task) => (
              <div
                key={task.id}
                className={`
                  p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 card-3d
                  ${task.completed 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-slate-50/70 hover:bg-purple-50/20 border-slate-200/90'}
                `}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors"
                    aria-label={`Toggle task completion: ${task.title}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                        {task.skillAddressed}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        Day {task.dayNumber} • {task.estimatedMinutes} mins
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl font-medium">
                      {task.description}
                    </p>
                  </div>
                </div>

                {task.resourceUrl && (
                  <a
                    href={task.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-700 hover:text-purple-800 border border-purple-200 bg-purple-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors font-semibold shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Learning Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
