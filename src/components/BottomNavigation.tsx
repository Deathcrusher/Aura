import React from 'react';
import { ViewType } from '../types';

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
    <nav className={`fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 backdrop-blur-xl shadow-2xl z-50 ${className}`}>
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative flex-1 max-w-[80px] group ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary/80'
              }`}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-primary via-purple-500 to-primary shadow-lg shadow-primary/50"></div>
              )}
              
              {/* Icon container */}
              <div className={`relative transition-all duration-300 ${
                isActive 
                  ? 'scale-110' 
                  : 'scale-100 group-hover:scale-110'
              }`}>
                <div className={`p-2.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-primary/20 to-purple-600/20 shadow-lg shadow-primary/20 ring-1 ring-primary/20' 
                    : 'group-hover:bg-primary/10'
                }`}>
                  <span className={`material-symbols-outlined text-2xl transition-all duration-300 ${
                    isActive ? 'fill scale-110' : ''
                  }`}>
                    {item.icon}
                  </span>
                </div>
                
                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg -z-10 animate-pulse-soft"></div>
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
