import React from 'react';

export type ViewType = 'home' | 'chat' | 'journal' | 'profile' | 'insights' | 'privacy' | 'faq' | 'support';

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
      icon: 'home',
      activeIcon: 'home'
    },
    {
      id: 'chat' as ViewType,
      label: 'Chat',
      icon: 'chat_bubble',
      activeIcon: 'chat_bubble'
    },
    {
      id: 'journal' as ViewType,
      label: 'Journal',
      icon: 'book',
      activeIcon: 'book'
    },
    {
      id: 'insights' as ViewType,
      label: 'Insights',
      icon: 'insights',
      activeIcon: 'insights'
    },
    {
      id: 'profile' as ViewType,
      label: 'Profile',
      icon: 'person',
      activeIcon: 'person'
    }
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 dark:border-white/5 backdrop-blur-2xl shadow-2xl ${className}`}>
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative flex-1 max-w-[80px] ${
                isActive 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 dark:hover:text-purple-400'
              }`}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-lg shadow-purple-500/50"></div>
              )}
              
              {/* Icon container */}
              <div className={`relative transition-all duration-300 ${
                isActive 
                  ? 'scale-110' 
                  : 'scale-100 hover:scale-105'
              }`}>
                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 shadow-lg shadow-purple-500/30' 
                    : 'hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}>
                  <span className={`material-symbols-outlined text-2xl transition-all duration-300 ${
                    isActive ? 'fill scale-110' : ''
                  }`}>
                    {item.icon}
                  </span>
                </div>
                
                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-md -z-10"></div>
                )}
              </div>
              
              {/* Label */}
              <span className={`text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                isActive ? 'font-bold scale-105' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
