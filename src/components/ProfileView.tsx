import React from 'react';
import { UserProfile } from '../types';
import { translations } from '../lib/translations';

interface ProfileViewProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onLogout?: () => void;
  T: typeof translations['de-DE'];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onOpenProfile,
  onLogout,
  T
}) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8] dark:bg-[#161022]">
      {/* Top App Bar */}
      <header className="flex items-center bg-[#f6f6f8] dark:bg-[#161022] px-4 pt-4 pb-2">
        <div className="flex size-10 shrink-0 items-center justify-center" />
        <h1 className="flex-1 text-center text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <div className="flex size-10 shrink-0 items-center justify-center" />
      </header>

      <main className="flex-1 pb-28">
        {/* Account Information Section */}
        <section className="mt-4">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Account Information
          </h2>
          <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
            <button 
              onClick={onOpenProfile}
              className="w-full text-left"
            >
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                    Manage Account
                  </p>
                </div>
                <div className="shrink-0">
                  <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
            <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  Subscription
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

        {/* Notifications Section */}
        <section className="mt-6">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Notifications
          </h2>
          <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  Push Notifications
                </p>
              </div>
              <div className="shrink-0">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input checked className="peer sr-only" type="checkbox" />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#6c2bee] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-slate-600 dark:bg-slate-700" />
                </label>
              </div>
            </div>
            <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
            <div className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  Email Notifications
                </p>
              </div>
              <div className="shrink-0">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#6c2bee] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-slate-600 dark:bg-slate-700" />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Settings Section */}
        <section className="mt-6">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Privacy Settings
          </h2>
          <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  Data & Privacy Policy
                </p>
              </div>
              <div className="shrink-0">
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  Clear Chat History
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

        {/* Help & Support Section */}
        <section className="mt-6">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Help & Support
          </h2>
          <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  FAQ
                </p>
              </div>
              <div className="shrink-0">
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  Contact Support
                </p>
              </div>
              <div className="shrink-0">
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <hr className="border-slate-200/80 dark:border-slate-800/60 ml-16" />
            <div className="flex items-center gap-4 px-4 py-3.5">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#6c2bee]/10 text-[#6c2bee]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="flex-1 truncate text-base font-medium leading-normal text-slate-800 dark:text-slate-200">
                  About AURA
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
          <section className="mt-8">
            <div className="mx-2 overflow-hidden rounded-xl bg-white dark:bg-slate-900/40">
              <button onClick={onLogout} className="w-full text-left">
                <div className="flex items-center gap-4 px-4 py-3.5">
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <p className="flex-1 truncate text-base font-medium leading-normal text-red-500">
                      Log Out
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
