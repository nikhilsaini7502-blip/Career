import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { 
  UserProfile, 
  SkillGapItem, 
  SkillEvidenceRecord, 
  LearningPlan, 
  PortfolioProject, 
  InterviewSession, 
  JobApplication, 
  AgentExecutionLog, 
  ChatMessage,
  EvidenceState
} from '../types/career';
import { TECH_ROLES_TAXONOMY, findRoleById } from '../data/rolesTaxonomy';
import { calculateCareerReadiness, computeSkillGaps } from '../utils/evidenceEngine';
import { useToast } from './ToastContext';

interface CareerDataContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  userSkills: Array<{ skillName: string; category?: string; evidenceState: EvidenceState }>;
  skillGaps: SkillGapItem[];
  evidenceRecords: SkillEvidenceRecord[];
  learningPlan: LearningPlan | null;
  projects: PortfolioProject[];
  interviews: InterviewSession[];
  applications: JobApplication[];
  agentLogs: AgentExecutionLog[];
  messages: ChatMessage[];
  readinessMetrics: ReturnType<typeof calculateCareerReadiness>;
  isCoPilotOpen: boolean;
  setIsCoPilotOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateSkillEvidence: (skillName: string, newState: EvidenceState, artifactTitle?: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  updateApplicationStatus: (appId: string, status: JobApplication['status']) => void;
  addApplication: (app: Omit<JobApplication, 'id' | 'userId'>) => void;
  addInterviewSession: (session: InterviewSession) => void;
  addProjectProof: (projectId: string, repoUrl: string, demoUrl?: string) => void;
  setLearningPlan: (plan: LearningPlan) => void;
  addChatMessage: (msg: ChatMessage) => void;
  addAgentLogs: (logs: AgentExecutionLog[]) => void;
  changeTargetRole: (roleId: string) => void;
  adaptCurrentRoadmap: (proposal: any) => void;
  navigateToTab?: (tab: string) => void;
  setNavigateToTab?: (fn: (tab: string) => void) => void;
  triggerAgentSkillGapAnalysis: () => void;
  triggerAgentRoadmapUpdate: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  uid: 'candidate-01',
  displayName: 'Alex Chen',
  email: 'alex.chen@proofpath.ai',
  targetRoleId: 'full-stack-developer',
  targetRoleTitle: 'Full Stack Developer',
  targetFamily: 'Software Engineering',
  experienceLevel: 'Entry Level (0-2y)',
  dailyHours: 2,
  readinessScore: 42,
  bio: 'Recent CS grad building full-stack applications with React & Node.js, targeting enterprise engineering roles.',
  education: 'B.S. in Computer Science',
  resumeSummary: 'Experienced with React, JavaScript, basic Node.js, Git. Seeking to master PostgreSQL, Docker, and CI/CD pipelines.',
  updatedAt: new Date().toISOString()
};

const INITIAL_SKILLS: Array<{ skillName: string; category?: string; evidenceState: EvidenceState }> = [
  { skillName: 'React / Next.js', category: 'Framework', evidenceState: 'APPLIED' },
  { skillName: 'JavaScript / TypeScript', category: 'Core Language', evidenceState: 'DEMONSTRATED' },
  { skillName: 'CSS / Tailwind CSS', category: 'Styling', evidenceState: 'DEMONSTRATED' },
  { skillName: 'Git & GitHub', category: 'Tooling', evidenceState: 'APPLIED' },
  { skillName: 'Node.js / Express', category: 'Backend', evidenceState: 'LEARNING' },
  { skillName: 'SQL (PostgreSQL)', category: 'Database', evidenceState: 'CLAIMED' },
  { skillName: 'Docker & Containers', category: 'Cloud', evidenceState: 'CLAIMED' }
];

const INITIAL_EVIDENCE: SkillEvidenceRecord[] = [
  {
    id: 'ev-1',
    userId: 'candidate-01',
    skillName: 'React / Next.js',
    evidenceType: 'PROJECT',
    referenceTitle: 'Collaborative Markdown Note App',
    summary: 'Built single-page React app with optimistic state updates and responsive Tailwind UI.',
    score: 88,
    verified: true,
    artifactUrl: 'https://github.com/example/react-markdown-notes',
    createdAt: '2026-10-15T12:00:00Z'
  },
  {
    id: 'ev-2',
    userId: 'candidate-01',
    skillName: 'JavaScript / TypeScript',
    evidenceType: 'ASSESSMENT',
    referenceTitle: 'TypeScript Generics & Types Assessment',
    summary: 'Completed 20-question technical diagnostic covering conditional types and utility interfaces.',
    score: 82,
    verified: true,
    createdAt: '2026-10-20T14:30:00Z'
  }
];

