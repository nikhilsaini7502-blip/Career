import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  X,
  TrendingUp 
} from 'lucide-react';
import { useCareerData } from '../../contexts/CareerDataContext';
import { ApplicationStatus, JobApplication } from '../../types/career';

export const ApplicationTrackerView: React.FC = () => {
  const { 
    profile, 
    applications, 
    skillGaps, 
    updateApplicationStatus, 
    addApplication 
  } = useCareerData();

  const [modalOpen, setModalOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);

  // New application form states
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState(profile.targetRoleTitle);
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState<JobApplication['jobType']>('Remote');
  const [salaryRange, setSalaryRange] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');

  const columns: Array<{ status: ApplicationStatus; title: string; color: string; badgeBg: string }> = [
    { status: 'WISHLIST', title: 'Wishlist', color: 'text-slate-600', badgeBg: 'bg-slate-100 text-slate-700' },
    { status: 'APPLIED', title: 'Applied', color: 'text-purple-700', badgeBg: 'bg-purple-100 text-purple-800' },
    { status: 'SCREENING', title: 'Recruiter Screen', color: 'text-amber-700', badgeBg: 'bg-amber-100 text-amber-800' },
    { status: 'INTERVIEW', title: 'Technical Interview', color: 'text-indigo-700', badgeBg: 'bg-indigo-100 text-indigo-800' },
    { status: 'OFFER', title: 'Offer Received', color: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-800' },
    { status: 'REJECTED', title: 'Rejected', color: 'text-rose-700', badgeBg: 'bg-rose-100 text-rose-800' }
  ];

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) return;

    addApplication({
      company,
      position,
      location,
      jobType,
      salaryRange,
      status,
      appliedDate: new Date().toISOString().split('T')[0],
      notes
    });

    setCompany('');
    setNotes('');
    setModalOpen(false);
  };

  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const response = await fetch('/api/applications/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applications,
          skillGaps,
          targetRole: profile.targetRoleTitle
        })
      });

      if (!response.ok) throw new Error('Audit failed');
      const data = await response.json();
      setAuditReport(data);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Job Application Tracker</h1>
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
              Agent 7 Intelligence
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track job applications, detect rejection patterns, and diagnose evidence bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs shadow-purple-600/25 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>

          <button
            onClick={handleRunAudit}
            disabled={auditLoading}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Sparkles className={`w-4 h-4 text-purple-600 ${auditLoading ? 'animate-spin' : ''}`} />
            <span>{auditLoading ? 'Auditing Funnel...' : 'Agent 7 Funnel Audit'}</span>
          </button>
        </div>
      </div>

      {/* Funnel Audit Diagnosis Report (if generated) */}
      {auditReport && (
        <div className="bg-gradient-to-r from-purple-50 via-white to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fade-in card-3d">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="font-extrabold text-slate-900 text-base">Agent 7 Diagnostic Funnel Audit</h2>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">Response Rate: <strong className="text-slate-900 font-bold">{auditReport.responseRatePercent}%</strong></span>
              <span className="text-slate-500 font-medium">Interview Rate: <strong className="text-emerald-700 font-bold">{auditReport.interviewConversionPercent}%</strong></span>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {auditReport.diagnosisSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Identified Funnel Patterns:</span>
              <ul className="space-y-1 text-slate-600 font-medium">
                {auditReport.identifiedPatterns.map((p: string, idx: number) => (
                  <li key={idx}>• {p}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-purple-700 block mb-1">Strategic Recommendations:</span>
              <ul className="space-y-1 text-slate-700 font-medium">
                {auditReport.strategicRecommendations.map((r: string, idx: number) => (
                  <li key={idx}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colApps = applications.filter(a => a.status === col.status);

          return (
            <div 
              key={col.status}
              className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col min-w-[200px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className={`text-xs font-bold ${col.color}`}>{col.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                  {colApps.length}
                </span>
              </div>

              {/* Applications List */}
              <div className="space-y-3 flex-1">
                {colApps.length === 0 ? (
                  <div className="text-[11px] text-slate-400 text-center py-6 font-medium">
                    Empty stage
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-white hover:border-purple-300 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-xs card-3d"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{app.company}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">{app.appliedDate}</span>
                        </div>
                        <div className="text-xs text-purple-700 font-semibold truncate mt-0.5">{app.position}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">{app.location} • {app.jobType}</div>
                      </div>

                      {app.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200 line-clamp-2 font-medium">
                          {app.notes}
                        </p>
                      )}

                      {/* Rejection Diagnosis Badge if rejected */}
                      {app.rejectionDiagnosis && (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-800 space-y-1">
                          <strong className="block text-rose-700 font-bold">AI Diagnostic:</strong>
                          <span>{app.rejectionDiagnosis.likelyCause}</span>
                        </div>
                      )}

                      {/* Quick Move Selector */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <select
                          value={app.status}
                          onChange={(e: any) => updateApplicationStatus(app.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-[10px] text-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 font-semibold"
                        >
                          <option value="WISHLIST">Wishlist</option>
                          <option value="APPLIED">Applied</option>
                          <option value="SCREENING">Screen</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="OFFER">Offer</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base">Track New Application</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Datadog, Stripe"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Position Title *</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Work Type</label>
                  <select
                    value={jobType}
                    onChange={(e: any) => setJobType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-semibold"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Initial Stage</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-semibold"
                  >
                    <option value="WISHLIST">Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screen</option>
                    <option value="INTERVIEW">Interview</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Job Link</label>
                <textarea
                  rows={2}
                  placeholder="Referral name, job posting link, or specific tailored notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500 font-medium"
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
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
