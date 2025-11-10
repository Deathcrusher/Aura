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
  const navItems = [
    {
      id: 'home' as ViewType,
      label: 'Home',
      icon: 'home'
    },
    {
      id: 'journal' as ViewType,
      label: 'Journal',
      icon: 'book'
    },
    {
      id: 'chat' as ViewType,
      label: 'Chat',
      icon: 'chat_bubble'
    },
    {
      id: 'profile' as ViewType,
      label: 'Settings',
      icon: 'settings'
    }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800/60 dark:bg-[#161022]/80 ${className}`}>
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive 
                  ? 'text-[#6c2bee]' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${isActive ? 'fill' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
