import React, { useState, useEffect } from 'react';
import { UserProfile, AVAILABLE_LANGUAGES, AVAILABLE_VOICES } from '../types';
import { PlayIcon, AuraHumanAvatar, ChatBubbleIcon, ChartBarIcon, GoalsIcon, HeartIcon } from './Icons';

interface OnboardingProps {
    defaultProfile: UserProfile;
    onComplete: (profile: UserProfile) => void;
    onPreviewVoice: (voiceId: string, language: string) => void;
    translations: any;
}

const TOTAL_STEPS = 4;

export const Onboarding: React.FC<OnboardingProps> = ({ defaultProfile, onComplete, onPreviewVoice, translations }) => {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Update profile when defaultProfile changes (e.g., after login)
    useEffect(() => {
        if (defaultProfile.name && defaultProfile.name !== 'User') {
            setProfile(prev => ({ ...prev, name: defaultProfile.name }));
        }
    }, [defaultProfile.name]);

    const T = translations[profile.language as keyof typeof translations] || translations['de-DE'];

    const changeStep = (newStep: number) => {
        setIsFadingOut(true);
        setTimeout(() => {
            setStep(newStep);
            setIsFadingOut(false);
        }, 300); // Match animation duration
    };

    const nextStep = () => {
        if (step < TOTAL_STEPS - 1) {
            changeStep(step + 1);
        } else {
            console.log('🎯 Onboarding finished - calling onComplete with profile:', {
                name: profile.name,
                voice: profile.voice,
                language: profile.language,
                onboardingCompleted: profile.onboardingCompleted
            });
            onComplete(profile);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            changeStep(step - 1);
        }
    };

    const renderStepContent = () => {
        const contentClass = `transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`;
        
        switch (step) {
            case 0: // Welcome
                return (
                    <div className={contentClass}>
                        <AuraHumanAvatar className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-8"/>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{T.ui.onboarding.welcomeTitle}</h1>
                        <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">{T.ui.onboarding.welcomeSubtitle}</p>
                    </div>
                );
            case 1: // Name
                return (
                     <div className={contentClass}>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{T.ui.onboarding.nameTitle}</h1>
                        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.nameSubtitle}</p>
                        <input
                            type="text"
                            value={profile.name === 'User' ? '' : profile.name}
                            onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                            className="w-full max-w-sm mt-10 px-5 py-4 text-base bg-white dark:bg-[#1f1c27] rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6c2bee] focus:border-transparent transition-all"
                            placeholder={T.ui.onboarding.namePlaceholder}
                            autoFocus
                        />
                    </div>
                );
            case 2: // Language & Voice
                return (
                    <div className={contentClass}>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{T.ui.onboarding.languageVoiceTitle}</h1>
                        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-sm mx-auto">{T.ui.onboarding.languageVoiceSubtitle}</p>
                        <div className="mt-8 space-y-6 w-full max-w-sm mx-auto text-left">
                            <div>
                                <label htmlFor="language" className="block text-base font-bold text-slate-800 dark:text-white mb-3">{T.ui.onboarding.languageLabel}</label>
                                <select 
                                    id="language" 
                                    value={profile.language} 
                                    onChange={(e) => setProfile(p => ({ ...p, language: e.target.value }))} 
                                    className="w-full px-4 py-3 text-base bg-white dark:bg-[#1f1c27] rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6c2bee] focus:border-transparent transition-all"
                                >
                                    {AVAILABLE_LANGUAGES.map(lang => (<option key={lang.id} value={lang.id}>{lang.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">{T.ui.onboarding.voiceLabel}</h3>
                                <div className="space-y-3">
                                    {AVAILABLE_VOICES.map(voice => {
                                        const genderMarker = T.ui.voiceGenderMarker[voice.gender];
                                        return (
                                            <div 
                                                key={voice.id} 
                                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                                    profile.voice === voice.id 
                                                        ? 'bg-[#6c2bee]/10 border-[#6c2bee] ring-2 ring-[#6c2bee]/50 dark:bg-[#6c2bee]/20' 
                                                        : 'bg-white dark:bg-[#1f1c27] border-slate-200 dark:border-slate-700 hover:border-[#6c2bee]/50'
                                                }`}
                                                onClick={() => setProfile(p => ({ ...p, voice: voice.id }))}
                                            >
                                                <label className="flex items-center cursor-pointer flex-1">
                                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                                        profile.voice === voice.id 
                                                            ? 'bg-[#6c2bee] border-[#6c2bee]' 
                                                            : 'border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                        {profile.voice === voice.id && (
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="ml-3 text-base font-medium text-slate-800 dark:text-white">{voice.name} {genderMarker}</span>
                                                </label>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onPreviewVoice(voice.id, profile.language);
                                                    }} 
                                                    className="ml-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <PlayIcon className="w-5 h-5 text-[#6c2bee]"/>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3: // Features
             const features = [
                { icon: ChatBubbleIcon, title: T.ui.onboarding.featureChat, desc: T.ui.onboarding.featureChatDesc },
                { icon: ChartBarIcon, title: T.ui.onboarding.featureInsights, desc: T.ui.onboarding.featureInsightsDesc },
                { icon: GoalsIcon, title: T.ui.onboarding.featureGoals, desc: T.ui.onboarding.featureGoalsDesc },
                { icon: HeartIcon, title: T.ui.onboarding.featureMood, desc: T.ui.onboarding.featureMoodDesc },
            ];
             return (
                    <div className={contentClass}>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{T.ui.onboarding.featuresTitle}</h1>
                        <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">{T.ui.onboarding.featuresSubtitle}</p>
                        <div className="grid grid-cols-1 gap-4 mt-8 w-full max-w-sm mx-auto">
                            {features.map(f => (
                                <div 
                                    key={f.title} 
                                    className="p-4 bg-white dark:bg-[#1f1c27] rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-start gap-4 transition-all hover:border-[#6c2bee]/50"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#6c2bee]/20 dark:bg-[#6c2bee]/30 rounded-full flex items-center justify-center">
                                      <f.icon className="w-6 h-6 text-[#6c2bee]" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="font-bold text-base text-slate-900 dark:text-white">{f.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-fade-in bg-[#f6f6f8] dark:bg-[#161022]"
            style={{
                fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
            {/* Decorative Shapes - subtle and positioned differently per step */}
            <div 
                className="absolute rounded-full bg-[#6c2bee]/20 blur-3xl transition-all duration-700 ease-in-out pointer-events-none"
                style={{
                    width: '12rem',
                    height: '12rem',
                    top: step === 0 ? '-5%' : step === 1 ? '35%' : step === 2 ? '25%' : '65%',
                    left: step % 2 === 0 ? '-10%' : '-15%',
                }}
            />
            <div 
                className="absolute rounded-full bg-[#6c2bee]/20 blur-3xl transition-all duration-700 ease-in-out pointer-events-none"
                style={{
                    width: '10rem',
                    height: '10rem',
                    bottom: step === 0 ? '20%' : step === 1 ? '5%' : step === 2 ? '15%' : '0%',
                    right: step % 2 === 0 ? '-10%' : '-15%',
                }}
            />
            
            {/* Content Container with Max Width for Desktop */}
            <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-between py-8">
                {/* Progress Indicators at Top */}
                <div className="flex items-center justify-center gap-3 py-5">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                step >= i 
                                    ? 'bg-[#6c2bee] scale-100' 
                                    : 'bg-gray-300 dark:bg-white/20 scale-75'
                            }`}
                        />
                    ))}
                </div>

                {/* Step Content - Centered with flex-grow */}
                <div className="flex-grow flex flex-col justify-center text-center overflow-y-auto px-4">
                    {renderStepContent()}
                </div>
                
                {/* Navigation Buttons at Bottom */}
                <div className="pt-6 pb-2">
                    <div className="flex flex-col items-stretch gap-3">
                        <button 
                            onClick={nextStep} 
                            disabled={step === 1 && (!profile.name || profile.name === 'User')}
                            className="h-12 cursor-pointer rounded-lg bg-[#6c2bee] px-5 text-base font-bold text-white shadow-lg shadow-[#6c2bee]/40 transition-all duration-300 hover:bg-[#5a22cc] hover:shadow-xl disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {step === TOTAL_STEPS - 1 ? T.ui.onboarding.finish : T.ui.onboarding.next}
                        </button>
                        
                        {step > 0 && (
                            <button 
                                onClick={prevStep}
                                className="h-12 cursor-pointer rounded-lg bg-transparent px-5 text-base font-bold text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-white"
                            >
                                {T.ui.onboarding.back}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
