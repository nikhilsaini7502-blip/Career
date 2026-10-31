import React, { useState } from 'react';
import { 
  UserCircle, 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  Search, 
  Plus, 
  Briefcase, 
  Clock, 
  Award, 
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  Wand2,
  Copy
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { CAREER_FAMILIES, TECH_ROLES_TAXONOMY, findRoleById } from '../../data/rolesTaxonomy';
import { CareerFamily, UserProfile } from '../../types/career';
import { calculateResumeAtsScore } from '../../utils/atsEngine';

const SAMPLE_TECH_RESUME = `Alex Chen - Full Stack Software Engineer
alex.chen@example.com | San Francisco, CA | github.com/alexchen | linkedin.com/in/alexchen

PROFESSIONAL EXPERIENCE:
Frontend Engineer - CloudScale Solutions (2024 - Present)
- Engineered responsive user interfaces using React, Next.js, and TypeScript, improving Core Web Vitals by 34%.
- Designed and integrated GraphQL and REST APIs with Node.js and Express, supporting 45,000 daily active users.
- Built reusable Tailwind CSS component library adopted across 6 cross-functional engineering teams.
- Implemented automated CI/CD pipeline using GitHub Actions and Docker, reducing release cycle time by 40%.

Software Engineering Intern - DataFlow Systems (2023 - 2024)
- Designed relational database schemas in PostgreSQL, optimizing slow indexing queries by 65%.
- Authored 85+ unit and integration test suites using Jest and Vitest, achieving 92% code coverage.
- Collaborated in Agile sprints, reviewing 40+ pull requests and maintaining strict zero-downtime deployments.

EDUCATION & CERTIFICATIONS:
- B.S. in Computer Science - University of California (2020 - 2024)
- AWS Certified Cloud Practitioner

TECHNICAL SKILLS:
- Languages & Frameworks: JavaScript, TypeScript, React, Next.js, Node.js, Express, HTML5, CSS/Tailwind
- Databases & Tools: PostgreSQL, Redis, Docker, Git, GitHub Actions, Jest, REST APIs
`;

export const CareerProfileView: React.FC = () => {
  const { profile, setProfile, userSkills, updateSkillEvidence, addAgentLogs } = useCareerData();

  const [selectedFamily, setSelectedFamily] = useState<CareerFamily>(profile.targetFamily);
  const [searchQuery, setSearchQuery] = useState('');
  const [resumeText, setResumeText] = useState(profile.resumeSummary || '');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  // Form states for profile
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel);
  const [dailyHours, setDailyHours] = useState(profile.dailyHours);
  const [bio, setBio] = useState(profile.bio || '');

  const activeRole = findRoleById(profile.targetRoleId) || TECH_ROLES_TAXONOMY[0];

  // Dynamic ATS Score computation
  const atsMetrics = calculateResumeAtsScore(
    resumeText || profile.resumeSummary || profile.bio || '',
    userSkills,
    activeRole
  );

  const filteredRoles = TECH_ROLES_TAXONOMY.filter(r => {
    const matchesFamily = selectedFamily ? r.family === selectedFamily : true;
    const matchesSearch = searchQuery 
      ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesFamily && matchesSearch;
  });

  const handleSelectRole = (roleId: string) => {
    const role = findRoleById(roleId);
    if (!role) return;
    setProfile(prev => ({
      ...prev,
      targetRoleId: role.id,
      targetRoleTitle: role.title,
      targetFamily: role.family,
      updatedAt: new Date().toISOString()
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      displayName,
      experienceLevel,
      dailyHours: Number(dailyHours),
      bio,
      updatedAt: new Date().toISOString()
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLoadSampleResume = () => {
    setResumeText(SAMPLE_TECH_RESUME);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 3000);
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setIsParsingResume(true);
    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resumeText })
      });

      if (!response.ok) throw new Error('Resume parsing service failed');
      const data = await response.json();

      if (data.detectedSkills && Array.isArray(data.detectedSkills)) {
        // Hydrate extracted skills into Evidence Engine
        data.detectedSkills.forEach((s: any) => {
          updateSkillEvidence(s.skillName, s.evidenceLevel || 'DEMONSTRATED', 'Extracted from Resume');
        });
      }

      if (data.experienceLevel) {
        setExperienceLevel(data.experienceLevel);
      }
      if (data.summary) {
        setProfile(prev => ({
          ...prev,
          resumeSummary: data.summary,
          experienceLevel: data.experienceLevel || prev.experienceLevel
        }));
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to parse resume:', err);
    } finally {
      setIsParsingResume(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Career Profile & ATS Studio</h1>
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
              Agent 1 Powered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure target technology roles, available study hours, and run live ATS resume optimization checks.
          </p>
        </div>
        {saveSuccess && (
          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl flex items-center gap-2 animate-fade-in font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile and career goals updated successfully!</span>
          </div>
        )}
      </div>

      {/* Target Technology Role Selection Hub */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 card-3d">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Target Role Selection Hub</h2>
              <p className="text-xs text-slate-500 font-medium">Choose from 8 comprehensive technology families or search across 40+ industry roles</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles or skills..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Family Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CAREER_FAMILIES.map((family) => (
            <button
              key={family}
              onClick={() => setSelectedFamily(family)}
              className={`
                px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all
                ${selectedFamily === family 
                  ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20' 
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'}
              `}
            >
              {family}
            </button>
          ))}
        </div>

        {/* Role Cards Grid with 3D Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {filteredRoles.map((role) => {
            const isSelected = profile.targetRoleId === role.id;
            return (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`
                  p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-3 card-3d
                  ${isSelected 
                    ? 'bg-purple-50/70 border-purple-500 shadow-sm shadow-purple-500/10 ring-2 ring-purple-200' 
                    : 'bg-white border-slate-200/90 hover:border-purple-200 hover:bg-slate-50/50'}
                `}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-purple-700 font-bold">{role.family}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono font-medium">
                      {role.demandLevel} Demand
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{role.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{role.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono font-medium">{role.averageSalaryRange}</span>
                  {isSelected ? (
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Target Role
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 group-hover:text-purple-600 font-medium">Select →</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Live ATS Resume Health Scorecard & Resume Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resume Text Studio (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between card-3d">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-200">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-base">Resume Extraction & ATS Studio</h2>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleResume}
                className="text-xs text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors font-semibold shadow-xs"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{copiedSample ? 'Sample Loaded!' : 'Load Sample Resume'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Paste your resume or work history. Agent 1 parses structured skills and calculates live ATS compliance for <span className="text-purple-700 font-bold">{activeRole.title}</span>.
            </p>

            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume content here (experience, skills, metrics, education)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 font-mono leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleParseResume}
              disabled={!resumeText.trim() || isParsingResume}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs shadow-purple-600/25 flex items-center justify-center gap-2"
            >
              {isParsingResume ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Agent 1 Extracting Structured Skills...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Extract Skills & Sync Evidence Engine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live ATS Scorecard Widget (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 card-3d">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-200">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-slate-900 text-base">ATS Resume Health</h2>
            </div>
            <span className="text-[10px] bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-mono font-bold">
              Live Screening
            </span>
          </div>

          {/* Primary Gauge */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">ATS Screen Score</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {atsMetrics.overallScore}
                <span className="text-sm font-normal text-slate-400"> / 100</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Target: {activeRole.title}
              </span>
            </div>

            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base border shadow-xs
              ${atsMetrics.overallScore >= 80 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : atsMetrics.overallScore >= 60 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'}
            `}>
              {atsMetrics.overallScore}%
            </div>
          </div>

          {/* Sub-Metrics Breakdown */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-500">Keyword Density</span>
                <span className="text-slate-900 font-bold">{atsMetrics.keywordMatchScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${atsMetrics.keywordMatchScore}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-500">Quantified Metrics & Scale</span>
                <span className="text-slate-900 font-bold">{atsMetrics.quantifiedImpactScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${atsMetrics.quantifiedImpactScore}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-500">ATS Section Structure</span>
                <span className="text-slate-900 font-bold">{atsMetrics.structureScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${atsMetrics.structureScore}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Strengths & AI Suggestions */}
          <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
            {atsMetrics.strengths.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Strengths Detected:
                </span>
                <ul className="space-y-1 text-slate-600 text-[11px] font-medium">
                  {atsMetrics.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {atsMetrics.improvements.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> High-Impact Optimizations:
                </span>
                <ul className="space-y-1 text-slate-600 text-[11px] font-medium">
                  {atsMetrics.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-600">⚡</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Background Attributes Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 card-3d">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-200">
            <UserCircle className="w-5 h-5" />
          </div>
          <h2 className="font-extrabold text-slate-900 text-base">Candidate Background Details</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Candidate Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e: any) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-semibold"
              >
                <option value="Student">Student</option>
                <option value="Entry Level (0-2y)">Entry Level (0-2y)</option>
                <option value="Mid Level (2-5y)">Mid Level (2-5y)</option>
                <option value="Senior (5y+)">Senior (5y+)</option>
                <option value="Career Switcher">Career Switcher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Daily Study Hours</label>
              <input
                type="number"
                min="1"
                max="12"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Professional Bio & Career Goals</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Briefly describe your current role or what you aim to achieve..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs shadow-purple-600/25"
          >
            Save Candidate Details
          </button>
        </form>
      </div>
    </div>
  );
};
