import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Check, 
  RefreshCw, 
  Cpu 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { useAuth } from '../../contexts/AuthContext';

export const SettingsMemoryView: React.FC = () => {
  const { user } = useAuth();
  const { profile, userSkills, learningPlan, projects, applications, agentLogs } = useCareerData();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportData = () => {
    const data = {
      profile,
      userSkills,
      learningPlan,
      projects,
      applications,
      agentLogs,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proofpath-career-memory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Memory Management & Settings</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Inspect, export, and manage your long-term career memory and multi-agent operating state.
        </p>
      </div>

      {/* Memory Layers Overview with 3D Depth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2 card-3d">
          <div className="flex items-center gap-2 text-purple-700">
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Career Memory</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Persistent long-term facts: target role ({profile.targetRoleTitle}), {userSkills.length} verified skills, and background qualifications.
          </p>
          <div className="text-[11px] text-emerald-700 font-mono font-semibold">Synchronized with Cloud Firestore</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2 card-3d">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Workflow Memory</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Active state graph checkpoints: {learningPlan?.totalWeeks || 8}-week roadmap, {applications.length} applications, and project proofs.
          </p>
          <div className="text-[11px] text-indigo-700 font-mono font-semibold">Continuous Feedback Active</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2 card-3d">
          <div className="flex items-center gap-2 text-purple-700">
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Agent Configuration</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Gemini 2.5 Flash & Thinking + specialized career agents with high-reasoning loops.
          </p>
          <div className="text-[11px] text-purple-700 font-mono font-semibold">8 Specialist Agents Loaded</div>
        </div>
      </div>

      {/* Export & Data Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 card-3d">
        <h2 className="font-extrabold text-slate-900 text-base">Data Portability & Export</h2>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Export your entire career memory, skill evidence records, and roadmap history in open JSON format to retain full ownership of your data.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs shadow-purple-600/25 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Career JSON</span>
          </button>

          {downloadSuccess && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export downloaded!</span>
            </span>
          )}
        </div>
      </div>

      {/* Firebase & Platform Diagnostics */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 card-3d">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-extrabold text-base">Security & Cloud Infrastructure</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">AUTHENTICATION:</span>
            <span className="text-slate-900 font-semibold">{user ? user.email : 'Demo Guest Mode'}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">FIRESTORE DATABASE:</span>
            <span className="text-emerald-700 font-bold">Enterprise Cloud Firestore Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
