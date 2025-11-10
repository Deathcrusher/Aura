import React from 'react';
import { UserProfile } from '../types';
import { translations } from '../lib/translations';

interface HomeViewProps {
  userProfile: UserProfile;
  onNewChat: () => void;
  onOpenGoals: () => void;
  onOpenMood: () => void;
  onOpenJournal: () => void;
  onOpenProfile: () => void;
  T: typeof translations['de-DE'];
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  onNewChat,
  onOpenGoals,
  onOpenMood,
  onOpenJournal,
  onOpenProfile,
  T
}) => {
  const todayMoodEntry = userProfile.moodJournal?.[0] || null;
  const recentJournalEntries = userProfile.journal?.slice(0, 3) || [];
  const activeGoals = userProfile.goals?.filter(goal => goal.status === 'active') || [];
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f6f6f8] dark:bg-[#161022] min-h-0">
      {/* Top App Bar */}
      <div className="flex items-center bg-[#f6f6f8] dark:bg-[#161022] p-4 pb-2 justify-between sticky top-0 z-10 shrink-0">
        <div className="flex size-12 shrink-0 items-center">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-300 dark:bg-slate-700" />
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1">
          {getGreeting()}, {userProfile.name}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button 
            onClick={onOpenProfile}
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 w-12 bg-transparent text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>
      
      <main className="flex-grow px-4 pb-28">
        {/* Primary CTA */}
        <div className="flex py-3">
          <button 
            onClick={onNewChat}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 flex-1 bg-[#6c2bee] text-white gap-3 pl-5 text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#6c2bee]/30 hover:bg-[#6c2bee]/90 transition-all duration-200"
          >
            <span className="material-symbols-outlined">forum</span>
            <span className="truncate">Start a conversation</span>
          </button>
        </div>

        {/* Mood Check-in Card */}
        <div className="pt-4">
          <div className="flex flex-col items-stretch justify-start rounded-xl bg-slate-100 dark:bg-[#1f1c27] p-4">
            <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1">
              <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">How are you feeling?</p>
              <div className="flex items-end gap-3 justify-between">
                <p className="text-slate-600 dark:text-[#a69db9] text-base font-normal leading-normal">Select one of the options below</p>
              </div>
            </div>
            <div className="flex pt-4">
              <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-slate-200 dark:bg-[#2e2839] p-1">
                {['Happy', 'Calm', 'Sad', 'Anxious'].map((mood) => (
                  <label 
                    key={mood}
                    className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-[#f6f6f8] has-[:checked]:dark:bg-[#161022] has-[:checked]:shadow-[0_0_4px_rgba(0,0,0,0.1)] has-[:checked]:text-[#6c2bee] text-slate-500 dark:text-[#a69db9] text-sm font-medium leading-normal transition-all duration-200"
                  >
                    <span className="truncate">{mood}</span>
                    <input 
                      className="invisible w-0" 
                      name="mood-check" 
                      type="radio" 
                      value={mood}
                      checked={todayMoodEntry?.mood === mood.toLowerCase()}
                      onChange={() => onOpenMood()}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Access Section */}
        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-6">Explore Your Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onOpenMood}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <span className="material-symbols-outlined text-[#6c2bee] text-3xl">self_improvement</span>
            </div>
            <p className="text-slate-800 dark:text-white text-sm font-bold text-center">Breathing Exercises</p>
          </button>
          
          <button 
            onClick={onOpenJournal}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <span className="material-symbols-outlined text-[#6c2bee] text-3xl">edit_note</span>
            </div>
            <p className="text-slate-800 dark:text-white text-sm font-bold text-center">Mood Journal</p>
          </button>
          
          <button 
            onClick={onOpenGoals}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <span className="material-symbols-outlined text-[#6c2bee] text-3xl">aod</span>
            </div>
            <p className="text-slate-800 dark:text-white text-sm font-bold text-center">Coping Strategies</p>
          </button>
          
          <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <span className="material-symbols-outlined text-[#6c2bee] text-3xl">trending_up</span>
            </div>
            <p className="text-slate-800 dark:text-white text-sm font-bold text-center">Track Progress</p>
          </button>
        </div>
        
        {/* Recent Progress Section */}
        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-6">Your Journey</h3>
        <div className="space-y-4">
          {recentJournalEntries.length > 0 ? (
            recentJournalEntries.slice(0, 3).map((entry, idx) => (
              <div key={entry.id} className="flex items-start rounded-xl bg-slate-100 dark:bg-[#1f1c27] p-4 gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6c2bee]/20">
                  <span className="material-symbols-outlined text-[#6c2bee] text-2xl">
                    {idx === 0 ? 'chat_bubble' : idx === 1 ? 'psychology' : 'menu_book'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <p className="text-slate-900 dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">
                    {idx === 0 ? 'Last session' : idx === 1 ? 'Coping Strategy' : 'Journal entry'}
                  </p>
                  <p className="text-slate-600 dark:text-[#a69db9] text-sm font-normal leading-normal line-clamp-2">
                    {entry.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-start rounded-xl bg-slate-100 dark:bg-[#1f1c27] p-4 gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6c2bee]/20">
                <span className="material-symbols-outlined text-[#6c2bee] text-2xl">bolt</span>
              </div>
              <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white text-base font-bold leading-tight tracking-[-0.015em]">Start your journey</p>
                <p className="text-slate-600 dark:text-[#a69db9] text-sm font-normal leading-normal">Begin tracking your mental wellness today!</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
