import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  X, 
  ArrowRight,
  Bot
} from 'lucide-react';
import { ToastNotification } from '../../types/toast';

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  onDismiss,
  onMouseEnter,
  onMouseLeave
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter(toast.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave(toast.id);
  };

  // Icon & color styling according to Design 3 & Design 5
  const getIconAndStyle = () => {
    switch (toast.type) {
      case 'agent':
        return {
          icon: <Sparkles className="w-4 h-4 text-white" />,
          iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xs shadow-purple-500/30',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
          progressBg: 'from-purple-600 via-indigo-600 to-violet-600'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border border-emerald-200',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          progressBg: 'from-emerald-500 to-teal-600'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          iconBg: 'bg-amber-50 border border-amber-200',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          progressBg: 'from-amber-500 to-orange-600'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-4 h-4 text-purple-600" />,
          iconBg: 'bg-purple-50 border border-purple-200',
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
          progressBg: 'from-purple-500 to-indigo-500'
        };
    }
  };

  const style = getIconAndStyle();
  const durationSec = (toast.duration || 6000) / 1000;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full sm:w-[400px] bg-white rounded-2xl border border-purple-100/80 shadow-xl shadow-purple-950/10 overflow-hidden card-3d transition-all duration-200 hover:shadow-2xl hover:shadow-purple-900/15"
      role="alert"
      aria-live="polite"
    >
      <div className="p-4 sm:p-4.5 flex items-start gap-3.5">
        {/* Leading Avatar / Icon */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} transition-transform group-hover:scale-105`}>
          {style.icon}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Header Row: Agent Badge & Time */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              {toast.agentName ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.badgeBg} truncate`}>
                  <Bot className="w-3 h-3 shrink-0" />
                  <span className="truncate">{toast.agentName}</span>
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style.badgeBg}`}>
                  {toast.type}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {toast.timestamp}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
            {toast.title}
          </h4>

          {/* Description / Message */}
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {toast.message}
          </p>

          {/* Action Link / Button */}
          {toast.action && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer group/btn"
              >
                <span>{toast.action.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
              <span className="text-[10px] text-slate-400 font-medium">Click to navigate</span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-Dismiss Shimmering Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="h-1 w-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${style.progressBg} transition-all duration-100`}
            style={{
              animation: `shrinkToastProgress ${durationSec}s linear forwards`,
              animationPlayState: isHovered ? 'paused' : 'running'
            }}
          />
        </div>
      )}
    </div>
  );
};
