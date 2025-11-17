import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded-full',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-2xl'
  };

  const style = {
    width: width || '100%',
    height: height || '1rem'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Chat Message Skeleton
export const ChatMessageSkeleton: React.FC<{ isUser?: boolean }> = ({ isUser = false }) => (
  <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
    {!isUser && (
      <Skeleton variant="circular" width={40} height={40} className="flex-shrink-0" />
    )}
    <div className={`max-w-[70%] ${isUser ? 'order-first' : ''}`}>
      <div className={`glass rounded-2xl p-4 ${isUser ? 'bg-gradient-to-br from-purple-500 to-pink-500' : ''}`}>
        <Skeleton 
          variant="text" 
          lines={2} 
          height={16}
          className={isUser ? 'bg-white/30 dark:bg-white/20' : ''}
        />
      </div>
      <Skeleton 
        variant="text" 
        width={80} 
        height={12} 
        className="mt-2 opacity-60"
      />
    </div>
    {isUser && (
      <Skeleton variant="circular" width={40} height={40} className="flex-shrink-0" />
    )}
  </div>
);

// Journal Entry Skeleton
export const JournalEntrySkeleton: React.FC = () => (
  <div className="glass rounded-2xl p-6 mb-4 animate-fade-in">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton variant="text" width={120} height={20} className="mb-2" />
        <Skeleton variant="text" width={80} height={14} className="opacity-60" />
      </div>
      <Skeleton variant="circular" width={32} height={32} />
    </div>
    <Skeleton variant="text" lines={3} height={16} className="mb-4" />
    <div className="flex gap-2">
      <Skeleton variant="rounded" width={60} height={24} />
      <Skeleton variant="rounded" width={80} height={24} />
    </div>
  </div>
);

// Profile Card Skeleton
export const ProfileCardSkeleton: React.FC = () => (
  <div className="glass rounded-2xl p-6 mb-4">
    <div className="flex items-center gap-4 mb-6">
      <Skeleton variant="circular" width={64} height={64} />
      <div className="flex-1">
        <Skeleton variant="text" width={150} height={24} className="mb-2" />
        <Skeleton variant="text" width={100} height={16} className="opacity-60" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="rounded" height={48} />
    </div>
  </div>
);

// Session List Skeleton
export const SessionListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width={120} height={16} className="mb-1" />
          <Skeleton variant="text" width={80} height={12} className="opacity-60" />
        </div>
        <Skeleton variant="circular" width={24} height={24} />
      </div>
    ))}
  </div>
);

// Loading Spinner Component
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg 
        className="w-full h-full text-purple-500" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Full Page Loading State
export const PageLoadingState: React.FC<{ message?: string }> = ({ 
  message = 'Laden...' 
}) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
    <LoadingSpinner size="lg" />
    <p className="text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
  </div>
);

export default Skeleton;
