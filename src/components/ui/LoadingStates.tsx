import React from 'react';
import { LoadingSpinner } from './SkeletonLoader';

// Voice Recording Loading State
export const VoiceRecordingState: React.FC<{ 
  isActive: boolean;
  message?: string;
  className?: string;
}> = ({ isActive, message = 'Höre zu...', className = '' }) => {
  if (!isActive) return null;

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 ${className}`}>
      <div className="glass rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl animate-scale-in">
        <div className="relative">
          <LoadingSpinner size="md" className="text-red-500" />
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
        </div>
        <span className="text-slate-700 dark:text-slate-300 font-medium">{message}</span>
        <div className="flex gap-1">
          <div className="w-1 h-4 bg-red-500 rounded-full voice-wave"></div>
          <div className="w-1 h-4 bg-red-500 rounded-full voice-wave voice-wave-delay-1"></div>
          <div className="w-1 h-4 bg-red-500 rounded-full voice-wave voice-wave-delay-2"></div>
          <div className="w-1 h-4 bg-red-500 rounded-full voice-wave voice-wave-delay-3"></div>
        </div>
      </div>
    </div>
  );
};

// AI Thinking State
export const AIThinkingState: React.FC<{ 
  isVisible: boolean;
  message?: string;
}> = ({ isVisible, message = 'KI denkt nach...' }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-3 mb-4 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <LoadingSpinner size="sm" className="text-white" />
      </div>
      <div className="glass rounded-2xl px-4 py-3 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-slate-600 dark:text-slate-400 text-sm">{message}</span>
        </div>
      </div>
    </div>
  );
};

// Button Loading State
export const ButtonLoadingState: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}> = ({ loading, children, className = '', loadingText }) => (
  <button className={`${className} relative`} disabled={loading}>
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" className="text-current" />
      </div>
    )}
    <span className={loading ? 'opacity-0' : 'opacity-100'}>
      {children}
    </span>
    {loading && loadingText && (
      <span className="absolute inset-0 flex items-center justify-center text-sm">
        {loadingText}
      </span>
    )}
  </button>
);

// Card Loading State
export const CardLoadingState: React.FC<{
  title?: string;
  lines?: number;
  showAvatar?: boolean;
}> = ({ title, lines = 3, showAvatar = true }) => (
  <div className="glass rounded-2xl p-6 animate-fade-in">
    {title && (
      <div className="flex items-center gap-3 mb-4">
        {showAvatar && <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>}
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-32 animate-pulse"></div>
      </div>
    )}
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  </div>
);

// List Loading State
export const ListLoadingState: React.FC<{
  items?: number;
  showAvatar?: boolean;
  height?: number;
}> = ({ items = 5, showAvatar = true, height = 60 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }, (_, i) => (
      <div
        key={i}
        className="glass rounded-2xl p-4 flex items-center gap-3 animate-fade-in"
        style={{ height: `${height}px` }}
      >
        {showAvatar && <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0"></div>}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 animate-pulse"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2 animate-pulse opacity-60"></div>
        </div>
        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse flex-shrink-0"></div>
      </div>
    ))}
  </div>
);

// Overlay Loading State
export const OverlayLoadingState: React.FC<{
  isVisible: boolean;
  message?: string;
  blur?: boolean;
}> = ({ isVisible, message = 'Laden...', blur = true }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm ${blur ? 'backdrop-blur-sm' : ''}`}>
      <div className="glass rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-scale-in">
        <LoadingSpinner size="lg" />
        <p className="text-slate-700 dark:text-slate-300 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Progress Loading State
export const ProgressLoadingState: React.FC<{
  progress: number;
  message?: string;
  showPercentage?: boolean;
}> = ({ progress, message = 'Laden...', showPercentage = true }) => (
  <div className="glass rounded-2xl p-6 w-full">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{message}</span>
      {showPercentage && (
        <span className="text-sm text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="h-full bg-white/20 animate-shimmer"></div>
      </div>
    </div>
  </div>
);

export {
  LoadingSpinner
};
