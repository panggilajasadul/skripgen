

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import ScriptGenerator from './components/ScriptGenerator';
import HistoryView from './components/HistoryView';
import TemplatesView from './components/TemplatesView';
import LinkScriptGenerator from './components/LinkScriptGenerator';
import HookGeneratorView from './components/HookGeneratorView';
import PersonalBrandView from './components/PersonalBrandView';
import { HomeView } from './components/HomeView';
import LoginView from './components/LoginView';
import AdminDashboardView from './components/AdminDashboardView';
import { View, User, InitialGeneratorData, ContentPlanDay, Quote } from './types';
import { useToast } from './hooks/useToast';
import { ToastProvider } from './components/ui/Toast';
import AngleGeneratorView from './components/AngleGeneratorView';
import HashtagGeneratorView from './components/HashtagGeneratorView';
import VideoGeneratorView from './components/VideoGeneratorView';
import { authService } from './services/authService';
import { MobileMenu } from './components/MobileMenu';
import { motion, AnimatePresence } from 'framer-motion';
import ContentPlannerView from './components/ContentPlannerView';
import QuoteModal from './components/QuoteModal';
import { settingsService } from './services/settingsService';
import { quoteService } from './services/quoteService';
import MarketResearchView from './components/MarketResearchView';
import DirectMessageModal from './components/DirectMessageModal';
import ImageStudioView from './components/ImageStudioView';
import { apiKeyService } from './services/apiKeyService';
import { isSupabaseConnected } from './services/supabaseClient';
import Spinner from './components/ui/Spinner';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [navigationStack, setNavigationStack] = useState<View[]>(['home']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionSeenMessageId, setSessionSeenMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [initialGeneratorData, setInitialGeneratorData] = useState<InitialGeneratorData | null>(null);
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const checkUserSession = async () => {
      setIsLoading(true);
      await authService.initialize(); // Initialize local storage with default users if needed
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (user) {
         if (user.role === 'admin') {
           setNavigationStack(['admin-dashboard']);
         } else {
            setNavigationStack(['home']);
         }
      } else {
        setNavigationStack(['login']);
      }
      setIsLoading(false);
    };

    checkUserSession();
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setNavigationStack(['admin-dashboard']);
    } else {
      setNavigationStack(['home']);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
    setNavigationStack(['login']);
  }, []);

  useEffect(() => {
    // This real-time update is more complex with a backend.
    // Supabase Realtime can be used for this. For now, this is simplified.
    // The previous storage listener is less effective with a backend.
  }, [currentUser, handleLogout]);


  const directMessage = currentUser?.directMessage;
  const showDirectMessage = directMessage && !(directMessage.id === sessionSeenMessageId);

  const handleCloseDirectMessage = () => {
    if (directMessage && !directMessage.isPermanent) {
        setSessionSeenMessageId(directMessage.id);
    }
  };

  const currentView = useMemo(() => {
    if (isLoading) return 'loading';
    if (!currentUser) return 'login';
    return navigationStack[navigationStack.length - 1] || 'home';
  }, [navigationStack, currentUser, isLoading]);
  
  const navigateTo = useCallback((view: View) => {
    if (view.startsWith('admin') && currentUser?.role !== 'admin') {
      addToast("You don't have permission to access this page.");
      return;
    }
    setNavigationStack(prevStack => [...prevStack, view]);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  }, [currentUser, addToast]);
  
  const handleUseTemplate = useCallback((templateId: string) => {
      // In a full Supabase app, you'd fetch the template by ID
      // For now, this logic will be handled inside TemplatesView or passed differently
      console.log("Using template:", templateId);
      // setInitialGeneratorData(...);
      navigateTo('generator');
  }, [navigateTo]);
  
  const handleUseContentPlanDay = useCallback((dayData: ContentPlanDay, productName: string) => {
      const mappedData: InitialGeneratorData = {
          productName: productName,
          usp: dayData.angle,
          hookTypes: [dayData.hookIdea],
          customCTA: dayData.cta,
          scriptGoal: 'Konversi Penjualan', 
          copywritingFormula: 'AIDA',
          toneAndStyle: 'Friendly',
      };
      setInitialGeneratorData(mappedData);
      navigateTo('generator');
      addToast(`Formulir Generator diisi untuk Rencana Hari ${dayData.day}!`);
  }, [navigateTo, addToast]);

  const handleUseResearchedProduct = useCallback((productName: string) => {
    setInitialGeneratorData({ productName });
    navigateTo('generator');
    addToast(`Generator diisi dengan produk: ${productName}!`);
  }, [navigateTo, addToast]);


  const showQuoteModal = useCallback(async (generateCount: number) => {
    const settings = await settingsService.getSettings();
    const useToughLove = generateCount > settings.toughLoveThreshold;

    if (useToughLove && !settings.toughLoveEnabled) return;
    if (!useToughLove && !settings.motivationalEnabled) return;

    const quotesSource = useToughLove
        ? await quoteService.getToughLoveQuotes() 
        : await quoteService.getMotivationalQuotes();
    
    if(quotesSource.length === 0) return;

    const randomIndex = Math.floor(Math.random() * quotesSource.length);
    setActiveQuote(quotesSource[randomIndex]);
  }, []);


  const handleGoHome = useCallback(() => {
    if(currentUser?.role === 'admin') {
      setNavigationStack(['admin-dashboard']);
    } else {
      setNavigationStack(['home']);
    }
  }, [currentUser]);
  
  const handleBack = useCallback(() => {
    setNavigationStack(prevStack => {
      if (prevStack.length > 1) {
        return prevStack.slice(0, -1);
      }
      return prevStack;
    });
  }, []);

  const setCurrentView = (view: View) => {
    if (view === currentView) {
      setIsMobileMenuOpen(false);
      return;
    };
    navigateTo(view);
  };

  const renderView = (): React.ReactNode => {
     if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    switch (currentView) {
      case 'login':
        return <LoginView onLoginSuccess={handleLoginSuccess} />;
      case 'home':
        return <HomeView 
                  currentUser={currentUser}
                  onNavigateToGenerator={() => navigateTo('generator')} 
                  onNavigateToLinkGenerator={() => navigateTo('linkGenerator')} 
                  onNavigateToHookGenerator={() => navigateTo('hookGenerator')} 
                  onNavigateToAngleGenerator={() => navigateTo('angleGenerator')}
                  onNavigateToHashtagGenerator={() => navigateTo('hashtagGenerator')}
                  onNavigateToVideoGenerator={() => navigateTo('videoGenerator')}
                  onNavigateToContentPlanner={() => navigateTo('contentPlanner')}
                  onNavigateToMarketResearch={() => navigateTo('marketResearch')}
                  onNavigateToImageStudio={() => navigateTo('imageStudio')}
                />;
      case 'generator':
        return <ScriptGenerator initialData={initialGeneratorData} clearInitialData={() => setInitialGeneratorData(null)} onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'linkGenerator':
// FIX: The `LinkScriptGenerator` component was refactored to handle its own data fetching and history saving,
// so the `brandProfile` and `onSaveToHistory` props are no longer needed, resolving the type error.
        return <LinkScriptGenerator onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'hookGenerator':
        return <HookGeneratorView onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'angleGenerator':
        return <AngleGeneratorView onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'hashtagGenerator':
        return <HashtagGeneratorView onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'videoGenerator':
        return <VideoGeneratorView onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'imageStudio':
        return <ImageStudioView onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'contentPlanner':
        return <ContentPlannerView onUseContentPlanDay={handleUseContentPlanDay} onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'marketResearch':
        return <MarketResearchView onUseProduct={handleUseResearchedProduct} onGenerateSuccess={(count) => showQuoteModal(count)} />;
      case 'history':
        return <HistoryView />;
      case 'templates':
        return <TemplatesView onUseTemplate={() => {}} />;
      case 'brandProfile':
        return <PersonalBrandView />;
      case 'admin-dashboard':
        return currentUser?.role === 'admin' ? <AdminDashboardView activeView="dashboard" /> : null;
       case 'admin-intelligence':
        return currentUser?.role === 'admin' ? <AdminDashboardView activeView="intelligence" /> : null;
      case 'admin-users':
        return currentUser?.role === 'admin' ? <AdminDashboardView activeView="users" /> : null;
      case 'admin-settings':
        return currentUser?.role === 'admin' ? <AdminDashboardView activeView="settings" /> : null;
      default:
        return <HomeView currentUser={currentUser} onNavigateToGenerator={() => navigateTo('generator')} onNavigateToLinkGenerator={() => navigateTo('linkGenerator')} onNavigateToHookGenerator={() => navigateTo('hookGenerator')} onNavigateToAngleGenerator={() => navigateTo('angleGenerator')} onNavigateToHashtagGenerator={() => navigateTo('hashtagGenerator')} onNavigateToVideoGenerator={() => navigateTo('videoGenerator')} onNavigateToContentPlanner={() => navigateTo('contentPlanner')} onNavigateToMarketResearch={() => navigateTo('marketResearch')} onNavigateToImageStudio={() => navigateTo('imageStudio')} />;
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-background">
            <Spinner size="lg" />
        </div>
    );
  }

  if (!currentUser) {
    return (
       <div className="text-text-primary font-sans">
         <LoginView onLoginSuccess={handleLoginSuccess} />
       </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentUser={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            currentUser={currentUser}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
            currentView={currentView}
            onBack={handleBack}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
             <AnimatePresence mode="wait">
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
        </main>
      </div>
      {activeQuote && <QuoteModal quote={activeQuote} onClose={() => setActiveQuote(null)} />}
      {showDirectMessage && <DirectMessageModal message={directMessage} onClose={handleCloseDirectMessage} onLogout={handleLogout} />}
    </div>
  );
}

export default function App(): React.ReactNode {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}