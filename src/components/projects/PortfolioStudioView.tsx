import React, { useState } from 'react';
import { 
  FolderKanban, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  Check, 
  Layers, 
  Award, 
  X 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { PortfolioProject } from '../../types/career';

export const PortfolioStudioView: React.FC = () => {
  const { profile, projects, skillGaps, addProjectProof } = useCareerData();

  const [generating, setGenerating] = useState(false);
  const [activeModalProject, setActiveModalProject] = useState<PortfolioProject | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const handleOpenSubmitModal = (proj: PortfolioProject) => {
    setActiveModalProject(proj);
    setRepoUrl(proj.repoUrl || '');
    setDemoUrl(proj.liveDemoUrl || '');
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProject || !repoUrl) return;

    addProjectProof(activeModalProject.id, repoUrl, demoUrl);
    setActiveModalProject(null);
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Portfolio Project Studio</h1>
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
              Agent 5 Guided
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Turn theoretical study into demonstrable evidence. Submitting verified repositories elevates your skill states to APPLIED.
          </p>
        </div>

        <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-xs">
          <Award className="w-4 h-4 text-purple-600" />
          <span>Evidence Multiplier: 90% Readiness Weight for APPLIED Projects</span>
        </div>
      </div>

      {/* Projects Grid with 3D Depth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const isSubmitted = proj.status === 'submitted' || proj.verifiedEvidence;

          return (
            <div 
              key={proj.id}
              className={`
                bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all card-3d
                ${isSubmitted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/90 hover:border-purple-300'}
              `}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">{proj.difficulty}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono font-medium">~{proj.estimatedHours} hours</span>
                  </div>

                  {isSubmitted ? (
                    <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Evidence Verified (APPLIED)
                    </span>
                  ) : (
                    <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                      Recommended
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">{proj.title}</h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{proj.description}</p>
                </div>

                {/* Bridged Skills Badges */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Skills Bridged:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.skillsCovered.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Inspection Deliverables:</div>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {proj.deliverables.map((del, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                {isSubmitted && proj.repoUrl ? (
                  <div className="flex items-center gap-3">
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Inspect Repository</span>
                    </a>
                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-medium">Status: In development</div>
                )}

                <button
                  onClick={() => handleOpenSubmitModal(proj)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs shadow-purple-600/20"
                >
                  {isSubmitted ? 'Update Repository Proof' : 'Submit GitHub Proof →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Proof Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Submit Deliverable Proof</h3>
                <p className="text-xs text-slate-500 font-medium">{activeModalProject.title}</p>
              </div>
              <button onClick={() => setActiveModalProject(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">GitHub Repository Link *</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://github.com/your-username/repo-name"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Live Demo / Cloud Deployment URL (Optional)</label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://my-project-production.run.app"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-700 font-medium">
                Submitting this project proof will automatically elevate:
                <span className="font-bold text-slate-900 block mt-1">
                  {activeModalProject.skillsCovered.join(', ')} → APPLIED Evidence Stage
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalProject(null)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Verify & Upgrade Skills to APPLIED
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
