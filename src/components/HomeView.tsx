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
    <div className="flex-1 overflow-y-auto bg-[#f6f6f8] dark:bg-[#161022]">
      {/* Top App Bar */}
      <div className="flex items-center bg-[#f6f6f8] dark:bg-[#161022] p-4 pb-2 justify-between sticky top-0 z-10">
        <div className="flex size-12 shrink-0 items-center">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-300 dark:bg-slate-700" />
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1">
          {getGreeting()}, {userProfile.name}
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button 
            onClick={onOpenProfile}
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 w-12 bg-transparent text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <main className="flex-grow px-4 pb-28">
        {/* Primary CTA */}
        <div className="flex py-3">
          <button 
            onClick={onNewChat}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 w-full bg-[#6c2bee] text-white gap-3 text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#6c2bee]/30 hover:bg-[#5a22cc] transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
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
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square hover:bg-[#6c2bee]/30 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <svg className="w-8 h-8 text-[#6c2bee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-slate-800 dark:text-white text-sm font-bold text-center">Breathing Exercises</p>
          </button>
          
          <button 
            onClick={onOpenJournal}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square hover:bg-[#6c2bee]/30 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <svg className="w-8 h-8 text-[#6c2bee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-slate-800 dark:text-white text-sm font-bold text-center">Mood Journal</p>
          </button>
          
          <button 
            onClick={onOpenGoals}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square hover:bg-[#6c2bee]/30 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <svg className="w-8 h-8 text-[#6c2bee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-800 dark:text-white text-sm font-bold text-center">Coping Strategies</p>
          </button>
          
          <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#6c2bee]/20 dark:bg-[#6c2bee]/20 p-4 aspect-square hover:bg-[#6c2bee]/30 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6c2bee]/20">
              <svg className="w-8 h-8 text-[#6c2bee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
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
                  <svg className="w-6 h-6 text-[#6c2bee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {idx === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
                    {idx === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
                    {idx === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
                  </svg>
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
                <svg className="w-6 h-6 text-[#6c2bee]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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
