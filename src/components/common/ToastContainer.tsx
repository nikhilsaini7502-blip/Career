import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { ToastItem } from './ToastItem';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, pauseToastTimer, resumeToastTimer } = useToast();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col-reverse gap-3 max-w-[calc(100vw-2rem)] sm:max-w-[420px] pointer-events-none"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto transform transition-all duration-300 ease-out">
          <ToastItem
            toast={toast}
            onDismiss={dismissToast}
            onMouseEnter={pauseToastTimer}
            onMouseLeave={resumeToastTimer}
          />
        </div>
      ))}
    </aside>
  );
};
