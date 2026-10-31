/**
 * PROOFPATH — Career & Multi-Agent Domain Types
 */

export type EvidenceState = 
  | 'CLAIMED' 
  | 'LEARNING' 
  | 'DEMONSTRATED' 
  | 'APPLIED' 
  | 'INTERVIEW_DEMONSTRATED';

export type CareerFamily = 
  | 'Software Engineering'
  | 'Artificial Intelligence & ML'
  | 'Data & Analytics'
  | 'Cloud & DevOps'
  | 'Cybersecurity'
  | 'Software Testing'
  | 'Product & Design'
  | 'IT & Infrastructure';

export interface TechRole {
  id: string;
  title: string;
  family: CareerFamily;
  description: string;
  demandLevel: 'Very High' | 'High' | 'Moderate';
  averageSalaryRange: string;
  requiredSkills: string[];
  preferredSkills: string[];
  certifications?: string[];
  sampleJobDescription?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  targetRoleId: string;
  targetRoleTitle: string;
  targetFamily: CareerFamily;
  experienceLevel: 'Student' | 'Entry Level (0-2y)' | 'Mid Level (2-5y)' | 'Senior (5y+)' | 'Career Switcher';
  dailyHours: number;
  readinessScore: number; // 0 - 100
  bio?: string;
  education?: string;
  resumeSummary?: string;
  updatedAt: string;
}

export interface SkillGapItem {
  skill: string;
  category: 'Core Language' | 'Framework' | 'Database' | 'Cloud & Tooling' | 'Architecture' | 'Soft Skill';
  importance: 'Critical' | 'High' | 'Medium' | 'Nice to Have';
  currentEvidence: EvidenceState;
  recommendedAction: string;
  whyItMatters: string;
  estimatedHoursToDemonstrate: number;
}

export interface SkillEvidenceRecord {
  id: string;
  userId: string;
  skillName: string;
  evidenceType: 'ASSESSMENT' | 'PROJECT' | 'INTERVIEW' | 'COURSE' | 'GITHUB' | 'SELF_REPORT';
  referenceTitle: string;
  summary: string;
  score?: number; // 0 - 100
  verified: boolean;
  artifactUrl?: string;
  createdAt: string;
}

export interface LearningTask {
  id: string;
  weekNumber: number;
  dayNumber: number;
  title: string;
  description: string;
  skillAddressed: string;
  estimatedMinutes: number;
  completed: boolean;
  resourceTitle?: string;
  resourceUrl?: string;
}

export interface LearningPlan {
  id: string;
  userId: string;
  roleTitle: string;
  totalWeeks: number;
  currentWeek: number;
  status: 'active' | 'completed' | 'paused' | 'needs_revision';
  weeklyHours: number;
  tasks: LearningTask[];
  revisionProposal?: {
    reason: string;
    proposedChanges: string;
    suggestedByAgent: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  skillsCovered: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours: number;
  status: 'recommended' | 'in_progress' | 'submitted' | 'reviewed';
  deliverables: string[];
  repoUrl?: string;
  liveDemoUrl?: string;
  evaluationNotes?: string;
  verifiedEvidence: boolean;
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'conceptual' | 'problem_solving' | 'behavioral' | 'system_design';
  difficulty: 'Junior' | 'Mid' | 'Senior';
  expectedKeyPoints: string[];
}

export interface InterviewEvaluation {
  overallScore: number; // 0 - 100
  technicalScore: number; // weight 30%
  conceptualScore: number; // weight 25%
  problemSolvingScore: number; // weight 20%
  communicationScore: number; // weight 15%
  practicalScore: number; // weight 10%
  strengths: string[];
  weaknesses: string[];
  suggestedAnswer: string;
  improvementTip: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  targetRole: string;
  mode: 'technical' | 'behavioral' | 'system_design' | 'comprehensive';
  question: InterviewQuestion;
  userAnswer?: string;
  evaluation?: InterviewEvaluation;
  status: 'pending_answer' | 'evaluated';
  timestamp: string;
}

export type ApplicationStatus = 'WISHLIST' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  location: string;
  jobType: 'Remote' | 'Hybrid' | 'On-site';
  salaryRange?: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  jobPostingUrl?: string;
  rejectionFeedback?: string;
  rejectionDiagnosis?: {
    likelyCause: string;
    gapIdentified: string;
    recommendedPivot: string;
  };
}

export interface AgentExecutionLog {
  id: string;
  agent: string;
  role: string;
  objective: string;
  status: 'running' | 'completed' | 'failed' | 'needs_approval';
  modelUsed: string;
  durationMs: number;
  timestamp: string;
  outputSummary: string;
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  salary: string;
  matchScore: number; // 0 - 100%
  matchedSkills: string[];
  missingSkills: string[];
  postedTime: string;
  applyUrl?: string;
}

export interface ResumeAtsScore {
  overallScore: number;
  keywordMatchScore: number;
  quantifiedImpactScore: number;
  structureScore: number;
  strengths: string[];
  improvements: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agentTrace?: {
    orchestratorRoute: string;
    specialistsInvoked: string[];
    thinkingDurationMs?: number;
    actionRequired?: boolean;
    actionType?: string;
  };
}
