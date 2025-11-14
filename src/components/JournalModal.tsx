import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { XIcon, LightbulbIcon, TrashIcon } from './Icons';
import { BottomNavigation, ViewType } from './BottomNavigation';

interface JournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
    onDelete: (entryId: string) => void;
    entry: JournalEntry | null;
    currentView: ViewType;
    onNavigate: (view: ViewType) => void;
    T: any; // Translation object
}

export const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, onSave, onDelete, entry, currentView, onNavigate, T }) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (isOpen) {
            setContent(entry?.content || '');
        }
    }, [entry, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!content.trim()) return;
        onSave({ content });
    };

    const handleDelete = () => {
        if(entry && window.confirm(T.ui.journalModal.deleteConfirm)) {
            onDelete(entry.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
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
                  <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{entry ? T.ui.journalModal.editTitle : T.ui.journalModal.title}</h1>
                  <div className="flex w-12 items-center justify-end">
                    <button onClick={onClose} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-slate-900 dark:text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
                      <svg className="w-6 h-6 text-slate-500 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto">
                    <div className="flex-1 flex flex-col">
                         <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6c2bee] resize-none"
                            placeholder={T.ui.journalModal.placeholder}
                        />
                    </div>
                    {entry?.insights && (
                        <div className="md:w-1/3 md:border-l md:pl-6 border-slate-200 dark:border-slate-700">
                             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <LightbulbIcon className="w-5 h-5 text-[#6c2bee]"/>
                                {T.ui.journalModal.insightsTitle}
                            </h3>
                            <div className="space-y-4">
                                {entry.insights.keyThemes?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{T.ui.journalModal.keyThemes}</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {entry.insights.keyThemes.map((theme, i) => <li key={i} className="text-sm text-slate-700 dark:text-slate-400">{theme}</li>)}
                                    </ul>
                                </div>
                                )}
                                {entry.insights.positiveNotes?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{T.ui.journalModal.positiveNotes}</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {entry.insights.positiveNotes.map((note, i) => <li key={i} className="text-sm text-slate-700 dark:text-slate-400">{note}</li>)}
                                    </ul>
                                </div>
                                )}
                            </div>
                        </div>
                    )}
                     {!entry?.insights && entry && (
                        <div className="md:w-1/3 md:border-l md:pl-6 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{T.ui.journalModal.insightsLoading}</p>
                        </div>
                    )}
                </div>
                <div className="px-6 pb-6 flex flex-col gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!content.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 px-6 bg-[#6c2bee] text-white shadow-lg shadow-[#6c2bee]/30 hover:bg-[#5a22d6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>{T.ui.journalModal.save}</span>
                  </button>
                  {entry && (
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl h-12 px-6 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-500/20 transition-all duration-200 font-semibold"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      <span>{T.ui.journalModal.delete}</span>
                    </button>
                  )}
                </div>

                {/* Bottom Navigation Bar */}
                <div className="sticky bottom-0 w-full max-w-2xl mx-auto rounded-b-2xl overflow-hidden mt-auto">
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
