import React from 'react';
import { UserProfile, SubscriptionPlan } from '../types';
import { translations } from '../lib/translations';

interface ProfileViewProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenSubscription?: () => void;
  onOpenPrivacy?: () => void;
  onOpenSupport?: () => void;
  onOpenFAQ?: () => void;
  onLogout?: () => void;
  T: typeof translations['de-DE'];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onOpenProfile,
  onOpenSubscription,
  onOpenPrivacy,
  onOpenFAQ,
  onOpenSupport,
  onLogout,
  T
}) => {
  const isPremium = userProfile.subscription.plan === SubscriptionPlan.PREMIUM;
  const privacyCard = (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
          <span className="material-symbols-outlined text-2xl">shield_person</span>
        </div>
        <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
          {T.ui.profileView?.dataPrivacy || 'Daten & Datenschutzrichtlinie'}
        </p>
      </div>
      <div className="shrink-0">
        <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
  const faqCard = (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
          <span className="material-symbols-outlined text-2xl">help</span>
        </div>
        <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
          {T.ui.profileView?.faq || 'FAQ'}
        </p>
      </div>
      <div className="shrink-0">
        <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
  const supportCard = (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
          <span className="material-symbols-outlined text-2xl">support_agent</span>
        </div>
        <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
          {T.ui.profileView?.contactSupport || 'Support kontaktieren'}
        </p>
      </div>
      <div className="shrink-0">
        <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-1 w-full flex-col bg-[#f6f6f8] dark:bg-[#161022] overflow-hidden min-h-0">
      {/* Top App Bar */}
      <header className="flex items-center bg-[#f6f6f8] dark:bg-[#161022] px-4 pt-4 pb-2 sticky top-0 z-10 shrink-0">
        <div className="flex size-12 shrink-0 items-center justify-center" />
        <h1 className="flex-1 text-center text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          {T.ui.sidebar.profile}
        </h1>
        <div className="flex size-12 shrink-0 items-center justify-center" />
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        {/* Profile Header */}
        <section className="mt-4 px-4">
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/40 rounded-xl">
            <div className="relative">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-16 h-16 rounded-full object-cover bg-slate-200 dark:bg-slate-600 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-[#6c2bee]"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{userProfile.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isPremium ? 'Aura Premium' : 'Aura Free'}
              </p>
            </div>
          </div>
        </section>

        {/* Account Information Section */}
        <section className="mt-6">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {T.ui.profileView?.accountInformation || 'Kontoinformationen'}
          </h2>
          <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
            <button 
              onClick={onOpenProfile}
              className="w-full text-left"
            >
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                    <span className="material-symbols-outlined text-2xl">person</span>
                  </div>
                  <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                    {T.ui.profileView?.manageAccount || 'Konto verwalten'}
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="material-symbols-outlined text-2xl text-slate-400 dark:text-slate-500">chevron_right</span>
                </div>
              </div>
            </button>
            {onOpenSubscription && (
              <>
                <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
                <button 
                  onClick={onOpenSubscription}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <div className="flex flex-1 items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                    <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                  </div>
                      <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                        {T.ui.subscription.manage || T.ui.subscription.upgrade}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </section>

        {/* Privacy Settings Section */}
        <section className="mt-6">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {T.ui.profileView?.privacySettings || 'Datenschutz'}
          </h2>
          <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
            {onOpenPrivacy ? (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c2bee]"
              >
                {privacyCard}
              </button>
            ) : (
              privacyCard
            )}
          </div>
        </section>

        {/* Help & Support Section */}
        <section className="mt-6">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {T.ui.profileView?.helpSupport || 'Hilfe & Support'}
          </h2>
          <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
            {onOpenFAQ ? (
              <button
                type="button"
                onClick={onOpenFAQ}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c2bee]"
              >
                {faqCard}
              </button>
            ) : (
              faqCard
            )}
            <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
            {onOpenSupport ? (
              <button
                type="button"
                onClick={onOpenSupport}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c2bee]"
              >
                {supportCard}
              </button>
            ) : (
              supportCard
            )}
            <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <span className="material-symbols-outlined text-2xl">info</span>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  {T.ui.profileView?.aboutAura || 'Über Aura'}
                </p>
              </div>
              <div className="shrink-0">
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Log Out Section */}
        {onLogout && (
          <section className="mt-8 mb-6">
            <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
              <button onClick={onLogout} className="w-full text-left">
                <div className="flex items-center gap-4 px-4 py-3.5">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                      <span className="material-symbols-outlined text-2xl">logout</span>
                    </div>
                    <p className="flex-1 truncate text-base font-medium leading-normal text-red-500">
                      {T.ui.sidebar.logout}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
