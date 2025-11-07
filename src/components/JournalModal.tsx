import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../types';
import { XIcon, LightbulbIcon, TrashIcon } from './Icons';

interface JournalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
    onDelete: (entryId: string) => void;
    entry: JournalEntry | null;
    T: any; // Translation object
}

export const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, onSave, onDelete, entry, T }) => {
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
                <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{entry ? T.ui.journalModal.editTitle : T.ui.journalModal.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.journalModal.subtitle}</p>
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


                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-between items-center">
                     <div>
                        {entry && (
                             <button onClick={handleDelete} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                            {T.ui.cancel}
                        </button>
                        <button onClick={handleSave} disabled={!content.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-[#6c2bee] rounded-md hover:bg-[#5a22cc] transition-colors disabled:opacity-50">
                            {T.ui.journalModal.save}
                        </button>
                    </div>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <XIcon className="w-5 h-5 text-slate-500" />
                </button>
            </div>
        </div>
    );
};
