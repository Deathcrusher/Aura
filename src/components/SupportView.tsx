import React from 'react';
import { translations } from '../lib/translations';

type TranslationBundle = typeof translations[keyof typeof translations];

interface SupportViewProps {
  T: TranslationBundle;
  onBack: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ T, onBack }) => {
  const items = T.ui.supportView.faqList || [];

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
            {T.ui.supportView.backButton}
          </button>
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {T.ui.supportView.updated}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T.ui.supportView.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{T.ui.supportView.intro}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {T.ui.supportView.contactTitle}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{T.ui.supportView.contactBody}</p>
          <div className="grid gap-3">
            <a
              href={`mailto:${T.ui.supportView.emailValue}`}
              className="flex items-center justify-between rounded-2xl border border-violet-200/70 bg-violet-50/70 dark:border-violet-500/20 dark:bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-800 dark:text-violet-200 hover:bg-violet-100 transition-colors"
            >
              <span>
                {T.ui.supportView.emailLabel}
                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{T.ui.supportView.emailValue}</span>
              </span>
              <span>{T.ui.supportView.emailCTA}</span>
            </a>
            <a
              href={`tel:${T.ui.supportView.phoneValue}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <span>
                {T.ui.supportView.phoneLabel}
                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{T.ui.supportView.phoneValue}</span>
              </span>
              <span>{T.ui.supportView.phoneCTA}</span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {T.ui.supportView.faqLabel}
          </h2>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {items.map((item, index) => (
              <li key={`support-item-${index}`} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
