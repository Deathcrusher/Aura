import React, { useState } from 'react';
import { JournalEntry, UserProfile } from '../types';
import { translations } from '../lib/translations';

interface JournalViewProps {
  userProfile: UserProfile;
  onOpenJournal: () => void;
  T: typeof translations['de-DE'];
}

export const JournalView: React.FC<JournalViewProps> = ({
  userProfile,
  onOpenJournal,
  T
}) => {
  const journalEntries = userProfile.journal || [];
  const [currentMonth] = useState(new Date());

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8] dark:bg-[#161022]">
      {/* Top App Bar */}
      <header className="flex items-center bg-[#f6f6f8] dark:bg-[#161022] p-4 pb-2 justify-between sticky top-0 z-10">
        <div className="flex size-12 shrink-0 items-center" />
        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">My Journal</h1>
        <div className="flex w-12 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-slate-900 dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-grow pb-28 px-4">
        {/* Calendar Picker */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          <div className="flex w-full max-w-[480px] flex-1 flex-col gap-0.5">
            <div className="flex items-center p-1 justify-between">
              <button className="text-slate-900 dark:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <p className="text-slate-900 dark:text-white text-base font-bold leading-tight flex-1 text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <button className="text-slate-900 dark:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <p key={idx} className="text-slate-600 dark:text-[#a69db9] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5">
                  {day}
                </p>
              ))}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <button 
                  key={day}
                  className="h-12 w-full text-slate-900 dark:text-white text-sm font-medium leading-normal hover:bg-[#6c2bee]/10 rounded-full transition-colors"
                >
                  <div className="flex size-full items-center justify-center rounded-full relative">
                    {day}
                    {day === 5 && <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-[#6c2bee]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mood Entry Section */}
        <div className="px-0 py-6">
          <div className="bg-white dark:bg-[#1e182d] p-6 rounded-xl shadow-sm">
            <h2 className="text-slate-900 dark:text-white tracking-light text-xl font-bold leading-tight text-left pb-4">
              How are you feeling today?
            </h2>
            
            {/* Mood Selector */}
            <div className="flex justify-around items-center py-4">
              {[
                { emoji: '😊', label: 'Happy' },
                { emoji: '🙂', label: 'Calm' },
                { emoji: '😐', label: 'Neutral' },
                { emoji: '😔', label: 'Sad' },
                { emoji: '😠', label: 'Angry' }
              ].map(({ emoji, label }) => (
                <button key={label} className="flex flex-col items-center gap-2 group">
                  <span className="text-4xl">{emoji}</span>
                  <p className="text-xs font-medium text-slate-600 dark:text-[#a69db9] group-hover:text-slate-900 dark:group-hover:text-white">
                    {label}
                  </p>
                </button>
              ))}
            </div>
            
            {/* Text Field */}
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal pb-2">
                  Add a note (optional)
                </p>
                <textarea 
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#6c2bee]/50 border-gray-300 dark:border-gray-600 bg-[#f6f6f8] dark:bg-[#161022] focus:border-[#6c2bee] min-h-28 placeholder:text-slate-600 dark:placeholder:text-[#a69db9] p-[15px] text-base font-normal leading-normal" 
                  placeholder="What's on your mind?"
                />
              </label>
            </div>
            
            {/* Save Button */}
            <button 
              onClick={onOpenJournal}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-[#6c2bee] text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] mt-4 shadow-lg shadow-[#6c2bee]/30 hover:bg-[#5a22cc] transition-all"
            >
              Save Entry
            </button>
          </div>
        </div>

        {/* Journal Entries List */}
        {journalEntries.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] mb-4">
              Recent Entries
            </h3>
            {journalEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-[#1e182d] p-4 rounded-xl shadow-sm">
                <p className="text-sm text-slate-500 dark:text-[#a69db9] mb-2">
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
