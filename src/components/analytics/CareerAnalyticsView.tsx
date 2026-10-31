import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { EvidenceState } from '../../types/career';

export const CareerAnalyticsView: React.FC = () => {
  const { profile, readinessMetrics, agentLogs, applications, userSkills, evidenceRecords } = useCareerData();

  const stages: Array<{ state: EvidenceState; label: string; color: string; bg: string }> = [
    { state: 'CLAIMED', label: 'Claimed', color: 'text-slate-600', bg: 'bg-slate-400' },
    { state: 'LEARNING', label: 'Learning', color: 'text-amber-700', bg: 'bg-amber-400' },
    { state: 'DEMONSTRATED', label: 'Demonstrated', color: 'text-purple-700', bg: 'bg-purple-500' },
    { state: 'APPLIED', label: 'Applied (Projects)', color: 'text-indigo-700', bg: 'bg-indigo-500' },
    { state: 'INTERVIEW_DEMONSTRATED', label: 'Interview Proven', color: 'text-emerald-700', bg: 'bg-emerald-500' }
  ];

  const totalTrackedSkills = Math.max(1, userSkills.length);

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Career Intelligence & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Objective measurements of your career readiness, evidence distribution, and multi-agent execution history.
        </p>
      </div>

      {/* KPI Cards Grid with 3D Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1 card-3d">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overall Readiness</div>
          <div className="text-3xl font-black text-slate-900">{readinessMetrics.overallScore}%</div>
          <div className="text-xs text-purple-700 font-semibold">Weighted multi-stage evidence</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1 card-3d">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Required Skills Covered</div>
          <div className="text-3xl font-black text-emerald-700">
            {readinessMetrics.requiredSkillsCovered} / {readinessMetrics.totalRequiredSkills}
          </div>
          <div className="text-xs text-slate-500 font-medium">Baseline role requirements</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1 card-3d">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verified Artifacts</div>
          <div className="text-3xl font-black text-indigo-700">{evidenceRecords.length}</div>
          <div className="text-xs text-slate-500 font-medium">Project & assessment proofs</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-1 card-3d">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Agent Executions</div>
          <div className="text-3xl font-black text-purple-700">{agentLogs.length}</div>
          <div className="text-xs text-slate-500 font-medium">Autonomous reasoning tasks</div>
        </div>
      </div>

      {/* Evidence Maturity Distribution Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 card-3d">
        <h2 className="font-extrabold text-slate-900 text-base">Evidence Maturity Distribution</h2>

        {/* Multi-segmented progress bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
          {stages.map((st) => {
            const count = readinessMetrics.evidenceBreakdown[st.state] || 0;
            const pct = (count / totalTrackedSkills) * 100;
            if (pct <= 0) return null;
            return (
              <div 
                key={st.state}
                className={`${st.bg} h-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${st.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {stages.map((st) => (
            <div key={st.state} className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${st.bg}`} />
                <span className="text-slate-600 font-bold">{st.label}</span>
              </div>
              <div className="text-lg font-black text-slate-900 pl-4">
                {readinessMetrics.evidenceBreakdown[st.state] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Agent Audit Log Trail */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 card-3d">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-200">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-base">Multi-Agent Execution Audit Log</h2>
          </div>
          <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-mono font-bold">{agentLogs.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 font-bold">Agent</th>
                <th className="py-2.5 px-3 font-bold">Role</th>
                <th className="py-2.5 px-3 font-bold">Objective</th>
                <th className="py-2.5 px-3 font-bold">Model</th>
                <th className="py-2.5 px-3 font-bold">Latency</th>
                <th className="py-2.5 px-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {agentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-slate-900 font-bold whitespace-nowrap">
                    {log.agent}
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-sans font-medium">
                    {log.role}
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs truncate font-sans font-medium">
                    {log.objective}
                  </td>
                  <td className="py-3 px-3 text-purple-700 text-[11px] whitespace-nowrap font-bold">
                    {log.modelUsed}
                  </td>
                  <td className="py-3 px-3 text-emerald-700 text-[11px] font-bold">
                    {log.durationMs}ms
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-sans font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
