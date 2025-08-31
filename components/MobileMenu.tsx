import React from 'react';
import { View, User } from '../types';
import { GenerateIcon } from './icons/GenerateIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { TemplatesIcon } from './icons/TemplatesIcon';
import { HomeIcon } from './icons/HomeIcon';
import { LinkIcon } from './icons/LinkIcon';
import { MagnetIcon } from './icons/MagnetIcon';
import { BrandProfileIcon } from './icons/BrandProfileIcon';
import { CompassIcon } from './icons/CompassIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { HashtagIcon } from './icons/HashtagIcon';
import { FilmIcon } from './icons/FilmIcon';
import { CloseIcon } from './icons/CloseIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { AnalyticsIcon } from './icons/AnalyticsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { SearchTrendingIcon } from './icons/SearchTrendingIcon';
import { ImageEditIcon } from './icons/ImageEditIcon';
import { KeyIcon } from './icons/KeyIcon';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: User | null;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  currentView: View;
  onClick: (view: View) => void;
  children: React.ReactNode;
}> = ({ view, label, currentView, onClick, children }) => {
  const isActive = currentView === view || currentView.startsWith(`${view}-`);
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex items-center w-full px-4 py-3 text-left transition-all duration-200 rounded-custom ${
        isActive
          ? 'bg-primary text-white shadow-custom-md'
          : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
      }`}
    >
      {children}
      <span className="ml-3 font-medium">{label}</span>
    </button>
  );
};


export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, currentView, setCurrentView, currentUser }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-40 md:hidden"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <aside 
        className="fixed inset-y-0 left-0 w-64 bg-card p-4 flex flex-col shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-text-primary">
                <span className="text-accent">SkripGen</span> 3.0
            </h1>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary">
                <CloseIcon />
            </button>
        </div>
        <nav className="space-y-2">
             {currentUser?.role === 'admin' ? (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">Admin Panel</div>
                <NavItem view="admin-dashboard" label="Dashboard" currentView={currentView} onClick={setCurrentView}>
                    <AnalyticsIcon />
                </NavItem>
                <NavItem view="admin-intelligence" label="Intelijen Konten" currentView={currentView} onClick={setCurrentView}>
                    <BrainCircuitIcon />
                </NavItem>
                <NavItem view="admin-users" label="Pengguna" currentView={currentView} onClick={setCurrentView}>
                    <UsersIcon className="w-5 h-5"/>
                </NavItem>
                <NavItem view="admin-settings" label="Pengaturan" currentView={currentView} onClick={setCurrentView}>
                    <SettingsIcon />
                </NavItem>
                 <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mt-4">User View</div>
                 <NavItem view="home" label="Beranda" currentView={currentView} onClick={setCurrentView}>
                    <HomeIcon />
                </NavItem>
              </>
            ) : (
              <>
                <NavItem view="home" label="Beranda" currentView={currentView} onClick={setCurrentView}>
                    <HomeIcon />
                </NavItem>
                <NavItem view="brandProfile" label="Personal Brand" currentView={currentView} onClick={setCurrentView}>
                    <BrandProfileIcon />
                </NavItem>
                 <NavItem view="contentPlanner" label="Perencana Konten" currentView={currentView} onClick={setCurrentView}>
                    <CalendarIcon />
                </NavItem>
                 <NavItem view="marketResearch" label="Riset Pasar AI" currentView={currentView} onClick={setCurrentView}>
                    <SearchTrendingIcon />
                </NavItem>
                <NavItem view="hookGenerator" label="Hook Generator" currentView={currentView} onClick={setCurrentView}>
                    <MagnetIcon />
                </NavItem>
                <NavItem view="generator" label="Generator Script" currentView={currentView} onClick={setCurrentView}>
                    <GenerateIcon />
                </NavItem>
                <NavItem view="linkGenerator" label="Link Product to Script" currentView={currentView} onClick={setCurrentView}>
                    <LinkIcon />
                </NavItem>
                <NavItem view="angleGenerator" label="Angle Generator" currentView={currentView} onClick={setCurrentView}>
                    <CompassIcon />
                </NavItem>
                <NavItem view="hashtagGenerator" label="Hashtag Generator" currentView={currentView} onClick={setCurrentView}>
                    <HashtagIcon />
                </NavItem>
                 <NavItem view="videoGenerator" label="Video Studio" currentView={currentView} onClick={setCurrentView}>
                    <FilmIcon />
                </NavItem>
                <NavItem view="imageStudio" label="Image Studio" currentView={currentView} onClick={setCurrentView}>
                    <ImageEditIcon />
                </NavItem>
                <NavItem view="history" label="Riwayat Script" currentView={currentView} onClick={setCurrentView}>
                    <HistoryIcon />
                </NavItem>
                <NavItem view="templates" label="Templates" currentView={currentView} onClick={setCurrentView}>
                    <TemplatesIcon />
                </NavItem>
              </>
            )}
        </nav>
        <div className="text-xs text-text-secondary text-center mt-auto">
            &copy; 2024 SkripGen 3.0
        </div>
      </aside>
    </div>
  );
};