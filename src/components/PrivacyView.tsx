import React from 'react';
import { translations } from '../lib/translations';

type TranslationBundle = typeof translations[keyof typeof translations];

interface PrivacyViewProps {
  T: TranslationBundle;
  onBack: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ T, onBack }) => {
  const sections = [
    {
      title: T.ui.privacyView.sectionCollectedTitle,
      body: T.ui.privacyView.sectionCollectedBody,
      bullets: T.ui.privacyView.sectionCollectedPoints,
    },
    {
      title: T.ui.privacyView.sectionUsageTitle,
      body: T.ui.privacyView.sectionUsageBody,
      bullets: T.ui.privacyView.sectionUsagePoints,
    },
    {
      title: T.ui.privacyView.sectionSharingTitle,
      body: T.ui.privacyView.sectionSharingBody,
      bullets: T.ui.privacyView.sectionSharingPoints,
    },
    {
      title: T.ui.privacyView.sectionSecurityTitle,
      body: T.ui.privacyView.sectionSecurityBody,
      bullets: T.ui.privacyView.sectionSecurityPoints,
    },
    {
      title: T.ui.privacyView.sectionRightsTitle,
      body: T.ui.privacyView.sectionRightsBody,
    },
  ];

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
            {T.ui.privacyView.backButton}
          </button>
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {T.ui.privacyView.updated}
          </span>
        </div>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{T.ui.privacyView.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {T.ui.privacyView.intro}
          </p>
        </header>

        <div className="space-y-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 shadow-sm p-5"
            >
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.body}</p>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300 pl-4">
                  {section.bullets.map((point, index) => (
                    <li key={`${section.title}-${index}`} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{T.ui.privacyView.sectionContactTitle}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{T.ui.privacyView.sectionContactBody}</p>
          <a
            href={`mailto:${T.ui.privacyView.contactEmail}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-300 hover:underline"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            <span>{T.ui.privacyView.contactButton}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">({T.ui.privacyView.contactEmail})</span>
          </a>
        </div>
      </div>
    </div>
  );
};
