import React from 'react';
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

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {T.ui.sidebar.journal}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {T.ui.journalModal.subtitle}
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={onOpenJournal}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6c2bee] text-white rounded-lg hover:bg-[#5a22cc] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>{T.ui.journalModal.title}</span>
        </button>
      </div>

      {journalEntries.length > 0 ? (
        <div className="space-y-4">
          {journalEntries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(entry.createdAt).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
            Noch keine Einträge
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Beginne mit dem Schreiben deiner ersten Einträge
          </p>
          <button
            onClick={onOpenJournal}
            className="px-4 py-2 bg-[#6c2bee] text-white rounded-lg hover:bg-[#5a22cc] transition-colors"
          >
            {T.ui.journalModal.title}
          </button>
        </div>
      )}
    </div>
  );
};