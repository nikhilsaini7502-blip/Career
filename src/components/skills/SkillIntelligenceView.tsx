import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  ArrowUpRight, 
  Layers, 
  X,
  FileCheck 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { useToast } from '../../contexts/ToastContext';
import { EvidenceState, SkillGapItem } from '../../types/career';

export const SkillIntelligenceView: React.FC = () => {
  const { 
    profile, 
    userSkills, 
    skillGaps, 
    evidenceRecords, 
    readinessMetrics, 
    updateSkillEvidence,
    addAgentLogs 
  } = useCareerData();
  const { notifySkillGapCompleted } = useToast();

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Evidence submission modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [evidenceStage, setEvidenceStage] = useState<EvidenceState>('DEMONSTRATED');
  const [artifactTitle, setArtifactTitle] = useState('');
  const [artifactUrl, setArtifactUrl] = useState('');
  const [proofSummary, setProofSummary] = useState('');

  const handleOpenModal = (skillName?: string) => {
    setSelectedSkill(skillName || skillGaps[0]?.skill || 'Core Technology');
    setEvidenceStage('DEMONSTRATED');
    setArtifactTitle('');
    setArtifactUrl('');
    setProofSummary('');
    setModalOpen(true);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;

    updateSkillEvidence(selectedSkill, evidenceStage, artifactTitle || `${selectedSkill} Verification`);
    setModalOpen(false);
  };

  const handleRunDeepAudit = async () => {
    setAuditLoading(true);
    try {
      const response = await fetch('/api/skills/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRoleId: profile.targetRoleId,
          userSkills
        })
      });

      if (!response.ok) throw new Error('Skill audit failed');
      const data = await response.json();
      setAuditResult(data);
      const critCount = data.criticalGaps?.length ?? skillGaps.filter(g => g.importance === 'Critical').length;
      notifySkillGapCompleted(
        profile.targetRoleTitle,
        data.totalGaps || skillGaps.length,
        critCount
      );
    } catch (err) {
      console.error('Audit failed:', err);
      // Fallback notification using computed gaps
      notifySkillGapCompleted(
        profile.targetRoleTitle,
        skillGaps.length,
        skillGaps.filter(g => g.importance === 'Critical').length
      );
    } finally {
      setAuditLoading(false);
    }
  };

  const stageColors: Record<EvidenceState, { bg: string; text: string; border: string }> = {
    CLAIMED: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    LEARNING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    DEMONSTRATED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    APPLIED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    INTERVIEW_DEMONSTRATED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Skill Intelligence Engine</h1>
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
              Signature Innovation
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            ProofPath does not accept unverified self-claims. Track your capabilities across the 5 verifiable evidence stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs shadow-purple-600/25 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Evidence</span>
          </button>

          <button
            onClick={handleRunDeepAudit}
            disabled={auditLoading}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className={`w-4 h-4 text-purple-600 ${auditLoading ? 'animate-spin' : ''}`} />
            <span>{auditLoading ? 'Reasoning (Argon)...' : 'Agent 3 Deep Audit'}</span>
          </button>
        </div>
      </div>

      {/* The 5-Stage Evidence Continuum Visual Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 card-3d">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base">The Skill Evidence Continuum</h2>
          <span className="text-xs text-slate-500 font-medium">Progression from self-claim to interview-proven mastery</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { stage: 'CLAIMED' as const, title: '1. Claimed', desc: 'Self-reported on resume or chat', factor: '25% Weight' },
            { stage: 'LEARNING' as const, title: '2. Learning', desc: 'In active roadmap curriculum', factor: '45% Weight' },
            { stage: 'DEMONSTRATED' as const, title: '3. Demonstrated', desc: 'Passed technical diagnostic', factor: '70% Weight' },
            { stage: 'APPLIED' as const, title: '4. Applied', desc: 'Built in inspected project deliverable', factor: '90% Weight' },
            { stage: 'INTERVIEW_DEMONSTRATED' as const, title: '5. Interview Proven', desc: 'Proven under live technical pressure', factor: '100% Weight' }
          ].map((item, idx) => {
            const conf = stageColors[item.stage];
            return (
              <div 
                key={idx}
                className={`${conf.bg} border ${conf.border} rounded-2xl p-3.5 space-y-1.5 transition-all card-3d`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${conf.text}`}>{item.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{item.factor}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight font-medium">{item.desc}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-200/80">
                  <span className="text-slate-500 font-medium">Skills Active:</span>
                  <span className={`font-black ${conf.text}`}>{readinessMetrics.evidenceBreakdown[item.stage]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Audit Results Banner (if ran) */}
      {auditResult && (
        <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-xs space-y-3 card-3d">
          <div className="flex items-center gap-2 text-purple-700">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Agent 3 Deep Reasoning Synthesis (gemini-4-argon)</h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {auditResult.executiveSummary}
          </p>
          <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
            <span className="text-purple-700 font-bold">Recommended Proof Strategy: </span>
            {auditResult.recommendedProofStrategy}
          </div>
        </div>
      )}

      {/* Comprehensive Skill Gap Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 card-3d">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Target Role Skill Gap Matrix</h2>
            <p className="text-xs text-slate-500 font-medium">Comparison of candidate evidence vs {profile.targetRoleTitle} requirements</p>
          </div>
          <span className="text-xs text-purple-700 font-mono font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
            {skillGaps.length} Actionable Gaps
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">Skill Requirement</th>
                <th className="py-3 px-4 font-bold">Importance</th>
                <th className="py-3 px-4 font-bold">Current Evidence</th>
                <th className="py-3 px-4 font-bold">Why It Matters</th>
                <th className="py-3 px-4 font-bold">Recommended Action</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skillGaps.map((gap, i) => {
                const conf = stageColors[gap.currentEvidence];
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {gap.skill}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${gap.importance === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'}`}>
                        {gap.importance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${conf.bg} ${conf.text} border ${conf.border}`}>
                        {gap.currentEvidence}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed font-medium">
                      {gap.whyItMatters}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed font-medium">
                      {gap.recommendedAction}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenModal(gap.skill)}
                        className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-xl transition-colors whitespace-nowrap font-semibold shadow-xs"
                      >
                        Submit Proof
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submitted Verified Evidence Records */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4 card-3d">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600 border border-purple-200">
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-base">Verified Evidence Artifacts</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">{evidenceRecords.length} Artifacts on Record</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidenceRecords.map((ev) => (
            <div key={ev.id} className="bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 card-3d">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700">{ev.skillName}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Score: {ev.score}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{ev.referenceTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{ev.summary}</p>
              {ev.artifactUrl && (
                <div className="pt-2 border-t border-slate-200">
                  <a
                    href={ev.artifactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                  >
                    <span>View Artifact / Repo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base">Submit Skill Proof Artifact</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Skill</label>
                <input
                  type="text"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Evidence Stage</label>
                <select
                  value={evidenceStage}
                  onChange={(e: any) => setEvidenceStage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-semibold"
                >
                  <option value="DEMONSTRATED">DEMONSTRATED (Passed Assessment / Coding Lab)</option>
                  <option value="APPLIED">APPLIED (Implemented in Practical Project)</option>
                  <option value="INTERVIEW_DEMONSTRATED">INTERVIEW DEMONSTRATED (Verified under Interview)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Deliverable / Artifact Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Worker Queue with Redis"
                  value={artifactTitle}
                  onChange={(e) => setArtifactTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Artifact URL (GitHub, Demo, Certificate)</label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/project-repo"
                  value={artifactUrl}
                  onChange={(e) => setArtifactUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Proof Summary & Implementation Notes</label>
                <textarea
                  rows={3}
                  placeholder="Explain how you used this skill, architectural patterns applied, and measurable results..."
                  value={proofSummary}
                  onChange={(e) => setProofSummary(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs shadow-purple-600/25 transition-colors"
                >
                  Verify & Upgrade Skill Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
