

import React from 'react';
import ThemeToggle from './ThemeToggle';
import { View, User } from '../types';
import Button from './ui/Button';
import { BackIcon } from './icons/BackIcon';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
    currentUser: User | null;
    onLogout: () => void;
    onGoHome: () => void;
    currentView: View;
    onBack: () => void;
    onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onGoHome, currentView, onBack, onToggleMobileMenu }) => {
    const canGoBack = !['home', 'login', 'admin-dashboard'].includes(currentView);
    
    return (
        <header className="bg-card shadow-custom-sm p-4 flex justify-between items-center z-20 flex-shrink-0 border-b border-border">
            <div className="flex items-center gap-2 sm:gap-4">
                 <button onClick={onToggleMobileMenu} className="p-2 md:hidden rounded-full hover:bg-secondary">
                    <MenuIcon />
                </button>
                 {canGoBack && (
                    <Button onClick={onBack} variant="secondary" size="sm" className="hidden sm:inline-flex">
                        <BackIcon />
                        <span className="ml-1.5">Kembali</span>
                    </Button>
                )}
                <h1 onClick={onGoHome} className="text-xl font-bold text-text-primary cursor-pointer">
                    <span className="text-accent">SkripGen</span> 3.0
                </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <ThemeToggle />
                {currentUser ? (
                    <>
                        <span className="text-sm text-text-secondary hidden sm:block">Selamat datang, {currentUser.username}!</span>
                        <Button
                            onClick={onLogout}
                            variant="secondary"
                            size="sm"
                        >
                            Logout
                        </Button>
                    </>
                ) : null }
            </div>
        </header>
    );
};