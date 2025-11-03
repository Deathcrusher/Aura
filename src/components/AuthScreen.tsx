import React, { useState } from 'react';
import { AuraHumanAvatar } from './Icons';

interface AuthScreenProps {
    onAuth: (email: string, isSignUp: boolean) => void;
    T: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth, T }) => {
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            onAuth(email, isSignUp);
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-100 to-blue-100 dark:from-slate-900 dark:to-slate-800 z-50 flex flex-col items-center justify-center p-4 animate-fade-in animate-background-pan">
            <div className="w-full max-w-sm mx-auto text-center">
                <AuraHumanAvatar className="w-24 h-24 mx-auto mb-6 animate-logo-breathe" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {isSignUp ? T.ui.auth.signUpTitle : T.ui.auth.loginTitle}
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {isSignUp ? T.ui.auth.signUpSubtitle : T.ui.auth.loginSubtitle}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/80 dark:bg-slate-700/80 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={T.ui.auth.emailPlaceholder}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/80 dark:bg-slate-700/80 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={T.ui.auth.passwordPlaceholder}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isSignUp ? T.ui.auth.signUpButton : T.ui.auth.loginButton}
                    </button>
                </form>

                <p className="mt-6 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                        {isSignUp ? T.ui.auth.haveAccount : T.ui.auth.noAccount}
                    </span>
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline ml-1">
                        {isSignUp ? T.ui.auth.loginLink : T.ui.auth.signUpLink}
                    </button>
                </p>
            </div>
        </div>
    );
};
