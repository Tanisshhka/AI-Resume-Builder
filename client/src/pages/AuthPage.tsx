import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../store';
import { loginSuccess, setAuthError, clearAuthError } from '../features/authSlice';
import { api } from '../utils/api';
import { Mail, Lock, User, Globe, Link, Code, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const dispatch = useAppDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg('');
    dispatch(clearAuthError());

    try {
      let data;
      if (isLogin) {
        data = await api.post('/auth/login', { email, password });
      } else {
        data = await api.post('/auth/register', { name, email, password });
      }
      
      dispatch(loginSuccess({ user: { ...data, aiTokensUsed: data.aiTokensUsed || 0 }, token: data.token }));
      
      if (isLogin) {
        onAuthSuccess();
      } else {
        setSuccessMsg('Account created successfully!');
        setTimeout(() => onAuthSuccess(), 500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check console (F12) for details.');
      dispatch(setAuthError(err.message || 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (platform: string) => {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        _id: 'mock_user_123',
        name: `${platform} User`,
        email: `${platform.toLowerCase()}user@example.com`,
        role: 'user' as const,
        bio: 'Full-stack software architect',
        socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
        aiTokensUsed: 0
      };
      dispatch(loginSuccess({ user: mockUser, token: 'mock_social_jwt_token' }));
      setLoading(false);
      onAuthSuccess();
    }, 1000);
  };

  const features = [
    'AI-powered resume scoring & optimization',
    '20+ premium ATS-friendly templates',
    'Smart job description matching',
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans p-6 pt-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[140px] animate-blob" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[140px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[160px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* LEFT - Feature Highlights (Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="hidden lg:block space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
              <Sparkles size={12} />
              AI-Powered Resume Builder
            </div>
            <h1 className="text-4xl font-black leading-tight">
              Build Resumes That
              <br />
              <span className="gradient-text-animated">Get You Hired</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed max-w-sm">
              Join 450,000+ professionals who landed their dream jobs with AI-optimized resumes.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={12} className="text-emerald-500" />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{feat}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {['bg-primary', 'bg-secondary', 'bg-accent', 'bg-emerald-500'].map((bg, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-darkbg flex items-center justify-center text-white text-[9px] font-bold`}>
                  {['A', 'B', 'C', 'D'][i]}
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-400">
              <span className="font-bold text-slate-600 dark:text-slate-300">12,000+</span> resumes created today
            </div>
          </div>
        </motion.div>

        {/* RIGHT - Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <div className="glass-card rounded-3xl p-8 shadow-premium-lg relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
            
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary items-center justify-center text-white mb-4 shadow-xl shadow-primary/25"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                {isLogin ? 'Sign in to access your resumes and dashboard' : 'Start building your AI-optimized resume today'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 dark:text-red-400"
                >
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500 flex items-center gap-2"
                >
                  <CheckCircle size={14} />
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-xs bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 dark:text-white transition-all duration-300 input-premium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-xs bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 dark:text-white transition-all duration-300 input-premium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 text-xs bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 text-slate-800 dark:text-white transition-all duration-300 input-premium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Social Logins */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-grow h-px bg-slate-200/50 dark:bg-slate-800/50" />
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow h-px bg-slate-200/50 dark:bg-slate-800/50" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Globe, label: 'Google', color: 'hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5' },
                  { icon: Code, label: 'GitHub', color: 'hover:text-slate-800 dark:hover:text-white hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' },
                  { icon: Link, label: 'LinkedIn', color: 'hover:text-blue-600 hover:border-blue-600/30 hover:bg-blue-600/5' },
                ].map((social) => (
                  <motion.button
                    key={social.label}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSocialClick(social.label)}
                    className={`flex items-center justify-center py-3 rounded-xl border border-slate-200/40 dark:border-slate-800/50 transition-all duration-300 text-slate-500 dark:text-slate-400 ${social.color}`}
                    aria-label={`${social.label} Connect`}
                  >
                    <social.icon size={16} />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Toggle */}
            <div className="mt-8 text-center text-xs">
              <span className="text-slate-400">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(''); }}
                className="font-bold text-primary hover:underline focus:outline-none transition-colors"
              >
                {isLogin ? 'Sign Up Free' : 'Sign In'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
