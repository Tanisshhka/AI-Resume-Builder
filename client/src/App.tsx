import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { store, useAppSelector } from './store';
import { GlassNavbar } from './components/GlassNavbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Editor } from './pages/Editor';
import { AdminDashboard } from './pages/AdminDashboard';
import { SharePage } from './pages/SharePage';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.4, 0, 0.2, 1],
  duration: 0.3,
};

function AppContent() {
  const { user } = useAppSelector((state) => state.auth);
  const [currentTab, setCurrentTab] = useState('landing');
  const [shareSlug, setShareSlug] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share/')) {
        const slug = hash.split('#share/')[1];
        if (slug) { setShareSlug(slug); setCurrentTab('share'); }
      } else if (hash === '#landing' || hash === '') {
        setCurrentTab('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tabId: string) => {
    if ((tabId === 'dashboard' || tabId === 'editor' || tabId === 'admin') && !user) {
      setCurrentTab('auth');
    } else {
      setCurrentTab(tabId);
      if (tabId !== 'share') window.history.pushState(null, '', ' ');
    }
  };

  const handleStartBuilding = () => {
    setCurrentTab(user ? 'dashboard' : 'auth');
  };

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'landing': return <LandingPage onStart={handleStartBuilding} onNavigate={handleTabChange} />;
      case 'auth': return <AuthPage onAuthSuccess={() => setCurrentTab('dashboard')} />;
      case 'dashboard': return <Dashboard onEditResume={() => setCurrentTab('editor')} onViewShare={(slug) => { setShareSlug(slug); window.location.hash = `share/${slug}`; }} />;
      case 'editor': return <Editor onBack={() => setCurrentTab('dashboard')} />;
      case 'admin': return <AdminDashboard onBack={() => setCurrentTab('dashboard')} />;
      case 'share': return <SharePage shareSlug={shareSlug} onBack={() => setCurrentTab('landing')} />;
      default: return <LandingPage onStart={handleStartBuilding} onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 dark:bg-darkbg text-slate-800 dark:text-slate-100 selection:bg-primary/30">
      <GlassNavbar currentTab={currentTab} onTabChange={handleTabChange} />
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
