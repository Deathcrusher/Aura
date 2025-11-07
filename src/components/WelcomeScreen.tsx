import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  logoSrc?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn, logoSrc = '/assets/Aura_logo.png' }) => {
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-sans dark:bg-[#161022]"
      style={{
        background: 'linear-gradient(135deg, #E6E6FA 0%, #ADD8E6 50%, #FFB6C1 100%)',
      }}
    >
      {/* Decorative Shapes */}
      <div className="absolute top-[-5%] left-[-15%] h-48 w-48 rounded-full bg-[#6c2bee]/20 blur-3xl" data-alt="Abstract soft purple circular gradient"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-40 w-40 rounded-full bg-[#6c2bee]/20 blur-3xl" data-alt="Abstract soft purple circular gradient"></div>
      
      <div className="relative z-10 flex flex-col h-screen p-6 justify-between">
        <div className="flex-grow" />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-full flex justify-center mb-6">
            <img
              src={logoSrc}
              alt="Aura Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
          <h2 className="text-[#483d8b] tracking-light text-[28px] font-bold leading-tight px-4 pb-3">
            Your personal guide to a calmer mind
          </h2>
        </div>
        
        <div className="flex-grow flex flex-col justify-end pb-4">
          <div className="w-full max-w-md mx-auto">
            <div className="flex px-4 py-3">
              <button
                onClick={onGetStarted}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#6c2bee] text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#6c2bee]/40 transition-all hover:bg-[#5a22cc]"
              >
                <span className="truncate">Get Started</span>
              </button>
            </div>
            <p
              onClick={onSignIn}
              className="text-[#483d8b] text-sm font-normal leading-normal pb-3 pt-1 px-4 w-full text-center underline cursor-pointer"
            >
              Already have an account? Sign In
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 w-full max-w-lg mx-auto">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          <button className="flex flex-col items-center justify-center gap-1 text-[#6c2bee] dark:text-violet-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-1l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span className="text-xs font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span className="text-xs font-medium">Journal</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
