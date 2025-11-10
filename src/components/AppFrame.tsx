import React from 'react';

interface AppFrameProps {
  children: React.ReactNode;
}

// Modern, elegant container with glassmorphism
export const AppFrame: React.FC<AppFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 flex justify-center py-4 sm:py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-300/10 dark:bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md mx-auto glass rounded-3xl shadow-2xl dark:shadow-purple-900/20 flex flex-col overflow-hidden backdrop-blur-xl" style={{ minHeight: 'calc(100vh - 2rem)', maxHeight: 'calc(100vh - 2rem)' }}>
        {children}
      </div>
    </div>
 );
};