const INITIAL_PLAN: LearningPlan = {
  id: 'plan-default',
  userId: 'candidate-01',
  roleTitle: 'Full Stack Developer',
  totalWeeks: 8,
  currentWeek: 2,
  status: 'active',
  weeklyHours: 14,
  tasks: [
    {
      id: 'task-1',
      weekNumber: 1,
      dayNumber: 1,
      title: 'PostgreSQL Relational Schema Design',
      description: 'Study 3NF normalization, index strategies (B-Tree), and write schema migration scripts.',
      skillAddressed: 'SQL (PostgreSQL)',
      estimatedMinutes: 90,
      completed: true,
      resourceTitle: 'PostgreSQL Official Docs: Schema Design',
      resourceUrl: 'https://www.postgresql.org/docs/'
    },
    {
      id: 'task-2',
      weekNumber: 1,
      dayNumber: 3,
      title: 'Node.js Connection Pooling & ORM Benchmark',
      description: 'Implement pg pool client, handle transactions, and compare raw queries vs query builder.',
      skillAddressed: 'Node.js / Express',
      estimatedMinutes: 120,
      completed: true,
      resourceTitle: 'Node.js Best Practices: Database Architecture',
      resourceUrl: 'https://github.com/goldbergyoni/nodebestpractices'
    },
    {
      id: 'task-3',
      weekNumber: 2,
      dayNumber: 2,
      title: 'Docker Containerization of Full-Stack App',
      description: 'Write multi-stage Dockerfile for React frontend and Node backend with docker-compose.',
      skillAddressed: 'Docker & Containers',
      estimatedMinutes: 120,
      completed: false,
      resourceTitle: 'Docker Multi-Stage Build Guide',
      resourceUrl: 'https://docs.docker.com/build/building/multi-stage/'
    },
    {
      id: 'task-4',
      weekNumber: 2,
      dayNumber: 5,
      title: 'Milestone: Build REST API with Auth & Tests',
      description: 'Build JWT/Session-authenticated REST API with 80%+ test coverage using Vitest.',
      skillAddressed: 'Node.js / Express',
      estimatedMinutes: 180,
      completed: false,
      resourceTitle: 'REST API Security Checklist',
      resourceUrl: 'https://github.com/shieldfy/API-Security-Checklist'
    }
  ],
  createdAt: '2026-10-18T09:00:00Z',
  updatedAt: '2026-10-25T11:00:00Z'
};

