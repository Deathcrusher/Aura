import React from 'react';
import { LoadingSpinner } from './SkeletonLoader';

// Network Error State
export const NetworkErrorState: React.FC<{
  onRetry?: () => void;
  message?: string;
}> = ({ onRetry, message = 'Keine Internetverbindung' }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg">
      <span className="material-symbols-outlined text-white text-3xl">wifi_off</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      {message}
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
      Überprüfe deine Internetverbindung und versuche es erneut.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
      >
        <span className="material-symbols-outlined">refresh</span>
        Erneut versuchen
      </button>
    )}
  </div>
);

// API Error State
export const APIErrorState: React.FC<{
  onRetry?: () => void;
  error?: string;
  code?: string;
}> = ({ onRetry, error = 'Serverfehler', code }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
      <span className="material-symbols-outlined text-white text-3xl">cloud_off</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      Serverprobleme
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
      {error}
    </p>
    {code && (
      <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
        Fehlercode: {code}
      </p>
    )}
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
      Unsere Server haben gerade Schwierigkeiten. Bitte versuche es in wenigen Minuten erneut.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
      >
        <span className="material-symbols-outlined">refresh</span>
        Erneut versuchen
      </button>
    )}
  </div>
);

// Empty State
export const EmptyState: React.FC<{
  icon?: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ 
  icon = 'inbox', 
  title = 'Nichts gefunden', 
  description = 'Es gibt hier nichts zu sehen.',
  action 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center mb-4 shadow-lg">
      <span className="material-symbols-outlined text-white text-3xl">{icon}</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
      {description}
    </p>
    {action && (
      <button
        onClick={action.onClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
      >
        <span className="material-symbols-outlined">add</span>
        {action.label}
      </button>
    )}
  </div>
);

// Permission Denied State
export const PermissionDeniedState: React.FC<{
  permission?: string;
  onRequestPermission?: () => void;
}> = ({ 
  permission = 'Mikrofonzugriff', 
  onRequestPermission 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
      <span className="material-symbols-outlined text-white text-3xl">mic_off</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      {permission} erforderlich
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
      Diese Funktion benötigt {permission.toLowerCase()}, um ordnungsgemäß zu funktionieren.
    </p>
    {onRequestPermission && (
      <button
        onClick={onRequestPermission}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
      >
        <span className="material-symbols-outlined">security</span>
        Zugriff erlauben
      </button>
    )}
  </div>
);

// Rate Limit State
export const RateLimitState: React.FC<{
  onRetry?: () => void;
  retryAfter?: number;
}> = ({ onRetry, retryAfter = 60 }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center mb-4 shadow-lg">
      <span className="material-symbols-outlined text-white text-3xl">timer</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      Zu viele Anfragen
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
      Du hast das Limit für Anfragen erreicht. Bitte warte einen Moment, bevor du es erneut versuchst.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300"
      >
        <span className="material-symbols-outlined">schedule</span>
        In {retryAfter}s erneut versuchen
      </button>
    )}
  </div>
);

// Maintenance State
export const MaintenanceState: React.FC<{
  message?: string;
}> = ({ message = 'Wir führen gerade Wartungsarbeiten durch' }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
      <span className="material-symbols-outlined text-white text-3xl">build</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      Wartungsarbeiten
    </h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
      {message}. Wir sind so schnell wie möglich wieder für dich da.
    </p>
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <LoadingSpinner size="sm" />
      <span>System wird aktualisiert...</span>
    </div>
  </div>
);

// Generic Error Card for inline errors
export const ErrorCard: React.FC<{
  error: string;
  onDismiss?: () => void;
  variant?: 'warning' | 'error' | 'info';
}> = ({ error, onDismiss, variant = 'error' }) => {
  const variantStyles = {
    warning: 'from-amber-500 to-orange-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    error: 'from-red-500 to-pink-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    info: 'from-blue-500 to-cyan-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  };

  const iconMap = {
    warning: 'warning',
    error: 'error',
    info: 'info'
  };

  return (
    <div className={`glass rounded-2xl p-4 border ${variantStyles[variant].split(' ').slice(1).join(' ')}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${variantStyles[variant].split(' ').slice(0, 2).join(' ')} flex items-center justify-center flex-shrink-0`}>
          <span className="material-symbols-outlined text-white text-sm">
            {iconMap[variant]}
          </span>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${variantStyles[variant].split(' ').slice(-1).join(' ')}`}>
            {error}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm opacity-60">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  NetworkErrorState,
  APIErrorState,
  EmptyState,
  PermissionDeniedState,
  RateLimitState,
  MaintenanceState,
  ErrorCard
};
