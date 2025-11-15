import React from 'react';
import { translations } from '../lib/translations';

type TranslationBundle = typeof translations[keyof typeof translations];

interface AboutViewProps {
  T: TranslationBundle;
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ T, onBack }) => {
  const values = T.ui.aboutView.valuesList || [];

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="space-y-6 px-4 pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-full px-2 py-1"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {T.ui.aboutView.backButton}
          </button>
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T.ui.aboutView.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{T.ui.aboutView.intro}</p>
        </header>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 shadow-sm p-5 space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {T.ui.aboutView.missionTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{T.ui.aboutView.missionBody}</p>
          </section>

          <section className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 shadow-sm p-5 space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {T.ui.aboutView.valuesTitle}
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {values.map((value, index) => (
                <li key={`value-${index}`} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0"></span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 shadow-sm p-5 space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {T.ui.aboutView.storyTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{T.ui.aboutView.storyBody}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
