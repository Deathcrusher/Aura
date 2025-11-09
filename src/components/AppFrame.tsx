import React from 'react';

interface AppFrameProps {
  children: React.ReactNode;
}

// Central mobile-like container inspired by Stitch examples
export const AppFrame: React.FC<AppFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[linear-gradient(135deg,#E6E6FA_0%,#ADD8E6_50%,#FFB6C1_100%)] dark:bg-[#0f0b1b] p-4">
      <div className="relative w-full max-w-md h-[calc(100vh-2rem)] max-h-[900px] mx-auto overflow-hidden shadow-2xl rounded-xl bg-[#f6f6f8] dark:bg-[#161022] flex flex-col">
        {children}
      </div>
    </div>
 );
};

