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
    <nav className={`fixed bottom-0 left-0 right-0 z-10 glass border-t border-white/20 dark:border-white/5 backdrop-blur-xl ${className}`}>
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-200 relative ${
                isActive 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              )}
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-sm' 
                  : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}>
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'fill' : ''}`}>
                  {item.icon}
                </span>
              </div>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
