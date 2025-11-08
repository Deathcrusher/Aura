import React from 'react';
import { UserProfile } from '../types';
import { translations } from '../lib/translations';

interface ProfileViewProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  T: typeof translations['de-DE'];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onOpenProfile,
  T
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {T.ui.sidebar.profile}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {T.ui.profileModal.subtitle}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-4">
            <span className="text-2xl text-white font-bold">
              {userProfile.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {userProfile.name}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {userProfile.subscription.plan === 'premium' ? 'Premium' : 'Free'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {T.ui.profileModal.languageLabel}
            </h3>
            <p className="text-slate-900 dark:text-white">
              {userProfile.language === 'de-DE' ? 'Deutsch' : 'Englisch'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {T.ui.profileModal.voiceLabel}
            </h3>
            <p className="text-slate-900 dark:text-white">
              {userProfile.voice}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mitglied seit
            </h3>
            <p className="text-slate-900 dark:text-white">
              {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <span className="text-slate-900 dark:text-white">
            {T.ui.profileModal.title}
          </span>
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <button
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <span className="text-slate-900 dark:text-white">
            Benachrichtigungen
          </span>
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <button
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <span className="text-slate-900 dark:text-white">
            Datenschutz & Sicherheit
          </span>
          <svg className="w-5 h-5 text-slate-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <button
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <span className="text-slate-900 dark:text-white">
            Hilfe & Support
          </span>
          <svg className="w-5 h-5 text-slate-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};