import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ToastNotification, ToastOptions } from '../types/toast';
import { 
  addToastToQueue, 
  removeToastFromQueue, 
  createSkillGapCompletedToast, 
  createRoadmapUpdatedToast,
  createEvidenceVerifiedToast
} from '../utils/toastQueue';

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (options: ToastOptions) => string | null;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  pauseToastTimer: (id: string) => void;
  resumeToastTimer: (id: string) => void;
  notifySkillGapCompleted: (roleTitle: string, gapCount: number, criticalCount: number, onNavigate?: () => void) => void;
  notifyRoadmapUpdated: (roleTitle: string, totalWeeks: number, milestoneCount: number, onNavigate?: () => void) => void;
  notifyEvidenceVerified: (skillName: string, newState: string, onNavigate?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const timersRef = useRef<Map<string, { timeoutId: any; remainingMs: number; startedAt: number }>>(new Map());

  const dismissToast = useCallback((id: string) => {
    // Clear any timer
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer.timeoutId);
      timersRef.current.delete(id);
    }
    setToasts(prev => removeToastFromQueue(prev, id));
  }, []);

  const startTimer = useCallback((id: string, duration: number) => {
    if (duration <= 0) return;

    // Clear existing if any
    const existing = timersRef.current.get(id);
    if (existing) clearTimeout(existing.timeoutId);

    const timeoutId = setTimeout(() => {
      dismissToast(id);
    }, duration);

    timersRef.current.set(id, {
      timeoutId,
      remainingMs: duration,
      startedAt: Date.now()
    });
  }, [dismissToast]);

  const pauseToastTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (!timer) return;

    clearTimeout(timer.timeoutId);
    const elapsed = Date.now() - timer.startedAt;
    const remaining = Math.max(timer.remainingMs - elapsed, 1000);
    timersRef.current.set(id, {
      ...timer,
      remainingMs: remaining
    });
  }, []);

  const resumeToastTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (!timer) return;

    const timeoutId = setTimeout(() => {
      dismissToast(id);
    }, timer.remainingMs);

    timersRef.current.set(id, {
      timeoutId,
      remainingMs: timer.remainingMs,
      startedAt: Date.now()
    });
  }, [dismissToast]);

  const showToast = useCallback((options: ToastOptions): string | null => {
    let addedId: string | null = null;
    setToasts(prev => {
      const result = addToastToQueue(prev, options);
      addedId = result.addedId;
      return result.nextQueue;
    });

    if (addedId) {
      const dur = options.duration !== undefined ? options.duration : 6000;
      if (dur > 0) {
        startTimer(addedId, dur);
      }
    }

    return addedId;
  }, [startTimer]);

  const clearAllToasts = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer.timeoutId));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const notifySkillGapCompleted = useCallback((
    roleTitle: string,
    gapCount: number,
    criticalCount: number,
    onNavigate?: () => void
  ) => {
    const options = createSkillGapCompletedToast(roleTitle, gapCount, criticalCount, onNavigate);
    showToast(options);
  }, [showToast]);

  const notifyRoadmapUpdated = useCallback((
    roleTitle: string,
    totalWeeks: number,
    milestoneCount: number,
    onNavigate?: () => void
  ) => {
    const options = createRoadmapUpdatedToast(roleTitle, totalWeeks, milestoneCount, onNavigate);
    showToast(options);
  }, [showToast]);

  const notifyEvidenceVerified = useCallback((
    skillName: string,
    newState: string,
    onNavigate?: () => void
  ) => {
    const options = createEvidenceVerifiedToast(skillName, newState, onNavigate);
    showToast(options);
  }, [showToast]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(t => clearTimeout(t.timeoutId));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        clearAllToasts,
        pauseToastTimer,
        resumeToastTimer,
        notifySkillGapCompleted,
        notifyRoadmapUpdated,
        notifyEvidenceVerified
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
