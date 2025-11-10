import React from 'react';

interface AppFrameProps {
  children: React.ReactNode;
}

// Central mobile-like container inspired by Stitch examples
export const AppFrame: React.FC<AppFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#E6E6FA_0%,#ADD8E6_50%,#FFB6C1_100%)] dark:bg-[#0f0b1b] flex justify-center py-4 sm:py-8">
      <div className="relative w-full max-w-md mx-auto shadow-2xl rounded-xl bg-[#f6f6f8] dark:bg-[#161022] flex flex-col" style={{ minHeight: 'calc(100vh - 2rem)', maxHeight: 'calc(100vh - 2rem)' }}>
        {children}
      </div>
    </div>
 );
};

