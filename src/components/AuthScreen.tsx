import React, { useEffect, useState } from 'react';
import { AuraHumanAvatar } from './Icons';

interface AuthScreenProps {
    onSignIn: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string) => Promise<void>;
    onSignInWithGoogle: () => Promise<void>;
    loading: boolean;
    error: string | null;
    T: any;
    initialMode?: 'signup' | 'login';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, onSignUp, onSignInWithGoogle, loading, error, T, initialMode }) => {
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

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[linear-gradient(135deg,#E6E6FA_0%,#ADD8E6_50%,#FFB6C1_100%)] dark:bg-[#161022] text-slate-600 dark:text-slate-400">
                                {T.ui.auth.orContinueWith}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onSignInWithGoogle}
                        disabled={loading}
                        className="mt-4 w-full px-8 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-lg border border-slate-300 dark:border-slate-600 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {T.ui.auth.signInWithGoogle}
                    </button>
                </div>

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
