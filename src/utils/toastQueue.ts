/**
 * PROOFPATH — Pure Logic for Toast Queue Management & Agent Notification Factory
 */

import { ToastNotification, ToastOptions } from '../types/toast';

export const MAX_TOASTS = 4;
export const DEFAULT_DURATION = 8500; // 8.5 seconds

/**
 * Generates a unique toast ID.
 */
export function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Checks if a new toast is a duplicate of a recently added toast.
 */
export function isDuplicateToast(
  queue: ToastNotification[],
  newToast: ToastOptions,
  dedupeWindowMs = 2500
): boolean {
  const now = Date.now();
  return queue.some(
    existing =>
      existing.title === newToast.title &&
      existing.message === newToast.message &&
      now - existing.createdAt < dedupeWindowMs
  );
}

/**
 * Appends a toast to the queue with deduplication and capacity capping.
 */
export function addToastToQueue(
  queue: ToastNotification[],
  options: ToastOptions,
  maxToasts = MAX_TOASTS
): { nextQueue: ToastNotification[]; addedId: string | null } {
  if (isDuplicateToast(queue, options)) {
    return { nextQueue: queue, addedId: null };
  }

  const id = options.id || generateToastId();
  const newToast: ToastNotification = {
    id,
    title: options.title,
    message: options.message,
    type: options.type || 'info',
    agentName: options.agentName,
    agentBadge: options.agentBadge || (options.agentName ? options.agentName.split(':')[0].trim() : undefined),
    duration: options.duration !== undefined ? options.duration : DEFAULT_DURATION,
    action: options.action,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    createdAt: Date.now()
  };

  // Keep latest toasts up to maxToasts
  const updated = [newToast, ...queue].slice(0, maxToasts);
  return { nextQueue: updated, addedId: id };
}

/**
 * Removes a toast by id.
 */
export function removeToastFromQueue(
  queue: ToastNotification[],
  id: string
): ToastNotification[] {
  return queue.filter(item => item.id !== id);
}

/**
 * Helper to construct an Agent 3 Skill Gap Analysis notification.
 */
export function createSkillGapCompletedToast(
  roleTitle: string,
  gapCount: number,
  criticalCount: number,
  onNavigate?: () => void
): ToastOptions {
  return {
    type: 'agent',
    agentName: 'Agent 3: Skill Intelligence',
    agentBadge: 'Agent 3',
    title: 'Skill Gap Analysis Complete',
    message: `Analyzed role benchmarks for "${roleTitle}". Identified ${gapCount} skill gaps (${criticalCount} critical priority).`,
    duration: 9000,
    action: onNavigate ? { label: 'View Skill Gaps', onClick: onNavigate } : undefined
  };
}

/**
 * Helper to construct an Agent 4 Learning Roadmap notification.
 */
export function createRoadmapUpdatedToast(
  roleTitle: string,
  totalWeeks: number,
  milestoneCount: number,
  onNavigate?: () => void
): ToastOptions {
  return {
    type: 'agent',
    agentName: 'Agent 4: Adaptive Planner',
    agentBadge: 'Agent 4',
    title: 'Learning Roadmap Generated',
    message: `Synthesized a personalized ${totalWeeks}-week curriculum for "${roleTitle}" with ${milestoneCount} actionable milestones.`,
    duration: 9000,
    action: onNavigate ? { label: 'View Roadmap', onClick: onNavigate } : undefined
  };
}

/**
 * Helper to construct an Agent 3 Evidence Verification notification.
 */
export function createEvidenceVerifiedToast(
  skillName: string,
  newState: string,
  onNavigate?: () => void
): ToastOptions {
  return {
    type: 'agent',
    agentName: 'Agent 3: Evidence Auditor',
    agentBadge: 'Agent 3',
    title: 'Skill Evidence Verified',
    message: `Evidence submitted for "${skillName}" verified. State promoted to "${newState}".`,
    duration: 5500,
    action: onNavigate ? { label: 'Inspect Skills', onClick: onNavigate } : undefined
  };
}
