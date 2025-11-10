import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  logoSrc?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn, logoSrc = '/assets/Aura_logo.png' }) => {
  return (
    <div 
      className="relative flex h-auto min-h-screen w-full flex-col font-['Manrope'] overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #E6E6FA 0%, #ADD8E6 50%, #FFB6C1 100%)' }}
    >
      <div className="flex flex-col h-screen p-6 justify-between">
        {/* Spacer for top alignment */}
        <div className="flex-grow"></div>
        
        {/* Content Section */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo */}
          <div className="w-full flex justify-center mb-6">
            <div className="w-24 h-24 bg-center bg-no-repeat bg-contain">
              <img
                src={logoSrc}
                alt="Aura Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Headline */}
          <h2 className="text-[#483d8b] tracking-light text-[28px] font-bold leading-tight px-4 pb-3">
            Your personal guide to a calmer mind
          </h2>
        </div>
        
        {/* Spacer and Action Section */}
        <div className="flex-grow flex flex-col justify-end pb-4">
          <div className="w-full max-w-md mx-auto">
            {/* Get Started Button */}
            <div className="flex px-4 py-3">
              <button
                onClick={onGetStarted}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#6c2bee] text-white text-base font-bold leading-normal tracking-[0.015em] transition-all hover:bg-[#5a22cc]"
              >
                <span className="truncate">Get Started</span>
              </button>
            </div>
            
            {/* Sign In Link */}
            <p
              onClick={onSignIn}
              className="text-[#483d8b] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline cursor-pointer hover:text-[#6c2bee] transition-colors"
            >
              Already have an account? Sign In
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
