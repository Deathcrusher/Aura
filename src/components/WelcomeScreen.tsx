import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  logoSrc?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn, logoSrc = '/assets/Aura_logo.png' }) => {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-300/10 dark:bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex flex-col h-screen p-6 justify-between z-10">
        {/* Spacer for top alignment */}
        <div className="flex-grow"></div>
        
        {/* Content Section */}
        <div className="flex flex-col items-center justify-center text-center animate-fade-in-up">
          {/* Logo */}
          <div className="w-full flex justify-center mb-8 animate-scale-in">
            <div className="w-32 h-32 bg-center bg-no-repeat bg-contain relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
              <img
                src={logoSrc}
                alt="Aura Logo"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </div>
          
          {/* Headline */}
          <h2 className="text-slate-900 dark:text-white tracking-tight text-3xl sm:text-4xl font-bold leading-tight px-4 mb-4 gradient-text">
            Your personal guide to a calmer mind
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base px-4 max-w-sm">
            Experience AI-powered mental wellness support, anytime, anywhere.
          </p>
        </div>
        
        {/* Spacer and Action Section */}
        <div className="flex-grow flex flex-col justify-end pb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-full max-w-md mx-auto">
            {/* Get Started Button */}
            <div className="flex px-4 py-3">
              <button
                onClick={onGetStarted}
                className="w-full flex items-center justify-center gap-3 rounded-2xl h-14 px-6 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold text-base"
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            
            {/* Sign In Link */}
            <p
              onClick={onSignIn}
              className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-3 pt-2 px-4 text-center cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Already have an account? <span className="font-semibold underline">Sign In</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
