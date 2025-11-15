import React from 'react';
import { translations } from '../lib/translations';

type TranslationBundle = typeof translations[keyof typeof translations];

interface FAQViewProps {
  T: TranslationBundle;
  onBack: () => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ T, onBack }) => {
  const entries = T.ui.faqView.questionList || [];

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
            {T.ui.faqView.backButton}
          </button>
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {T.ui.faqView.updated}
          </span>
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T.ui.faqView.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{T.ui.faqView.intro}</p>
        </header>

        <div className="space-y-4">
          {entries.map((entry, index) => (
            <article
              key={`faq-${index}`}
              className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 shadow-sm p-5"
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{entry.question}</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{entry.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
