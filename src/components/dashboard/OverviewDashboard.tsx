import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  ArrowUpRight, 
  Briefcase, 
  Compass, 
  FolderKanban, 
  Mic, 
  FileText, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Layers, 
  Building2, 
  BookmarkPlus, 
  Award, 
  Bot, 
  Zap,
  Check
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { NavTab } from '../layout/AppLayout';
import { findRoleById, TECH_ROLES_TAXONOMY } from '../../data/rolesTaxonomy';
import { generateJobMatchesForRole } from '../../utils/jobMatchEngine';
import { calculateResumeAtsScore } from '../../utils/atsEngine';

interface OverviewDashboardProps {
  setActiveTab: (tab: NavTab) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ setActiveTab }) => {
  const { 
    profile, 
    userSkills, 
    skillGaps, 
    learningPlan, 
    projects, 
    interviews, 
    applications, 
    agentLogs, 
    readinessMetrics,
    toggleTaskCompletion,
    addApplication,
    addChatMessage,
    setIsCoPilotOpen,
    triggerAgentSkillGapAnalysis,
    triggerAgentRoadmapUpdate 
  } = useCareerData();

  const [trackedJobIds, setTrackedJobIds] = useState<Record<string, boolean>>({});

  const targetRole = findRoleById(profile.targetRoleId) || TECH_ROLES_TAXONOMY[0];
  const criticalGaps = skillGaps.filter(g => g.importance === 'Critical');
  const pendingTasks = learningPlan ? learningPlan.tasks.filter(t => !t.completed).slice(0, 3) : [];
  
  // Real-time Job Matches based on Candidate Evidence
  const jobMatches = generateJobMatchesForRole(targetRole, userSkills).slice(0, 3);
  
  // ATS Resume Readiness Metrics
  const atsScore = calculateResumeAtsScore(
    profile.resumeSummary || profile.bio || '',
    userSkills,
    targetRole
  );

  const handleTrackJob = (job: typeof jobMatches[0]) => {
    addApplication({
      company: job.company,
      position: job.title,
      location: job.location,
      jobType: job.type,
      salaryRange: job.salary,
      status: 'WISHLIST',
      appliedDate: new Date().toISOString().split('T')[0],
      notes: `Grounded match score: ${job.matchScore}%. Matched: ${job.matchedSkills.join(', ')}`
    });

    setTrackedJobIds(prev => ({ ...prev, [job.id]: true }));
  };

  const handleAskCoPilotAboutJob = (job: typeof jobMatches[0]) => {
    addChatMessage({
      id: `ask-job-${Date.now()}`,
      sender: 'user',
      content: `How can I tailor my application for ${job.title} at ${job.company}? My current match score is ${job.matchScore}%.`,
      timestamp: new Date().toISOString()
    });
    setIsCoPilotOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Hero Target Role Banner - Design 3 Minimal Layout + Design 5 Lavender/Purple 3D Elegance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/20 border border-purple-100 p-6 sm:p-8 shadow-xs card-3d">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100/80 border border-purple-200 px-3 py-1 rounded-full shadow-xs">
                {profile.targetFamily}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                {profile.experienceLevel}
              </span>
              <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                {profile.dailyHours} hrs / day committed
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Target Role: <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent">{profile.targetRoleTitle}</span>
            </h1>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {profile.resumeSummary || 'ProofPath multi-agent career operating system is actively mapping your skills against employer requirements.'}
            </p>
          </div>

          {/* Readiness Score Radial Gauge - Purple variations & Clean Card Depth */}
          <div className="flex-shrink-0 flex items-center gap-5 bg-white border border-purple-100 p-5 rounded-2xl shadow-sm card-3d">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="213"
                  strokeDashoffset={213 - (213 * readinessMetrics.overallScore) / 100}
                  strokeLinecap="round"
                  className="text-purple-600 transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900">{readinessMetrics.overallScore}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Readiness Score</div>
              <div className="text-sm font-bold text-purple-900">
                {readinessMetrics.overallScore > 70 ? 'Interview Ready' : readinessMetrics.overallScore > 40 ? 'Gaining Evidence' : 'Foundational'}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {readinessMetrics.requiredSkillsCovered} of {readinessMetrics.totalRequiredSkills} requirements covered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Skill Evidence Stages - 3D Hover Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[
          { label: 'Claimed', count: readinessMetrics.evidenceBreakdown.CLAIMED, desc: 'Self-reported knowledge', textColor: 'text-slate-700', badgeColor: 'bg-slate-100 text-slate-700' },
          { label: 'Learning', count: readinessMetrics.evidenceBreakdown.LEARNING, desc: 'Currently in roadmap', textColor: 'text-amber-600', badgeColor: 'bg-amber-50 text-amber-700' },
          { label: 'Demonstrated', count: readinessMetrics.evidenceBreakdown.DEMONSTRATED, desc: 'Passed assessments', textColor: 'text-purple-600', badgeColor: 'bg-purple-50 text-purple-700' },
          { label: 'Applied', count: readinessMetrics.evidenceBreakdown.APPLIED, desc: 'Verified via project proof', textColor: 'text-indigo-600', badgeColor: 'bg-indigo-50 text-indigo-700' },
          { label: 'Interview Proven', count: readinessMetrics.evidenceBreakdown.INTERVIEW_DEMONSTRATED, desc: 'Tested under live pressure', textColor: 'text-emerald-600', badgeColor: 'bg-emerald-50 text-emerald-700' }
        ].map((stage, idx) => (
          <div 
            key={idx}
            onClick={() => setActiveTab('skills')}
            className="bg-white border border-slate-200/80 hover:border-purple-300 rounded-2xl p-4 transition-all cursor-pointer group shadow-xs card-3d"
          >
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stage.label}</div>
            <div className={`text-2xl font-black mt-1 ${stage.textColor}`}>{stage.count}</div>
            <div className="text-[11px] text-slate-500 mt-1 leading-snug">{stage.desc}</div>
          </div>
        ))}
      </div>

      {/* AI Career Coaching & Job Match Radar - Design 3 White Container with Design 5 Purple Highlights */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 rounded-xl border border-purple-100 text-purple-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Live Job Matches & Compatibility Radar</h2>
              <p className="text-xs text-slate-500">
                Compatibility percentage dynamically calculated against your verified evidence profile
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('jobs')}
            className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 self-start sm:self-center transition-colors"
          >
            Explore Job Intelligence <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {jobMatches.map((job) => {
            const isTracked = trackedJobIds[job.id];

            return (
              <div 
                key={job.id} 
                className="bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-purple-200 rounded-2xl p-4.5 flex flex-col justify-between space-y-3.5 transition-all shadow-xs card-3d"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{job.company}</span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${job.matchScore > 75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                      {job.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{job.title}</h3>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{job.location} • {job.salary}</div>

                  <div className="mt-3 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Matched Evidence:</div>
                    <div className="flex flex-wrap gap-1">
                      {job.matchedSkills.map((s, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {job.missingSkills.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evidence Gaps:</div>
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills.map((s, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
                  <button
                    onClick={() => handleTrackJob(job)}
                    disabled={isTracked}
                    className={`
                      flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                      ${isTracked 
                        ? 'bg-slate-100 text-emerald-700 cursor-default font-bold' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs shadow-purple-600/20'}
                    `}
                  >
                    {isTracked ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tracked</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Track in Kanban</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleAskCoPilotAboutJob(job)}
                    className="p-1.5 bg-white hover:bg-purple-50 text-purple-600 rounded-xl transition-colors border border-slate-200 hover:border-purple-200 shadow-xs"
                    title="Ask AI Co-Pilot how to position your evidence for this role"
                    aria-label="Co-Pilot Advice"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Skill Gaps Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-200">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">High-Priority Skill Gaps</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerAgentSkillGapAnalysis}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Run Agent 3 background skill gap analysis"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Agent 3 Audit</span>
                </button>
                <button 
                  onClick={() => setActiveTab('skills')}
                  className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 transition-colors"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {criticalGaps.length === 0 ? (
                <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No critical gaps detected! All mandatory baseline skills possess demonstrated evidence.</span>
                </div>
              ) : (
                criticalGaps.map((gap, i) => (
                  <div key={i} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex items-start justify-between gap-4 card-3d">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{gap.skill}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 uppercase">
                          {gap.importance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{gap.recommendedAction}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('roadmap')}
                      className="text-xs whitespace-nowrap bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                    >
                      Plan Study
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Weekly Roadmap & Next Tasks */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-200">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Active Learning Roadmap</h2>
                  <span className="text-xs text-slate-500 font-medium">Week {learningPlan?.currentWeek || 1} of {learningPlan?.totalWeeks || 8}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerAgentRoadmapUpdate}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Run Agent 4 background roadmap calibration"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Agent 4 Calibrate</span>
                </button>
                <button 
                  onClick={() => setActiveTab('roadmap')}
                  className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 transition-colors"
                >
                  Open <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.length === 0 ? (
                <div className="text-xs text-slate-500 p-4 text-center bg-slate-50 rounded-xl">
                  All weekly tasks completed! Open roadmap to generate next week milestones.
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="group bg-slate-50/70 hover:bg-purple-50/40 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-purple-600 transition-colors"
                        aria-label={`Toggle task: ${task.title}`}
                      >
                        {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-slate-800 group-hover:text-purple-900 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {task.skillAddressed} • {task.estimatedMinutes} mins
                        </div>
                      </div>
                    </div>

                    {task.resourceUrl && (
                      <a
                        href={task.resourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-600 hover:text-purple-700 border border-slate-200 bg-white px-2.5 py-1 rounded-md font-medium"
                      >
                        Guide
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended Portfolio Deliverables */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-200">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">Recommended Portfolio Deliverables</h2>
              </div>
              <button 
                onClick={() => setActiveTab('projects')}
                className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 transition-colors"
              >
                Portfolio Studio <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.slice(0, 2).map((proj) => (
                <div key={proj.id} className="bg-slate-50/70 hover:bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 card-3d">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{proj.difficulty}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">~{proj.estimatedHours} hrs</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-2">{proj.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{proj.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">{proj.skillsCovered.length} skills bridged</span>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-xs text-purple-600 hover:text-purple-700 font-bold"
                    >
                      Inspect & Submit Proof →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* ATS Resume Readiness Meter - Clean White / Lavender Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 card-3d">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-200">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">ATS Resume Health</h3>
              </div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {atsScore.overallScore}/100
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
                  <span>Keyword Alignment</span>
                  <span className="font-bold text-slate-900">{atsScore.keywordMatchScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${atsScore.keywordMatchScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
                  <span>Quantifiable Impact</span>
                  <span className="font-bold text-slate-900">{atsScore.quantifiedImpactScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${atsScore.quantifiedImpactScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
                  <span>ATS Parser Compatibility</span>
                  <span className="font-bold text-slate-900">{atsScore.structureScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${atsScore.structureScore}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Agent 1 Optimizer</span>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-xs text-purple-600 hover:text-purple-700 font-bold"
              >
                Refine Resume →
              </button>
            </div>
          </div>

          {/* Quick Mock Interview Arena Launcher */}
          <div className="bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 border border-purple-200 rounded-2xl p-5 shadow-xs space-y-3 card-3d">
            <div className="flex items-center gap-2 text-purple-700">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Mic className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 text-base">Mock Interview Arena</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test technical reasoning against 5-criteria weighted rubrics. AI scores your answer logic, not superficial speech.
            </p>
            <div className="text-xs text-slate-500 font-medium">
              Sessions Completed: <span className="text-purple-700 font-bold">{interviews.length}</span>
            </div>
            <button
              onClick={() => setActiveTab('interview')}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs shadow-purple-600/25 flex items-center justify-center gap-2"
            >
              <span>Launch Mock Interview</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Application Pipeline Overview */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="p-1 bg-purple-50 rounded-md text-purple-600">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">Application Tracker</h2>
              </div>
              <button 
                onClick={() => setActiveTab('applications')}
                className="text-xs text-purple-600 hover:text-purple-700 font-bold"
              >
                Kanban →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                <div className="text-lg font-black text-slate-900">{applications.length}</div>
                <div className="text-[10px] text-slate-500 font-medium">Total Applied</div>
              </div>
              <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-2.5">
                <div className="text-lg font-black text-purple-700">
                  {applications.filter(a => a.status === 'INTERVIEW').length}
                </div>
                <div className="text-[10px] text-purple-600 font-medium">Interviews</div>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5">
                <div className="text-lg font-black text-amber-700">
                  {applications.filter(a => a.status === 'REJECTED').length}
                </div>
                <div className="text-[10px] text-amber-600 font-medium">Diagnosed</div>
              </div>
            </div>
          </div>

          {/* Recent Multi-Agent Activity Log Stream */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-50 rounded-md text-purple-600">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">Agent Activity Stream</h2>
              </div>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono font-semibold">Live Audit</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {agentLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] truncate max-w-[140px]">{log.agent}</span>
                    <span className="text-[10px] text-purple-700 font-mono font-semibold">{log.durationMs}ms</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-tight line-clamp-2">{log.outputSummary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
