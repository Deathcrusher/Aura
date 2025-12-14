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

export const AuthScreen: React.FC<AuthScreenProps> = ({
    onSignIn,
    onSignUp,
    onSignInWithGoogle,
    loading,
    error,
    T,
    initialMode,
}) => {
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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 font-['Manrope'] relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
                <div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: '1s' }}
                ></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-violet-300/10 dark:bg-violet-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto text-center glass rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-500/10">
                <AuraHumanAvatar className="w-24 h-24 mx-auto mb-6" />
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white mb-2">
                    {isSignUp ? T.ui.auth.signUpTitle : T.ui.auth.loginTitle}
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
                    {isSignUp ? T.ui.auth.signUpSubtitle : T.ui.auth.loginSubtitle}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-800 dark:text-red-200 text-sm text-left">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-white text-base placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                            placeholder={T.ui.auth.emailPlaceholder}
                            required
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-white text-base placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                            placeholder={T.ui.auth.passwordPlaceholder}
                            required
                            disabled={loading}
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-base shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Lädt...' : (isSignUp ? T.ui.auth.signUpButton : T.ui.auth.loginButton)}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200/70 dark:border-slate-600/70"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white/60 dark:bg-slate-900/40 backdrop-blur text-slate-600 dark:text-slate-400 rounded-full">
                                {T.ui.auth.orContinueWith}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onSignInWithGoogle}
                        disabled={loading}
                        className="mt-6 w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {T.ui.auth.signInWithGoogle}
                    </button>
                </div>

                <p className="mt-8 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                        {isSignUp ? T.ui.auth.haveAccount : T.ui.auth.noAccount}
                    </span>
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline ml-2 transition-colors"
                        disabled={loading}
                        type="button"
                    >
                        {isSignUp ? T.ui.auth.loginLink : T.ui.auth.signUpLink}
                    </button>
                </p>
            </div>
        </div>
    );
};
