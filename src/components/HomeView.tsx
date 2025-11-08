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
  // Get today's mood if available
  const todayMoodEntry = userProfile.moodJournal?.[0] || null;
  
  // Get recent journal entries
  const recentJournalEntries = userProfile.journal?.slice(0, 3) || [];
  
  // Get active goals
  const activeGoals = userProfile.goals?.filter(goal => goal.status === 'active') || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {T.ui.onboarding.welcomeTitle}, {userProfile.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {T.ui.onboarding.welcomeSubtitle}
        </p>
      </div>

      {/* Mood Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {T.ui.moodModal.title}
          </h2>
          <button 
            onClick={onOpenMood}
            className="text-sm text-[#6c2bee] dark:text-violet-400 hover:underline"
          >
            {T.ui.moodModal.subtitle}
          </button>
        </div>
        {todayMoodEntry ? (
          <div className="flex items-center gap-2">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{T.ui.moods[todayMoodEntry.mood as keyof typeof T.ui.moods]}</p>
              {todayMoodEntry.note && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{todayMoodEntry.note}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 italic">
            Noch keine Stimmung erfasst
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={onNewChat}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-[#6c2bee] dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Neues Gespräch</p>
        </button>
        <button
          onClick={onOpenJournal}
          className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-5 h-5 text-blue-50 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2V5a2 2 0 012-2h5.586a1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{T.ui.sidebar.journal}</p>
        </button>
      </div>

      {/* Goals Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 shadow-sm border border-slate-20 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {T.ui.sidebar.goals}
          </h2>
          <button 
            onClick={onOpenGoals}
            className="text-sm text-[#6c2bee] dark:text-violet-400 hover:underline"
          >
            {T.ui.goalsModal.title}
          </button>
        </div>
        {activeGoals.length > 0 ? (
          <div className="space-y-2">
            {activeGoals.slice(0, 2).map((goal) => (
              <div key={goal.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <span className="text-sm text-slate-900 dark:text-white truncate">{goal.description}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(goal.createdAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 italic py-2">
            Noch keine Ziele gesetzt
          </p>
        )}
      </div>

      {/* Recent Journal Entries */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-70">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {T.ui.sidebar.journal}
          </h2>
          <button 
            onClick={onOpenJournal}
            className="text-sm text-[#6c2bee] dark:text-violet-400 hover:underline"
          >
            {T.ui.journalModal.title}
          </button>
        </div>
        {recentJournalEntries.length > 0 ? (
          <div className="space-y-3">
            {recentJournalEntries.map((entry) => (
              <div key={entry.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-900 dark:text-white line-clamp-2">
                  {entry.content}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(entry.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 italic py-2">
            Noch keine Einträge
          </p>
        )}
      </div>
    </div>
 );
};