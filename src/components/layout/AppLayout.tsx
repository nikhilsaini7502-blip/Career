import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  UserCircle, 
  Briefcase, 
  Cpu, 
  Compass, 
  FolderKanban, 
  Mic, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sparkles, 
  ChevronRight, 
  Menu, 
  X,
  ShieldCheck,
  Zap,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCareerData } from '../../contexts/CareerDataContext';
import { DockedAiCoPilot } from '../chat/DockedAiCoPilot';

export type NavTab = 
  | 'dashboard'
  | 'assistant'
  | 'profile'
  | 'jobs'
  | 'skills'
  | 'roadmap'
  | 'projects'
  | 'interview'
  | 'applications'
  | 'analytics'
  | 'settings';

interface AppLayoutProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const { user, isDemoUser, authError, clearAuthError, loginGoogle, logout, enterDemoMode } = useAuth();
  const { 
    profile, 
    readinessMetrics, 
    isCoPilotOpen, 
    setIsCoPilotOpen,
    triggerAgentSkillGapAnalysis,
    triggerAgentRoadmapUpdate
  } = useCareerData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('proofpath_theme') === 'dark');
  React.useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); localStorage.setItem('proofpath_theme', darkMode ? 'dark' : 'light'); }, [darkMode]);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Career Assistant', icon: Bot, badge: 'Agent 0' },
    { id: 'profile', label: 'Career Profile', icon: UserCircle },
    { id: 'jobs', label: 'Job Intelligence', icon: Briefcase },
    { id: 'skills', label: 'Skill Intelligence', icon: Cpu, badge: `${readinessMetrics.requiredSkillsCovered}/${readinessMetrics.totalRequiredSkills}` },
    { id: 'roadmap', label: 'Learning Roadmap', icon: Compass },
    { id: 'projects', label: 'Portfolio Studio', icon: FolderKanban },
    { id: 'interview', label: 'Mock Interview Arena', icon: Mic },
    { id: 'applications', label: 'Application Tracker', icon: FileText },
    { id: 'analytics', label: 'Career Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Memory & Settings', icon: Settings },
  ];

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Header - Clean White with Subtle Border & Shadow */}
      <header className="app-header min-h-16 border-b backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-600 p-[1.5px] shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/35 transition-all">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 group-hover:scale-105 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                PROOFPATH
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-md">
                Career OS
              </span>
            </div>
          </div>
        </div>

        {/* Center Target Role Pill */}
        <div className="hidden lg:flex items-center gap-3 bg-purple-50/60 border border-purple-100 px-4 py-1.5 rounded-full text-xs shadow-xs">
          <span className="text-slate-500 font-medium">Target Role:</span>
          <span className="text-purple-700 font-bold">{profile.targetRoleTitle}</span>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Readiness:</span>
            <span className={`font-bold px-1.5 py-0.2 rounded ${readinessMetrics.overallScore > 60 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
              {readinessMetrics.overallScore}%
            </span>
          </div>
        </div>

        {/* User Auth & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={() => setDarkMode(v => !v)} className="theme-toggle p-2 rounded-xl border" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>{darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
          {/* AI Co-Pilot Persistent Drawer Toggle */}
          <button
            onClick={() => setIsCoPilotOpen(!isCoPilotOpen)}
            className={`
              hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
              ${isCoPilotOpen 
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-600/30 ring-2 ring-purple-100' 
                : 'bg-white border-slate-200 text-slate-700 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50/50 shadow-xs'}
            `}
            title="Toggle Side-by-Side AI Career Co-Pilot"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCoPilotOpen ? 'text-white' : 'text-purple-600'}`} />
            <span>AI Co-Pilot</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isCoPilotOpen ? 'bg-emerald-300' : 'bg-purple-500 animate-pulse'}`} />
          </button>

          {/* Agent Status Pill with Interactive Trigger Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAgentMenuOpen(!agentMenuOpen)}
              className="hidden sm:flex items-center gap-2 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer shadow-xs"
              title="Click to view & trigger background AI agents"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>8 Agents Live</span>
            </button>

            {agentMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-purple-100 shadow-xl p-3 z-50 card-3d space-y-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Background AI Agents</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      triggerAgentSkillGapAnalysis();
                      setAgentMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-purple-50 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-purple-900">Agent 3: Skill Gap Audit</div>
                      <div className="text-[11px] text-slate-500">Recalculate role competency vectors</div>
                    </div>
                    <Cpu className="w-4 h-4 text-purple-600" />
                  </button>

                  <button
                    onClick={() => {
                      triggerAgentRoadmapUpdate();
                      setAgentMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-purple-50 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-purple-900">Agent 4: Roadmap Update</div>
                      <div className="text-[11px] text-slate-500">Adaptive curriculum calibration</div>
                    </div>
                    <Compass className="w-4 h-4 text-purple-600" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1 text-[11px]">
                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      setAgentMenuOpen(false);
                    }}
                    className="text-purple-700 hover:text-purple-900 font-bold cursor-pointer"
                  >
                    View Agent Execution Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setIsCoPilotOpen(!isCoPilotOpen)} className="sm:hidden p-2 rounded-xl border border-slate-200 text-purple-700" aria-label="Open AI Co-Pilot"><Bot className="w-4 h-4" /></button>
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2.5 pl-1 sm:pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold overflow-hidden shadow-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : isDemoUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                Demo Workspace
              </span>
              <button
                onClick={loginGoogle}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <span className="sm:hidden">Sign In</span><span className="hidden sm:inline">Sign in with Google</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={enterDemoMode}
                className="hidden sm:block text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium"
              >
                Try Demo
              </button>
              <button
                onClick={loginGoogle}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs shadow-purple-600/20"
              >
                <span className="sm:hidden">Sign In</span><span className="hidden sm:inline">Google Sign In</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Auth Error Banner if sign-in fails */}
      {authError && (
        <div className="auth-error-banner border-b px-3 sm:px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 animate-fade-in z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{authError} You can continue using all features seamlessly in the Demo Workspace.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={enterDemoMode}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded font-semibold text-[11px] transition-colors"
            >
              Continue in Demo
            </button>
            <button
              onClick={clearAuthError}
              className="p-1 text-amber-700 hover:text-amber-900 rounded transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation - Pure White with Lavender Selection & 3D Polish */}
        <aside 
          className={`
            fixed md:static top-16 bottom-0 left-0 z-30 w-[min(18rem,88vw)] md:w-64 app-sidebar border-r p-3 flex flex-col justify-between transition-transform duration-200 shadow-xs
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="space-y-1 overflow-y-auto pr-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Career Engine
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all group font-medium
                    ${isActive 
                      ? 'bg-purple-50 text-purple-800 font-semibold border-r-3 border-purple-600 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-purple-200/70 text-purple-900' : 'bg-slate-100 text-slate-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer with Engine Info */}
          <div className="pt-3 border-t border-slate-200/80 mt-2 px-1">
            <div className="bg-gradient-to-br from-purple-50/70 via-slate-50 to-white border border-purple-100 rounded-xl p-3 text-xs space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-bold">Model Engine</span>
                <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded">High Think</span>
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Gemini 2.5 Flash & Thinking orchestrating 8 specialized career agents.
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Primary Content View Area */}
        <main className={`app-main min-w-0 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 transition-all duration-300 ${isCoPilotOpen && activeTab !== 'assistant' ? 'xl:mr-[420px]' : ''}`}>
          <div className="max-w-7xl mx-auto min-w-0">
            {children}
          </div>
        </main>

        {/* Docked AI Co-Pilot Persistent Drawer */}
        <DockedAiCoPilot
          isOpen={isCoPilotOpen && activeTab !== 'assistant'}
          onClose={() => setIsCoPilotOpen(false)}
          onExpandFullScreen={() => {
            setActiveTab('assistant');
            setIsCoPilotOpen(false);
          }}
        />
      </div>
    </div>
  );
};
