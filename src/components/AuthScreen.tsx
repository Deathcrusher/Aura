import React, { useEffect, useState } from 'react';
import { AuraHumanAvatar } from './Icons';

interface AuthScreenProps {
    onSignIn: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string) => Promise<void>;
    loading: boolean;
    error: string | null;
    T: any;
    initialMode?: 'signup' | 'login';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp, loading, error, T, initialMode }) => {
    const [isSignUp, setIsSignUp] = useState(initialMode !== 'login');
    useEffect(() => {
        if (initialMode) {
            setIsSignUp(initialMode !== 'login');
        }
    }, [initialMode]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            if (isSignUp) {
                await onSignUp(email, password);
            } else {
                await onSignIn(email, password);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-fade-in bg-[linear-gradient(135deg,#E6E6FA_0%,#ADD8E6_50%,#FFB6C1_100%)] dark:bg-[#161022]">
            <div className="w-full max-w-sm mx-auto text-center">
                <AuraHumanAvatar className="w-24 h-24 mx-auto mb-6 animate-logo-breathe" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {isSignUp ? T.ui.auth.signUpTitle : T.ui.auth.loginTitle}
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {isSignUp ? T.ui.auth.signUpSubtitle : T.ui.auth.loginSubtitle}
                </p>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/80 dark:bg-slate-700/80 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee]"
                            placeholder={T.ui.auth.emailPlaceholder}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/80 dark:bg-slate-700/80 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee]"
                            placeholder={T.ui.auth.passwordPlaceholder}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-8 py-3 bg-[#6c2bee] text-white rounded-lg font-semibold hover:bg-[#5a22cc] transition-colors shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Lädt...' : (isSignUp ? T.ui.auth.signUpButton : T.ui.auth.loginButton)}
                    </button>
                </form>

                <p className="mt-6 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                        {isSignUp ? T.ui.auth.haveAccount : T.ui.auth.noAccount}
                    </span>
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-[#483d8b] dark:text-violet-300 hover:underline ml-1" disabled={loading}>
                        {isSignUp ? T.ui.auth.loginLink : T.ui.auth.signUpLink}
                    </button>
                </p>
            </div>
        </div>
    );
};