const INITIAL_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    userId: 'candidate-01',
    title: 'High-Throughput E-Commerce Inventory API',
    description: 'A production-ready microservice with Redis caching, PostgreSQL transactions, and Docker Compose.',
    skillsCovered: ['Node.js / Express', 'SQL (PostgreSQL)', 'Docker & Containers'],
    difficulty: 'Intermediate',
    estimatedHours: 25,
    status: 'in_progress',
    deliverables: [
      'Multi-container Docker Compose setup',
      'Transaction-safe inventory decrement logic',
      'Benchmark results under load with k6'
    ],
    verifiedEvidence: false,
    createdAt: '2026-10-22T10:00:00Z'
  },
  {
    id: 'proj-2',
    userId: 'candidate-01',
    title: 'Real-Time Operational Analytics Dashboard',
    description: 'Full-stack application rendering streaming telemetry via WebSockets and Recharts.',
    skillsCovered: ['React / TypeScript', 'Node.js / Express', 'API Integration'],
    difficulty: 'Advanced',
    estimatedHours: 35,
    status: 'recommended',
    deliverables: [
      'WebSocket event stream server',
      'Responsive dark HUD with 60fps render loops',
      'Live Cloud Run deployment link'
    ],
    verifiedEvidence: false,
    createdAt: '2026-10-24T15:00:00Z'
  }
];

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    userId: 'candidate-01',
    company: 'Stripe',
    position: 'Full Stack Engineer',
    location: 'Remote, US',
    jobType: 'Remote',
    salaryRange: '$120,000 - $155,000',
    status: 'APPLIED',
    appliedDate: '2026-10-20',
    notes: 'Submitted customized resume highlighting React and API integration.'
  },
  {
    id: 'app-2',
    userId: 'candidate-01',
    company: 'Vercel',
    position: 'Frontend Systems Engineer',
    location: 'San Francisco, CA',
    jobType: 'Hybrid',
    salaryRange: '$130,000 - $160,000',
    status: 'INTERVIEW',
    appliedDate: '2026-10-14',
    notes: 'Passed technical take-home. Preparing for system design round.'
  },
  {
    id: 'app-3',
    userId: 'candidate-01',
    company: 'Datadog',
    position: 'Software Engineer - Platform',
    location: 'New York, NY',
    jobType: 'On-site',
    salaryRange: '$125,000 - $150,000',
    status: 'REJECTED',
    appliedDate: '2026-10-08',
    notes: 'Received feedback noting preference for candidates with direct production Docker/K8s experience.',
    rejectionFeedback: 'Candidate demonstrated great frontend fluency, but role requires deeper container orchestration background.',
    rejectionDiagnosis: {
      likelyCause: 'Resume lacked verified evidence for Docker and container networking.',
      gapIdentified: 'Docker & Containers',
      recommendedPivot: 'Complete Project 1 (Inventory API with Docker Compose) and elevate Docker skill to APPLIED.'
    }
  }
];

const INITIAL_LOGS: AgentExecutionLog[] = [
  {
    id: 'log-seed-1',
    agent: 'Agent 0: Career Orchestrator',
    role: 'Central Workflow Controller',
    objective: 'Initial session initialization & state audit',
    status: 'completed',
    modelUsed: 'gemini-3.1-flash-lite',
    durationMs: 140,
    timestamp: '2026-10-31T03:00:00Z',
    outputSummary: 'Profile synced with Full Stack Developer taxonomy benchmarks.'
  },
  {
    id: 'log-seed-2',
    agent: 'Agent 3: Skill Intelligence Agent',
    role: 'Evidence & Gap Auditor',
    objective: 'Compute evidence vectors vs market expectations',
    status: 'completed',
    modelUsed: 'gemini-4-argon (ThinkingLevel.HIGH)',
    durationMs: 820,
    timestamp: '2026-10-31T03:01:00Z',
    outputSummary: 'Identified 2 critical gaps: SQL (PostgreSQL) and Docker containerization.'
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    sender: 'assistant',
    content: `👋 **Welcome to PROOFPATH.** I am your **Career Orchestrator (Agent 0)**.\n\nI coordinate 8 specialist AI agents to evaluate your capabilities, bridge real employer skill gaps with verified evidence, and continuously adapt your career strategy.\n\nYour target role is currently set to **Full Stack Developer**. You can upload your resume, dictating via Wispr Flow, or explore your **Skill Intelligence** matrix. How can we accelerate your journey today?`,
    timestamp: new Date().toISOString(),
    agentTrace: {
      orchestratorRoute: 'initial_onboarding',
      specialistsInvoked: ['Agent 0: Career Orchestrator', 'Agent 3: Skill Intelligence Agent']
    }
  }
];

const CareerDataContext = createContext<CareerDataContextType | null>(null);

