import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, Mood, MoodEntry } from '../types';
import { HeartIcon, GoalsIcon, JournalIcon, UserIcon } from './Icons';
import { useDeviceInfo } from '../hooks/useResponsive';
import { Container, ResponsiveCard, Grid, Flex } from './ui/ResponsiveLayout';
import { LoadingSpinner } from './ui/SkeletonLoader';

interface HomeViewProps {
  userProfile: UserProfile;
  onNewChat: (mode: any) => void;
  onOpenGoals: () => void;
  onOpenMood: () => void;
  onOpenJournal: (entry?: any) => void;
  onOpenProfile: () => void;
  onStartBreathingExercise: () => void;
  onOpenInsights: () => void;
  T: any;
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
  // Responsive device info
  const { isMobile, isTablet, isDesktop, isMobilePortrait, isMobileLandscape } = useDeviceInfo();
  
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
      <div className={`flex items-center glass justify-between sticky top-0 z-10 shrink-0 border-b border-white/20 dark:border-white/5 backdrop-blur-xl ${
        isMobile ? 'p-4 pb-3' : isTablet ? 'p-6 pb-4' : 'p-8 pb-6'
      }`}>
        <div className="flex items-center gap-4 flex-1">
          <div className={`rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30 ${
            isMobile ? 'w-12 h-12' : isTablet ? 'w-14 h-14' : 'w-16 h-16'
          }`}>
            <span className={`text-white font-bold ${
              isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl'
            }`}>{userProfile.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className={`text-slate-900 dark:text-white font-bold leading-tight ${
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
            }`}>
              {getGreeting()}, {userProfile.name.split(' ')[0]}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back</p>
          </div>
        </div>
        <button 
          onClick={onOpenProfile}
          className={`rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm ${
            isMobile ? 'p-2' : 'p-2.5'
          }`}
        >
          <span className={`material-symbols-outlined text-slate-600 dark:text-slate-300 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>settings</span>
        </button>
      </div>
      
      <main className={`flex-grow pt-4 ${
        isMobile ? 'px-4 pb-24' : isTablet ? 'px-6 pb-28' : 'px-8 pb-32'
      }`}>
        {/* Modern Primary CTA */}
        <div className="mb-8 animate-fade-in-up">
          <button 
            onClick={async () => {
              if (onNewChat) {
                await onNewChat('TEXT');
              }
            }}
            className={`w-full flex items-center justify-center gap-4 rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white shadow-2xl shadow-purple-500/40 hover:shadow-3xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden ${
              isMobile ? 'h-16 px-6' : isTablet ? 'h-18 px-7' : 'h-20 px-8'
            }`}
          >
            {/* Background gradient animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className={`relative rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all ${
              isMobile ? 'w-10 h-10' : isTablet ? 'w-12 h-12' : 'w-14 h-14'
            }`}>
              <span className={`material-symbols-outlined text-white ${
                isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
              }`}>chat_bubble</span>
            </div>
            <span className={`relative font-semibold ${
              isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl'
            }`}>Start Conversation</span>
            <span className={`relative material-symbols-outlined ml-auto text-white/80 ${
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
            }`}>arrow_forward</span>
          </button>
        </div>

        {/* Modern Mood Check-in Card */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <ResponsiveCard className="card-shadow border border-white/20 dark:border-white/5">
            <div className={`${
              isMobile ? 'mb-4' : 'mb-6'
            }`}>
              <h3 className={`text-slate-900 dark:text-white font-bold mb-2 ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>How are you feeling?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Track your mood today</p>
            </div>
            <Grid 
              cols={{ xs: 2, sm: 4, md: 4, lg: 4 }}
              gap={{ xs: 3, sm: 3, md: 3, lg: 3 }}
            >
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
                  <span className={`material-symbols-outlined ${
                    isMobile ? 'text-2xl' : 'text-3xl'
                  } ${
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
            </Grid>
          </ResponsiveCard>
        </div>
        
        {/* Modern Quick Access Section */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className={`text-slate-900 dark:text-white font-bold mb-4 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>Quick Tools</h3>
          <Grid 
            cols={{ xs: 1, sm: 2, md: 2, lg: 2 }}
            gap={{ xs: 3, sm: 4, md: 4, lg: 4 }}
          >
            {[
              { label: 'Breathing', icon: 'self_improvement', color: 'from-purple-500 to-pink-500', onClick: onStartBreathingExercise },
              { label: 'Journal', icon: 'edit_note', color: 'from-blue-500 to-cyan-500', onClick: () => onOpenJournal() },
              { label: 'Goals', icon: 'aod', color: 'from-violet-500 to-purple-500', onClick: onOpenGoals },
              { label: 'Progress', icon: 'trending_up', color: 'from-pink-500 to-rose-500', onClick: onOpenInsights }
            ].map((tool) => (
              <ResponsiveCard
                key={tool.label}
                className="glass border border-white/20 dark:border-white/5 hover:scale-105 transition-all duration-200 card-shadow hover-lift group relative overflow-hidden cursor-pointer"
                onClick={tool.onClick}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                <Flex 
                  direction={{ xs: "col", sm: "col", md: "col", lg: "col" }}
                  justify="center" 
                  align="center"
                  gap={{ xs: 3, sm: 4, md: 4, lg: 4 }}
                  className="relative p-4"
                >
                  <div className={`relative rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110 ${
                    isMobile ? 'w-12 h-12' : isTablet ? 'w-14 h-14' : 'w-16 h-16'
                  }`}>
                    <span className={`material-symbols-outlined text-white ${
                      isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-2xl'
                    }`}>{tool.icon}</span>
                  </div>
                  <p className={`relative text-slate-800 dark:text-white font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${
                    isMobile ? 'text-sm' : 'text-sm'
                  }`}>{tool.label}</p>
                </Flex>
              </ResponsiveCard>
            ))}
          </Grid>
        </div>
        
        {/* Modern Recent Progress Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className={`text-slate-900 dark:text-white font-bold mb-3 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>Your Journey</h3>
          <div className="space-y-3">
            {recentJournalEntries.length > 0 ? (
              recentJournalEntries.slice(0, 3).map((entry, idx) => (
                <ResponsiveCard
                  key={entry.id} 
                  className="glass border border-white/20 dark:border-white/5 hover:scale-[1.02] transition-all duration-200 card-shadow cursor-pointer"
                  onClick={() => onOpenJournal(entry)}
                >
                  <Flex 
                    direction={{ xs: "row", sm: "row", md: "row", lg: "row" }}
                    justify="start" 
                    align="start"
                    gap={{ xs: 3, sm: 4, md: 4, lg: 4 }}
                    className="p-4"
                  >
                    <div className={`rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 ${
                      isMobile ? 'w-10 h-10' : isTablet ? 'w-12 h-12' : 'w-12 h-12'
                    }`}>
                      <span className={`material-symbols-outlined text-purple-600 dark:text-purple-400 ${
                        isMobile ? 'text-lg' : 'text-xl'
                      }`}>
                        {idx === 0 ? 'chat_bubble' : idx === 1 ? 'psychology' : 'menu_book'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-slate-900 dark:text-white font-semibold mb-1 ${
                        isMobile ? 'text-sm' : 'text-sm'
                      }`}>
                        {idx === 0 ? 'Last session' : idx === 1 ? 'Coping Strategy' : 'Journal entry'}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {entry.content}
                      </p>
                    </div>
                  </Flex>
                </ResponsiveCard>
              ))
            ) : (
              <ResponsiveCard className="glass border border-white/20 dark:border-white/5">
                <Flex 
                  direction={{ xs: "row", sm: "row", md: "row", lg: "row" }}
                  justify="start" 
                  align="start"
                  gap={{ xs: 3, sm: 4, md: 4, lg: 4 }}
                  className="p-4"
                >
                  <div className={`rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 ${
                    isMobile ? 'w-10 h-10' : isTablet ? 'w-12 h-12' : 'w-12 h-12'
                  }`}>
                    <span className={`material-symbols-outlined text-purple-600 dark:text-purple-400 ${
                      isMobile ? 'text-lg' : 'text-xl'
                    }`}>bolt</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-slate-900 dark:text-white font-semibold mb-1 ${
                      isMobile ? 'text-sm' : 'text-sm'
                    }`}>Start your journey</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Begin tracking your mental wellness today!</p>
                  </div>
                </Flex>
              </ResponsiveCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
