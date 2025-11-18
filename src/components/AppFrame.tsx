import React from 'react';

interface AppFrameProps {
  children: React.ReactNode;
}

// Modern, elegant container with glassmorphism - responsive for web & mobile
export const AppFrame: React.FC<AppFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full mesh-bg flex justify-center py-2 sm:py-4 md:py-8 relative overflow-hidden transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] animate-float-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative w-full max-w-md md:max-w-lg lg:max-w-2xl mx-auto glass rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-500 border-opacity-50" style={{ minHeight: 'calc(100vh - 2rem)', maxHeight: 'calc(100vh - 2rem)' }}>
        {children}
      </div>
    </div>
  );
};

