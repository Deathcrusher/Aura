import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  logoSrc?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn, logoSrc = '/assets/Aura_logo.png' }) => {
  return (
    <div className="relative flex h-screen w-full flex-col bg-[#f6f6f8] dark:bg-[#161022] font-['Manrope'] overflow-hidden">
      {/* Subtle gradient overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#6c2bee]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#6c2bee]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full max-w-[480px] mx-auto w-full p-6 justify-between">
        {/* Top Spacer */}
        <div className="flex-grow" />
        
        {/* Center Content */}
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="w-24 h-24 mb-6">
            <img
              src={logoSrc}
              alt="Aura Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Headline */}
          <h2 className="text-[#483d8b] dark:text-white text-[28px] font-bold leading-tight tracking-tight px-4 pb-3">
            Your personal guide to a calmer mind
          </h2>
        </div>
        
        {/* Bottom Actions */}
        <div className="flex-grow flex flex-col justify-end pb-4">
          <div className="w-full">
            {/* Get Started Button */}
            <div className="px-4 py-3">
              <button
                onClick={onGetStarted}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 w-full bg-[#6c2bee] text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#6c2bee]/30 transition-all hover:bg-[#5a22cc]"
              >
                <span className="truncate">Get Started</span>
              </button>
            </div>
            
            {/* Sign In Link */}
            <p
              onClick={onSignIn}
              className="text-[#483d8b] dark:text-[#a69db9] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline cursor-pointer hover:text-[#6c2bee] dark:hover:text-[#8b5cf6] transition-colors"
            >
              Already have an account? Sign In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
