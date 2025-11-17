import React, { useState } from 'react';
import { JournalEntry, UserProfile } from '../types';
import { translations } from '../lib/translations';

interface JournalViewProps {
  userProfile: UserProfile;
  onOpenJournal: (entry?: JournalEntry | null) => void;
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
    <div className="relative flex flex-1 w-full flex-col bg-gradient-to-b from-white/50 to-purple-50/30 dark:from-slate-900/50 dark:to-purple-950/20 overflow-hidden min-h-0">
      {/* Top App Bar */}
      <header className="flex items-center glass p-6 pb-4 justify-between sticky top-0 z-10 shrink-0 border-b border-white/20 dark:border-white/5 backdrop-blur-xl">
        <div className="flex size-12 shrink-0 items-center" />
        <h1 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">My Journal</h1>
        <div className="flex w-12 items-center justify-end">
          <button 
            onClick={() => onOpenJournal()} 
            className="flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 group"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 px-6">
        {/* Calendar Picker */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          <div className="flex w-full max-w-[480px] flex-1 flex-col gap-2">
            <div className="flex items-center p-2 justify-between glass rounded-2xl">
              <button className="text-slate-900 dark:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all p-2">
                <span className="material-symbols-outlined flex size-10 items-center justify-center">chevron_left</span>
              </button>
              <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <button className="text-slate-900 dark:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all p-2">
                <span className="material-symbols-outlined flex size-10 items-center justify-center">chevron_right</span>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 p-2 glass rounded-2xl">
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
              onClick={() => onOpenJournal()}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] mt-4 shadow-xl shadow-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
              <div 
                key={entry.id} 
                onClick={() => onOpenJournal(entry)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenJournal(entry);
                  }
                }}
                role="button"
                tabIndex={0}
                className="bg-white dark:bg-[#1e182d] p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
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
