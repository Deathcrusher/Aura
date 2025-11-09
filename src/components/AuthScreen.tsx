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
        <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 animate-fade-in"
            style={{
                background: 'linear-gradient(135deg, #E6E6FA 0%, #ADD8E6 50%, #FFB6C1 100%)',
                fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
            {/* Subtle Background Pattern for Desktop */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(108, 43, 238, 0.3) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 80%, rgba(108, 43, 238, 0.2) 0%, transparent 50%),
                                 radial-gradient(circle at 40% 20%, rgba(173, 216, 230, 0.3) 0%, transparent 50%)`
            }} />
            
            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <AuraHumanAvatar className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 animate-logo-breathe drop-shadow-lg" />
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {isSignUp ? T.ui.auth.signUpTitle : T.ui.auth.loginTitle}
                    </h1>
                    <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                        {isSignUp ? T.ui.auth.signUpSubtitle : T.ui.auth.loginSubtitle}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl text-red-800 dark:text-red-200 text-sm font-medium animate-fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 text-base bg-white dark:bg-[#1f1c27] rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6c2bee] focus:border-transparent transition-all"
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
                            className="w-full px-5 py-4 text-base bg-white dark:bg-[#1f1c27] rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6c2bee] focus:border-transparent transition-all"
                            placeholder={T.ui.auth.passwordPlaceholder}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full h-14 md:h-16 px-6 bg-[#6c2bee] text-white text-lg rounded-xl font-bold hover:bg-[#5a22cc] transition-all duration-300 shadow-xl shadow-[#6c2bee]/40 hover:shadow-2xl hover:shadow-[#6c2bee]/50 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                        disabled={loading}
                    >
                        {loading ? 'Lädt...' : (isSignUp ? T.ui.auth.signUpButton : T.ui.auth.loginButton)}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-slate-300 dark:border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-gradient-to-r from-[#E6E6FA] via-[#ADD8E6] to-[#FFB6C1] text-slate-600 dark:text-slate-300 font-medium">
                                {T.ui.auth.orContinueWith}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onSignInWithGoogle}
                        disabled={loading}
                        className="mt-6 w-full h-14 px-6 bg-white dark:bg-[#1f1c27] text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 shadow-lg border-2 border-slate-200 dark:border-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

                <p className="mt-8 text-center text-sm md:text-base">
                    <span className="text-slate-600 dark:text-slate-300">
                        {isSignUp ? T.ui.auth.haveAccount : T.ui.auth.noAccount}
                    </span>
                    <button 
                        onClick={() => setIsSignUp(!isSignUp)} 
                        className="font-bold text-[#483d8b] dark:text-violet-300 hover:underline underline-offset-2 ml-1 transition-colors" 
                        disabled={loading}
                    >
                        {isSignUp ? T.ui.auth.loginLink : T.ui.auth.signUpLink}
                    </button>
                </p>
            </div>
        </div>
    );
};