export const CareerDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { notifySkillGapCompleted, notifyRoadmapUpdated, notifyEvidenceVerified, showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [userSkills, setUserSkills] = useState(INITIAL_SKILLS);
  const [evidenceRecords, setEvidenceRecords] = useState<SkillEvidenceRecord[]>(INITIAL_EVIDENCE);
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(INITIAL_PLAN);
  const [projects, setProjects] = useState<PortfolioProject[]>(INITIAL_PROJECTS);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);
  const [agentLogs, setAgentLogs] = useState<AgentExecutionLog[]>(INITIAL_LOGS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const navCallbackRef = useRef<((tab: string) => void) | null>(null);

  const navigateToTab = (tab: string) => {
    if (navCallbackRef.current) {
      navCallbackRef.current(tab);
    }
  };

  const setNavigateToTab = (fn: (tab: string) => void) => {
    navCallbackRef.current = fn;
  };

  // Derive target role and recalculate readiness & gaps reactively
  const targetRole = findRoleById(profile.targetRoleId) || TECH_ROLES_TAXONOMY[0];
  const readinessMetrics = calculateCareerReadiness(userSkills, targetRole);
  const skillGaps = computeSkillGaps(userSkills, targetRole);

  // Sync readiness score in profile when evidence changes
  useEffect(() => {
    if (profile.readinessScore !== readinessMetrics.overallScore) {
      setProfile(prev => ({ ...prev, readinessScore: readinessMetrics.overallScore }));
    }
  }, [readinessMetrics.overallScore]);

  // Update Skill Evidence State
  const updateSkillEvidence = (skillName: string, newState: EvidenceState, artifactTitle?: string) => {
    setUserSkills(prev => {
      const idx = prev.findIndex(s => s.skillName.toLowerCase() === skillName.toLowerCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], evidenceState: newState };
        return copy;
      } else {
        return [...prev, { skillName, evidenceState: newState }];
      }
    });

    if (artifactTitle) {
      const newEv: SkillEvidenceRecord = {
        id: `ev-${Date.now()}`,
        userId: user?.id || profile.uid,
        skillName,
        evidenceType: newState === 'APPLIED' ? 'PROJECT' : 'ASSESSMENT',
        referenceTitle: artifactTitle,
        summary: `Evidence upgraded to ${newState} via user proof submission.`,
        score: newState === 'APPLIED' ? 92 : 85,
        verified: true,
        createdAt: new Date().toISOString()
      };
      setEvidenceRecords(prev => [newEv, ...prev]);

      // Inform user via Agent 3 toast notification
      notifyEvidenceVerified(skillName, newState, () => navigateToTab('skills'));
    }
  };

  // Toggle Learning Task Checkbox
  const toggleTaskCompletion = (taskId: string) => {
    if (!learningPlan) return;
    setLearningPlan(prev => {
      if (!prev) return null;
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          // If task completed, upgrade skill from LEARNING to DEMONSTRATED if currently at lower state
          if (nextState) {
            updateSkillEvidence(t.skillAddressed, 'DEMONSTRATED', `Completed Task: ${t.title}`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks, updatedAt: new Date().toISOString() };
    });
  };

  // Update Application Kanban Status
  const updateApplicationStatus = (appId: string, status: JobApplication['status']) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
  };

  const addApplication = (app: Omit<JobApplication, 'id' | 'userId'>) => {
    const newApp: JobApplication = {
      ...app,
      id: `app-${Date.now()}`,
      userId: user?.id || profile.uid
    };
    setApplications(prev => [newApp, ...prev]);
  };

  const addInterviewSession = (session: InterviewSession) => {
    setInterviews(prev => [session, ...prev]);
    // If interview passed with high score, elevate skill to INTERVIEW_DEMONSTRATED
    if (session.evaluation && session.evaluation.overallScore >= 75) {
      updateSkillEvidence(
        session.question.category === 'technical' ? 'JavaScript / TypeScript' : 'System Design',
        'INTERVIEW_DEMONSTRATED',
        `Passed Mock Interview (${session.evaluation.overallScore}%)`
      );
    }
  };

  const addProjectProof = (projectId: string, repoUrl: string, demoUrl?: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        // Upgrade all skills in this project to APPLIED!
        p.skillsCovered.forEach(skill => {
          updateSkillEvidence(skill, 'APPLIED', `Verified in Project: ${p.title}`);
        });
        return {
          ...p,
          status: 'submitted',
          repoUrl,
          liveDemoUrl: demoUrl,
          verifiedEvidence: true
        };
      }
      return p;
    }));
  };

  const addChatMessage = (msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  };

  const addAgentLogs = (newLogs: AgentExecutionLog[]) => {
    setAgentLogs(prev => [...newLogs, ...prev]);
  };

  const changeTargetRole = (roleId: string) => {
    const role = findRoleById(roleId);
    if (!role) return;
    setProfile(prev => ({
      ...prev,
      targetRoleId: role.id,
      targetRoleTitle: role.title,
      targetFamily: role.family,
      updatedAt: new Date().toISOString()
    }));

    // Trigger Agent 3 Skill Gap Analysis notification
    const newGaps = computeSkillGaps(userSkills, role);
    const criticalCount = newGaps.filter(g => g.importance === 'Critical').length;
    notifySkillGapCompleted(
      role.title,
      newGaps.length,
      criticalCount,
      () => navigateToTab('skills')
    );
  };

  const triggerAgentSkillGapAnalysis = () => {
    const role = findRoleById(profile.targetRoleId) || TECH_ROLES_TAXONOMY[0];
    const newGaps = computeSkillGaps(userSkills, role);
    const criticalCount = newGaps.filter(g => g.importance === 'Critical').length;
    
    // Add execution log
    const log: AgentExecutionLog = {
      id: `log-${Date.now()}`,
      agent: 'Agent 3: Skill Intelligence Agent',
      role: 'Evidence & Gap Auditor',
      objective: `Background audit of skill vectors for ${role.title}`,
      status: 'completed',
      modelUsed: 'gemini-2.5-flash',
      durationMs: 380,
      timestamp: new Date().toISOString(),
      outputSummary: `Evaluated ${role.requiredSkills.length} core competencies. Identified ${newGaps.length} gaps (${criticalCount} critical).`
    };
    setAgentLogs(prev => [log, ...prev]);

    notifySkillGapCompleted(
      role.title,
      newGaps.length,
      criticalCount,
      () => navigateToTab('skills')
    );
  };

  const triggerAgentRoadmapUpdate = () => {
    if (!learningPlan) return;
    const pending = learningPlan.tasks.filter(t => !t.completed).length;
    
    const log: AgentExecutionLog = {
      id: `log-${Date.now()}`,
      agent: 'Agent 4: Adaptive Planner',
      role: 'Curriculum & Milestone Generator',
      objective: `Real-time roadmap adaptive calibration for ${profile.targetRoleTitle}`,
      status: 'completed',
      modelUsed: 'gemini-2.5-flash',
      durationMs: 420,
      timestamp: new Date().toISOString(),
      outputSummary: `Calibrated ${learningPlan.totalWeeks}-week progression. ${pending} milestones queued for target role.`
    };
    setAgentLogs(prev => [log, ...prev]);

    notifyRoadmapUpdated(
      profile.targetRoleTitle,
      learningPlan.totalWeeks,
      learningPlan.tasks.length,
      () => navigateToTab('roadmap')
    );
  };

  const adaptCurrentRoadmap = (proposal: any) => {
    if (!learningPlan) return;
    setLearningPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        revisionProposal: {
          reason: proposal.rationale || 'Progress Agent feedback loop triggered',
          proposedChanges: proposal.proposedChanges || 'Restructured advanced project deliverables',
          suggestedByAgent: 'Agent 8: Progress and Adaptation Agent'
        },
        status: 'needs_revision',
        updatedAt: new Date().toISOString()
      };
    });

    showToast({
      type: 'agent',
      agentName: 'Agent 8: Adaptation Agent',
      agentBadge: 'Agent 8',
      title: 'Roadmap Adaptation Complete',
      message: proposal.rationale || 'Milestones dynamically restructured based on your velocity.',
      duration: 6500,
      action: {
        label: 'View Roadmap',
        onClick: () => navigateToTab('roadmap')
      }
    });
  };

  return (
    <CareerDataContext.Provider
      value={{
        profile,
        setProfile,
        userSkills,
        skillGaps,
        evidenceRecords,
        learningPlan,
        projects,
        interviews,
        applications,
        agentLogs,
        messages,
        readinessMetrics,
        isCoPilotOpen,
        setIsCoPilotOpen,
        updateSkillEvidence,
        toggleTaskCompletion,
        updateApplicationStatus,
        addApplication,
        addInterviewSession,
        addProjectProof,
        setLearningPlan,
        addChatMessage,
        addAgentLogs,
        changeTargetRole,
        adaptCurrentRoadmap,
        navigateToTab,
        setNavigateToTab,
        triggerAgentSkillGapAnalysis,
        triggerAgentRoadmapUpdate
      }}
    >
      {children}
    </CareerDataContext.Provider>
  );
};

export const useCareerData = () => {
  const context = useContext(CareerDataContext);
  if (!context) {
    throw new Error('useCareerData must be used within a CareerDataProvider');
  }
  return context;
};
