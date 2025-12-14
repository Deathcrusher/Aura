import React from 'react';

interface AppFrameProps {
  children: React.ReactNode;
}

// Modern, elegant container with glassmorphism - responsive for web & mobile
export const AppFrame: React.FC<AppFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full mesh-bg flex justify-center py-0 md:py-8 md:px-6 relative overflow-hidden transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-float-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative w-full mx-auto flex flex-col overflow-hidden transition-all duration-500 backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 rounded-none shadow-none min-h-screen max-h-screen md:min-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-2rem)] md:max-w-lg lg:max-w-2xl md:rounded-3xl md:shadow-2xl md:border md:border-white/40 md:dark:border-white/10">
        {children}
      </div>
    </div>
  );
};
