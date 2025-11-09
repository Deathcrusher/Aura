import React from 'react';

export type ViewType = 'home' | 'chat' | 'journal' | 'profile' | 'insights';

interface BottomNavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentView, 
  onNavigate,
  className = ''
}) => {
  const getButtonClass = (view: ViewType) => {
    const isActive = currentView === view;
    return `flex flex-col items-center justify-center gap-1 ${
      isActive 
        ? 'text-[#6c2bee] dark:text-violet-300' 
        : 'text-slate-500 dark:text-slate-400'
    }`;
  };

  const getLabelClass = (view: ViewType) => {
    const isActive = currentView === view;
    return `text-xs ${isActive ? 'font-bold' : 'font-medium'}`;
  };

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex justify-around items-center h-20 max-w-md mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className={getButtonClass('home')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-1l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span className={getLabelClass('home')}>Home</span>
        </button>
        <button
          onClick={() => onNavigate('chat')}
          className={getButtonClass('chat')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span className={getLabelClass('chat')}>Chat</span>
        </button>
        <button
          onClick={() => onNavigate('journal')}
          className={getButtonClass('journal')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span className={getLabelClass('journal')}>Journal</span>
        </button>
        <button
          onClick={() => onNavigate('profile')}
          className={getButtonClass('profile')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span className={getLabelClass('profile')}>Profile</span>
        </button>
      </div>
    </div>
  );
};

