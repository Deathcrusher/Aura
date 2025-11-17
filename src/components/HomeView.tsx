import React from 'react';
import { UserProfile, ChatMode, JournalEntry } from '../types';
import { translations } from '../lib/translations';

interface HomeViewProps {
  userProfile: UserProfile;
  onNewChat: (mode: ChatMode) => void;
  onOpenGoals: () => void;
  onOpenMood: () => void;
  onOpenJournal: (entry?: JournalEntry | null) => void;
  onOpenProfile: () => void;
  onStartBreathingExercise: () => void;
  onOpenInsights: () => void;
  T: typeof translations['de-DE'];
}

export const HomeView: React.FC<HomeViewProps> = ({
  userProfile,
  onNewChat,
  onOpenGoals,
  onOpenMood,
  onOpenJournal,
  onOpenProfile,
  onStartBreathingExercise,
  onOpenInsights,
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/50 to-purple-50/30 dark:from-slate-900/50 dark:to-purple-950/20 min-h-0">
      {/* Modern Top App Bar */}
      <div className="flex items-center glass p-8 pb-6 justify-between sticky top-0 z-10 shrink-0 border-b border-white/20 dark:border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
            <span className="text-white text-2xl font-bold">{userProfile.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
              {getGreeting()}, {userProfile.name.split(' ')[0]}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back</p>
          </div>
        </div>
        <button 
          onClick={onOpenProfile}
          className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">settings</span>
        </button>
      </div>
      
      <main className="flex-grow px-8 pb-32 pt-4">
        {/* Modern Primary CTA */}
        <div className="mb-8 animate-fade-in-up">
          <button 
            onClick={async () => {
              if (onNewChat) {
                await onNewChat(ChatMode.TEXT);
              }
            }}
            className="w-full flex items-center justify-center gap-4 rounded-3xl h-20 px-8 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-2xl shadow-purple-500/40 hover:shadow-3xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
          >
            {/* Background gradient animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
              <span className="material-symbols-outlined text-white text-xl">chat_bubble</span>
            </div>
            <span className="relative text-lg font-semibold">Start Conversation</span>
            <span className="relative material-symbols-outlined ml-auto text-white/80 text-xl">arrow_forward</span>
          </button>
        </div>

        {/* Modern Mood Check-in Card */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-3xl glass p-6 card-shadow border border-white/20 dark:border-white/5">
            <div className="mb-6">
              <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">How are you feeling?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Track your mood today</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Happy', icon: 'sentiment_very_satisfied', color: 'from-yellow-400 to-orange-400' },
                { label: 'Calm', icon: 'sentiment_satisfied', color: 'from-blue-400 to-cyan-400' },
                { label: 'Sad', icon: 'sentiment_dissatisfied', color: 'from-slate-400 to-slate-500' },
                { label: 'Anxious', icon: 'sentiment_very_dissatisfied', color: 'from-red-400 to-pink-400' }
              ].map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => onOpenMood()}
                  className={`flex flex-col items-center justify-center gap-3 rounded-2xl p-4 transition-all duration-200 hover:scale-105 min-h-[80px] ${
                    todayMoodEntry?.mood === mood.label.toLowerCase()
                      ? 'bg-gradient-to-br ' + mood.color + ' shadow-lg scale-105'
                      : 'bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  <span className={`material-symbols-outlined text-3xl ${
                    todayMoodEntry?.mood === mood.label.toLowerCase() ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {mood.icon}
                  </span>
                  <span className={`text-xs font-medium ${
                    todayMoodEntry?.mood === mood.label.toLowerCase() ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Modern Quick Access Section */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-4">Quick Tools</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Breathing', icon: 'self_improvement', color: 'from-purple-500 to-pink-500', onClick: onStartBreathingExercise },
              { label: 'Journal', icon: 'edit_note', color: 'from-blue-500 to-cyan-500', onClick: () => onOpenJournal() },
              { label: 'Goals', icon: 'aod', color: 'from-violet-500 to-purple-500', onClick: onOpenGoals },
              { label: 'Progress', icon: 'trending_up', color: 'from-pink-500 to-rose-500', onClick: onOpenInsights }
            ].map((tool) => (
              <button
                key={tool.label}
                onClick={tool.onClick}
                className="flex flex-col items-center justify-center gap-4 rounded-3xl p-6 bg-gradient-to-br glass border border-white/20 dark:border-white/5 hover:scale-105 transition-all duration-200 card-shadow hover-lift group relative overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110`}>
                  <span className="material-symbols-outlined text-white text-2xl">{tool.icon}</span>
                </div>
                <p className="relative text-slate-800 dark:text-white text-sm font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{tool.label}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Modern Recent Progress Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3">Your Journey</h3>
          <div className="space-y-3">
            {recentJournalEntries.length > 0 ? (
              recentJournalEntries.slice(0, 3).map((entry, idx) => (
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
                  className="flex items-start gap-4 rounded-2xl glass p-4 border border-white/20 dark:border-white/5 hover:scale-[1.02] transition-all duration-200 card-shadow cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">
                      {idx === 0 ? 'chat_bubble' : idx === 1 ? 'psychology' : 'menu_book'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-semibold mb-1">
                      {idx === 0 ? 'Last session' : idx === 1 ? 'Coping Strategy' : 'Journal entry'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                      {entry.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-4 rounded-2xl glass p-4 border border-white/20 dark:border-white/5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">bolt</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white text-sm font-semibold mb-1">Start your journey</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">Begin tracking your mental wellness today!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
