import React from 'react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  logoSrc?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSignIn, logoSrc = '/assets/Aura_logo.png' }) => {
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden font-sans"
      style={{
        background: 'linear-gradient(135deg, #E6E6FA 0%, #ADD8E6 50%, #FFB6C1 100%)',
      }}
    >
      <div className="flex flex-col h-screen p-6 justify-between">
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
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 flex-1 bg-[#6c2bee] text-white text-base font-bold"
              >
                <span className="truncate">Get Started</span>
              </button>
            </div>
            <button
              onClick={onSignIn}
              className="text-[#483d8b] text-sm leading-normal pb-3 pt-1 px-4 w-full text-center underline"
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

