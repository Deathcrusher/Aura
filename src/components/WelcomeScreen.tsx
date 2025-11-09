import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  logoSrc?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn, logoSrc = '/assets/Aura_logo.png' }) => {
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #E6E6FA 0%, #ADD8E6 50%, #FFB6C1 100%)',
        fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Subtle Background Pattern for Desktop */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(108, 43, 238, 0.3) 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, rgba(108, 43, 238, 0.2) 0%, transparent 50%),
                         radial-gradient(circle at 40% 20%, rgba(173, 216, 230, 0.3) 0%, transparent 50%)`
      }} />
      
      {/* Centered Content Container with Max Width for Desktop */}
      <div className="relative z-10 flex flex-col h-screen w-full max-w-[480px] p-6 justify-between mx-auto">
        {/* Top Spacer - More space on desktop */}
        <div className="flex-grow min-h-[10vh] md:min-h-[20vh]" />
        
        {/* Content Section */}
        <div className="flex flex-col items-center justify-center text-center px-4">
          {/* Logo with subtle animation */}
          <div className="w-full flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <img
                src={logoSrc}
                alt="Aura Logo"
                className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-lg"
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl -z-10 animate-pulse" />
            </div>
          </div>
          
          {/* Headline with better typography */}
          <h1 className="text-[#483d8b] text-[32px] md:text-[36px] font-bold leading-tight tracking-tight px-2 animate-fade-in-up">
            Your personal guide to a calmer mind
          </h1>
          
          {/* Optional subtitle for larger screens */}
          <p className="hidden md:block text-[#6b5b95] text-base font-medium mt-4 max-w-sm animate-fade-in-up opacity-80">
            Start your journey to better mental wellness today
          </p>
        </div>
        
        {/* Bottom Action Section */}
        <div className="flex-grow flex flex-col justify-end pb-6 md:pb-8 min-h-[10vh]">
          <div className="w-full animate-fade-in-up">
            {/* Get Started Button */}
            <div className="px-2 py-3">
              <button
                onClick={onGetStarted}
                className="w-full cursor-pointer rounded-xl h-14 md:h-16 px-6 bg-[#6c2bee] text-white text-lg font-bold tracking-tight shadow-xl shadow-[#6c2bee]/40 transition-all duration-300 hover:bg-[#5a22cc] hover:shadow-2xl hover:shadow-[#6c2bee]/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </button>
            </div>
            
            {/* Sign In Link */}
            <p
              onClick={onSignIn}
              className="text-[#483d8b] text-sm md:text-base font-medium leading-normal py-2 px-4 text-center underline underline-offset-2 cursor-pointer transition-colors hover:text-[#6c2bee]"
            >
              Already have an account? <span className="font-semibold">Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
