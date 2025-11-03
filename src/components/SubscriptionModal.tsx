import React from 'react';
import { SubscriptionPlan } from '../types';
import { XIcon, SparklesIcon, CheckCircleIcon } from './Icons';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    subscription: { plan: SubscriptionPlan, expiryDate?: number };
    T: any;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade, subscription, T }) => {
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
                <div className="p-6 text-center border-b border-slate-200 dark:border-slate-700/50">
                    <SparklesIcon className="w-12 h-12 text-yellow-500 mx-auto mb-2"/>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isFreeTrialUsed ? T.ui.subscription.freeTrialEndedTitle : T.ui.subscription.title}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                         {isFreeTrialUsed ? T.ui.subscription.freeTrialEndedSubtitle : T.ui.subscription.subtitle}
                    </p>
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

                {!isPremium && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                        <div className='text-center mb-4'>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{T.ui.subscription.price}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{T.ui.subscription.checkout}</p>
                        </div>
                        <button
                            onClick={onUpgrade}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform hover:scale-[1.02] shadow-lg"
                        >
                            <SparklesIcon className="w-6 h-6"/>
                            <span>{T.ui.subscription.upgradeButton}</span>
                        </button>
                    </div>
                )}


                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <XIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>
        </div>
    );
};