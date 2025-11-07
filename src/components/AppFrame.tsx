import React from 'react';

interface AppFrameProps {
  children: React.ReactNode;
}

// Central mobile-like container inspired by Stitch examples
export const AppFrame: React.FC<AppFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#E6E6FA_0%,#ADD8E6_50%,#FFB6C1_100%)] dark:bg-[#0f0b1b]">
      <div className="relative h-screen w-full max-w-md mx-auto overflow-hidden shadow-2xl rounded-xl bg-[#f6f6f8] dark:bg-[#161022]">
        {children}
      </div>
    </div>
 );
};

