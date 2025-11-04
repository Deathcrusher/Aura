import React from 'react';

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Zm0 12a5 5 0 0 1-5-5V5a5 5 0 0 1 10 0v6a5 5 0 0 1-5 5Z" />
    <path d="M12 18.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5ZM8 21.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Z" />
    <path d="M15 15a1 1 0 0 1 1 1v.393a7.001 7.001 0 0 1-8 0V16a1 1 0 1 1 2 0v.107a5.002 5.002 0 0 0 4 0V16a1 1 0 0 1 1-1Z" />
  </svg>
);

export const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 6h12v12H6z" />
  </svg>
);

const AURA_AVATAR_BASE64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/2wBDAQICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICD/wAARCAEgASADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EABwQAQEBAAMBAQEAAAAAAAAAAAABEQISIUFRgf/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A8qKigioCoKgqCoKgqAqCoKgoiioKqKigioKIIoigioKIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqCoKgqAqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqCoKgqAqCoKgqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgqCoKgqCoKgioKgqCoKgqAqCoKgqCoKgioKgqCoKgqAqCoKgqCoKIIoigiAqCoKIIoigiAqCoKgqCoKgqAqCoKgqCoKIKgqCoKgqCoKgqCoKgq";

export const AuraHumanAvatar: React.FC<{ className?: string }> = ({ className }) => (
    <img src={AURA_AVATAR_BASE64} alt="Aura, your AI therapist" className={`rounded-full object-cover ${className}`} />
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>
);

export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
);

export const GoalsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
);

export const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
);

export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`animate-spin ${className}`}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const LogOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
);

export const JournalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
    </svg>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
    </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8 5v14l11-7z"/>
    </svg>
);

export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
    </svg>
);