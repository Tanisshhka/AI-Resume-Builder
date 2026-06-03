import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../store';
import { toggleTheme } from '../features/uiSlice';
import { logout } from '../features/authSlice';
import { Sun, Moon, Menu, X, Sparkles, LogOut, ChevronRight } from 'lucide-react';

interface GlassNavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({ currentTab, onTabChange }) => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home' },
    ...(user ? [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'editor', label: 'Builder' },
      ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin' }] : [])
    ] : [])
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    onTabChange('landing');
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      {isScrolled && (
        <div 
          className="scroll-progress"
          style={{ width: `${scrollProgress}%` }}
        />
      )}

      <motion.nav 
        initial={false}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'px-4 py-2.5' 
            : 'px-6 py-4'
        }`}
      >
        <div className={`max-w-7xl mx-auto transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/75 dark:bg-[#0F172A]/75 backdrop-blur-xl shadow-glass-lg border border-white/20 dark:border-slate-800/50 rounded-2xl px-5 py-2.5' 
            : 'bg-transparent'
        }`}>
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <motion.div 
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2.5 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow duration-300">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-sm bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight">
                  ResumeAI
                </span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest block -mt-0.5">
                  Pro Builder
                </span>
              </div>
            </motion.div>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800/50 rounded-xl px-1.5 py-1 backdrop-blur-sm">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                      isActive 
                        ? 'text-white bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/20' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-2.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-600 dark:text-slate-400"
                aria-label="Toggle Theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun size={16} className="text-amber-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {user ? (
                <div className="flex items-center gap-2.5">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 border border-slate-200/30 dark:border-slate-800/50 rounded-xl px-3 py-1.5 bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[9px] font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{user.name}</span>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-md shadow-red-500/15"
                  >
                    <LogOut size={12} />
                    Logout
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleNavClick('auth')}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  Sign In
                </motion.button>
              )}
            </div>

            {/* MOBILE CONTROLS */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-slate-600 dark:text-slate-400"
              >
                {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl border border-slate-200/30 dark:border-slate-800/30 text-slate-600 dark:text-slate-400"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-full left-4 right-4 mt-2 p-4 bg-white/95 dark:bg-[#0F172A]/95 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl backdrop-blur-xl rounded-2xl flex flex-col gap-2 md:hidden z-50"
            >
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-left px-4 flex items-center justify-between ${
                    currentTab === item.id 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                  <ChevronRight size={14} className="opacity-50" />
                </motion.button>
              ))}
              {user ? (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  onClick={() => handleNavClick('auth')}
                  className="w-full py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-primary to-secondary text-center"
                >
                  Sign In / Sign Up
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};
