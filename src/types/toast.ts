/**
 * PROOFPATH — Toast Notification System Types
 */

export type ToastType = 'agent' | 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  agentName?: string;
  agentBadge?: string;
  duration?: number; // duration in ms (0 = persistent until dismissed)
  action?: ToastAction;
  timestamp: string;
  createdAt: number;
}

export interface ToastOptions {
  id?: string;
  title: string;
  message: string;
  type?: ToastType;
  agentName?: string;
  agentBadge?: string;
  duration?: number;
  action?: ToastAction;
}
