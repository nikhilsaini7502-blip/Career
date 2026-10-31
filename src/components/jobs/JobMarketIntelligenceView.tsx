import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Layers,
  Building2,
  BookmarkPlus,
  Check,
  Bot,
  Filter,
  ArrowUpRight,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { TECH_ROLES_TAXONOMY, findRoleById } from '../../data/rolesTaxonomy';
import { generateJobMatchesForRole } from '../../utils/jobMatchEngine';
import { JobMatch } from '../../types/career';

export const JobMarketIntelligenceView: React.FC = () => {
  const { profile, userSkills, addApplication, addChatMessage, setIsCoPilotOpen } = useCareerData();

  const [selectedRole, setSelectedRole] = useState(profile.targetRoleId);
  const [activeTab, setActiveTab] = useState<'radar' | 'benchmark' | 'analyzer'>('radar');
  const [customJdText, setCustomJdText] = useState('');
  const [analyzingJd, setAnalyzingJd] = useState(false);
  const [customJdAnalysis, setCustomJdAnalysis] = useState<any>(null);

  // Filters for Live Opportunity Radar
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [workTypeFilter, setWorkTypeFilter] = useState<'All' | 'Remote' | 'Hybrid' | 'On-site'>('All');
  const [trackedJobs, setTrackedJobs] = useState<Record<string, boolean>>({});

  const activeRole = findRoleById(selectedRole) || TECH_ROLES_TAXONOMY[0];
  const allJobMatches = generateJobMatchesForRole(activeRole, userSkills);

  const filteredJobMatches = allJobMatches.filter(job => {
    const matchesScore = job.matchScore >= minMatchFilter;
    const matchesType = workTypeFilter === 'All' ? true : job.type === workTypeFilter;
    return matchesScore && matchesType;
  });

  const handleTrackJob = (job: JobMatch) => {
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

    setTrackedJobs(prev => ({ ...prev, [job.id]: true }));
  };

  const handleConsultCoPilot = (job: JobMatch) => {
    addChatMessage({
      id: `ask-job-${Date.now()}`,
      sender: 'user',
      content: `I'm interested in applying for ${job.title} at ${job.company} (${job.location}). My compatibility match is ${job.matchScore}%. How should I highlight my verified skills (${job.matchedSkills.join(', ')}) and address my gap areas (${job.missingSkills.join(', ')})?`,
      timestamp: new Date().toISOString()
    });
    setIsCoPilotOpen(true);
  };

  const handleAnalyzeCustomJd = async () => {
    if (!customJdText.trim()) return;
    setAnalyzingJd(true);
    try {
      const response = await fetch('/api/jobs/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleIdOrTitle: activeRole.title,
          jobDescription: customJdText
        })
      });

      if (!response.ok) throw new Error('Job research failed');
      const data = await response.json();
      setCustomJdAnalysis(data);
    } catch (err) {
      console.error('Job research error:', err);
    } finally {
      setAnalyzingJd(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Job Market & Opportunity Radar</h1>
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
              Agent 2 Grounded
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Grounded hiring signals, live employer compatibility ratings, and verified skill overlap matrices.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 p-1.5 rounded-xl self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'radar' 
                ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Live Opportunities ({allJobMatches.length})
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'benchmark' 
                ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Industry Benchmark
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analyzer' 
                ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Analyze Custom JD
          </button>
        </div>
      </div>

      {/* Role Selector Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-3d">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Role Benchmark</label>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCustomJdAnalysis(null);
            }}
            className="bg-slate-50 border border-slate-200 text-sm text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 font-bold"
          >
            {TECH_ROLES_TAXONOMY.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.family})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Salary Range:</span>
            <span className="font-bold text-slate-800 font-mono">{activeRole.averageSalaryRange}</span>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200 px-3 py-2 rounded-xl">
            <span className="text-emerald-700 block text-[10px] uppercase font-bold tracking-wider">Market Demand:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              {activeRole.demandLevel}
            </span>
          </div>
          <div className="bg-purple-50/60 border border-purple-200 px-3 py-2 rounded-xl">
            <span className="text-purple-700 block text-[10px] uppercase font-bold tracking-wider">Candidate Match:</span>
            <span className="font-bold text-purple-700">
              {allJobMatches[0]?.matchScore || 50}% Avg
            </span>
          </div>
        </div>
      </div>

      {/* TAB 1: Live Opportunity Radar */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                Match Score:
              </span>
              {[
                { label: 'All Matches', value: 0 },
                { label: '🔥 >60% Match', value: 60 },
                { label: '⚡ >75% Match', value: 75 },
                { label: '🎯 >85% Match', value: 85 }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMinMatchFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    minMatchFilter === opt.value
                      ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-2">Work Type:</span>
              {(['All', 'Remote', 'Hybrid', 'On-site'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setWorkTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    workTypeFilter === type
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/20'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards Grid with 3D Depth */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobMatches.map((job) => {
              const isTracked = trackedJobs[job.id];
              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200/90 hover:border-purple-300 rounded-2xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between space-y-4 group card-3d"
                >
                  {/* Top Bar */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs shadow-purple-600/20">
                          {job.company.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {job.company}
                          </h2>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="text-[11px] text-purple-700 font-semibold">{job.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right flex-shrink-0">
                        <div className={`
                          text-xs font-black px-2.5 py-1 rounded-full border flex items-center gap-1 whitespace-nowrap
                          ${job.matchScore >= 80 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : job.matchScore >= 65 
                              ? 'bg-purple-50 border-purple-200 text-purple-700' 
                              : 'bg-amber-50 border-amber-200 text-amber-700'}
                        `}>
                          <Sparkles className="w-3 h-3 flex-shrink-0" />
                          <span>{job.matchScore}% Match</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{job.postedTime}</span>
                      </div>
                    </div>

                    {/* Role Title and Salary */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                      <p className="text-xs font-mono text-emerald-700 font-bold mt-0.5">{job.salary}</p>
                    </div>

                    {/* Matched Evidence Skills */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                        <span>Matched Skills:</span>
                        <span className="text-emerald-700 text-[10px] font-bold">{job.matchedSkills.length} Verified</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {job.matchedSkills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="text-[11px] bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1"
                          >
                            <Check className="w-2.5 h-2.5" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skill Gaps to Bridge */}
                    {job.missingSkills.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                          <span>Bridging Gaps:</span>
                          <span className="text-amber-700 text-[10px] font-bold">{job.missingSkills.length} Needed</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.missingSkills.map((gap, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-md font-semibold"
                            >
                              ⚡ {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleTrackJob(job)}
                        disabled={isTracked}
                        className={`
                          py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all
                          ${isTracked 
                            ? 'bg-slate-100 text-emerald-700 font-bold' 
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
                            <span>Track Kanban</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleConsultCoPilot(job)}
                        className="py-2 px-3 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center gap-1.5 transition-all"
                        title="Get tailored application strategy from Agent 0"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Co-Pilot Advice</span>
                      </button>
                    </div>

                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-1.5 text-[11px] text-slate-500 hover:text-purple-700 transition-colors font-medium"
                    >
                      View Greenhouse Posting →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredJobMatches.length === 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No jobs match this filter threshold</h3>
              <p className="text-xs text-slate-500">
                Adjust the minimum match percentage or work type filter to view more opportunities.
              </p>
              <button
                onClick={() => { setMinMatchFilter(0); setWorkTypeFilter('All'); }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Industry Benchmark Requirements */}
      {activeTab === 'benchmark' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 card-3d">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-200">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-slate-900 text-lg">{activeRole.title} Market Benchmark</h2>
            </div>
            <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded font-mono font-medium">
              Greenhouse / Labor Data
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {activeRole.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            {/* Mandatory Core Skills */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Mandatory Core Skills:
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeRole.requiredSkills.map((s, idx) => (
                  <span key={idx} className="text-xs bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1.5 rounded-xl font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Differentiators */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Preferred Differentiators:
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeRole.preferredSkills.map((s, idx) => (
                  <span key={idx} className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-xl font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {activeRole.certifications && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recognized Certifications:</h3>
              <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                {activeRole.certifications.map((c, idx) => (
                  <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-semibold">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Custom Job Description Analyzer */}
      {activeTab === 'analyzer' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 card-3d">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-base">Analyze Specific Job Posting (Agent 2)</h2>
              </div>
              <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                Custom JD Extractor
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste a live job description from LinkedIn, Indeed, or Greenhouse. Agent 2 extracts the exact required vs preferred skill breakdown.
            </p>

            <textarea
              rows={8}
              value={customJdText}
              onChange={(e) => setCustomJdText(e.target.value)}
              placeholder="Paste full job posting description here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 font-mono leading-relaxed"
            />

            <button
              onClick={handleAnalyzeCustomJd}
              disabled={!customJdText.trim() || analyzingJd}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs shadow-purple-600/25 flex items-center justify-center gap-2"
            >
              {analyzingJd ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Agent 2 Extracting Requirements...</span>
                </>
              ) : (
                <span>Analyze Job Description & Extract Requirements</span>
              )}
            </button>
          </div>

          {/* Custom JD Analysis Results */}
          {customJdAnalysis && (
            <div className="bg-white border border-purple-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 animate-fade-in card-3d">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-slate-900 text-base">Extracted Requirements: {customJdAnalysis.roleTitle}</h2>
                <span className="text-xs text-purple-700 font-mono font-semibold">{customJdAnalysis.sourceType}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block">Mandatory Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {customJdAnalysis.requiredSkills.map((s: string, idx: number) => (
                      <span key={idx} className="bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block">Preferred Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {customJdAnalysis.preferredSkills.map((s: string, idx: number) => (
                      <span key={idx} className="bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-lg font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
