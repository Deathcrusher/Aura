import React from 'react';
import { SubscriptionPlan, ViewType } from '../types';
import { XIcon, SparklesIcon, CheckCircleIcon } from './Icons';
import { BottomNavigation } from './BottomNavigation';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    subscription: { plan: SubscriptionPlan, expiryDate?: number };
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
    T: any;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade, subscription, currentView, onNavigate, T }) => {
    if (!isOpen) return null;

    const isPremium = subscription.plan === SubscriptionPlan.PREMIUM;
    const expiryDate = subscription.expiryDate ? new Date(subscription.expiryDate) : null;
    const isFreeTrialUsed = !isPremium && subscription.plan === SubscriptionPlan.FREE;


    const features = [
        { name: T.ui.subscription.featureBasic, free: true, premium: true },
        { name: T.ui.subscription.featureJournal, free: true, premium: true },
        { name: T.ui.subscription.featureGoals, free: true, premium: true },
        { name: T.ui.subscription.featureMood, free: true, premium: true },
        { name: T.ui.subscription.featureThemes, free: false, premium: true },
        { name: T.ui.subscription.featurePatterns, free: false, premium: true },
        { name: T.ui.subscription.featureTrends, free: false, premium: true },
        { name: T.ui.subscription.featureCloud, free: false, premium: true },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center bg-white dark:bg-slate-800 p-4 pb-2 justify-between sticky top-0 z-10 border-b border-white/10">
                  <button 
                    onClick={onClose}
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#6c2bee]/20 text-[#6c2bee] dark:text-violet-300"
                    aria-label={T.ui.cancel}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{isFreeTrialUsed ? T.ui.subscription.freeTrialEndedTitle : T.ui.subscription.title}</h1>
                  <div className="flex w-12 items-center justify-end">
                    <button onClick={onClose} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-slate-900 dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                      <svg className="w-6 h-6 text-slate-500 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isPremium && expiryDate && (
                        <div className="mb-6 p-4 text-center bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded-lg">
                            <h3 className="font-semibold text-green-800 dark:text-green-200">{T.ui.subscription.currentPlan} Aura Premium</h3>
                            <p className="text-sm text-green-600 dark:text-green-300">{T.ui.subscription.planExpires} {expiryDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.name}</span>
                                <div className="flex items-center gap-8">
                                    <span className="w-12 text-center">{feature.free ? <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto"/> : <XIcon className="w-5 h-5 text-slate-400 mx-auto"/>}</span>
                                    <span className="w-12 text-center">{feature.premium ? <CheckCircleIcon className="w-5 h-5 text-yellow-500 mx-auto"/> : '-'}</span>
                                </div>
                            </div>
                        ))}
                         <div className="flex items-center justify-between p-3 rounded-lg">
                            <span className="text-sm font-medium"></span>
                            <div className="flex items-center gap-8">
                                <span className="w-12 text-center font-bold text-slate-700 dark:text-slate-300">{T.ui.subscription.free}</span>
                                <span className="w-12 text-center font-bold text-yellow-500">{T.ui.subscription.premium}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={isPremium ? onClose : onUpgrade}
                    disabled={isPremium}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 px-6 bg-[#6c2bee] text-white shadow-lg shadow-[#6c2bee]/30 hover:bg-[#5a22d6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">workspace_premium</span>
                    <span>{isPremium ? T.ui.subscription.manage : T.ui.subscription.upgradeButton}</span>
                  </button>
                  {!isPremium && (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                      {T.ui.subscription.checkout}
                    </p>
                  )}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="sticky bottom-0 w-full max-w-lg mx-auto rounded-b-2xl overflow-hidden">
                  <BottomNavigation 
                    currentView={currentView} 
                    onNavigate={(view) => {
                      onNavigate(view);
                      onClose(); // Close modal when navigating
                    }}
                  />
                </div>
            </div>
        </div>
    );
};
