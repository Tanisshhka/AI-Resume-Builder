import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, Zap, Shield, ChevronRight, FileText, 
  ArrowRight, Users, CheckCircle, TrendingUp, Check, Brain,
  Target, Rocket, Star, ChevronDown, Globe, BarChart3, Palette
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (tab: string) => void;
}

const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const FloatingParticle: React.FC<{ delay: number; x: string; size: number; color: string }> = ({ delay, x, size, color }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: x, width: size, height: size, background: color }}
    initial={{ y: '100vh', opacity: 0, rotate: 0 }}
    animate={{ y: '-10vh', opacity: [0, 1, 1, 0], rotate: 720 }}
    transition={{ duration: 15 + Math.random() * 10, delay, repeat: Infinity, ease: 'linear' }}
  />
);

const TemplateCard: React.FC<{ name: string; color: string; category: string; layout: 'single' | 'sidebar' | 'centered' }> = ({ name, color, category, layout }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.03, rotateY: 2 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className="flex-shrink-0 w-52 h-72 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 relative group cursor-pointer border border-slate-200/20 dark:border-slate-800/40"
    style={{ background: '#ffffff' }}
  >
    {/* Mini Resume Layout */}
    {layout === 'sidebar' ? (
      <div className="flex h-full">
        {/* Dark sidebar */}
        <div className="w-[35%] h-full p-2.5 flex flex-col items-center" style={{ background: color }}>
          <div className="w-8 h-8 rounded-full bg-white/20 mb-1.5" />
          <div className="w-10 h-0.5 rounded bg-white/40 mb-1" />
          <div className="w-8 h-0.5 rounded bg-white/30 mb-3" />
          <div className="w-full space-y-1">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="h-0.5 rounded bg-white/40 flex-1" style={{ width: `${50 + Math.random() * 40}%` }} />
              </div>
            ))}
          </div>
          <div className="w-full mt-2 space-y-1">
            <div className="h-0.5 rounded bg-white/30 w-full" />
            <div className="h-0.5 rounded bg-white/20 w-4/5" />
            <div className="h-0.5 rounded bg-white/30 w-full" />
          </div>
        </div>
        {/* Right content */}
        <div className="flex-1 p-2.5 space-y-2">
          <div className="h-1.5 rounded bg-slate-800 w-3/4" />
          <div className="h-0.5 rounded bg-slate-300 w-1/2" />
          <div className="h-0.5 rounded bg-slate-200 w-full mt-2" />
          <div className="h-0.5 rounded bg-slate-200 w-4/5" />
          <div className="h-0.5 rounded bg-slate-200 w-full" />
          <div className="h-0.5 rounded bg-slate-200 w-3/5" />
          <div className="border-t border-slate-100 pt-1.5 mt-1.5">
            <div className="h-1 rounded w-1/3 mb-1" style={{ background: color }} />
            <div className="h-0.5 rounded bg-slate-200 w-full" />
            <div className="h-0.5 rounded bg-slate-200 w-4/5" />
          </div>
          <div className="border-t border-slate-100 pt-1.5">
            <div className="h-1 rounded w-1/3 mb-1" style={{ background: color }} />
            <div className="h-0.5 rounded bg-slate-200 w-full" />
            <div className="h-0.5 rounded bg-slate-200 w-3/4" />
          </div>
        </div>
      </div>
    ) : layout === 'centered' ? (
      <div className="p-3 h-full flex flex-col">
        {/* Centered header */}
        <div className="text-center mb-2 pb-1.5 border-b" style={{ borderColor: `${color}30` }}>
          <div className="h-1.5 rounded bg-slate-800 w-1/2 mx-auto mb-0.5" />
          <div className="h-0.5 rounded bg-slate-400 w-1/3 mx-auto mb-1" />
          <div className="flex justify-center gap-2">
            {[1,2,3].map(i => <div key={i} className="h-0.5 rounded bg-slate-300" style={{ width: '16px' }} />)}
          </div>
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="h-1 rounded w-1/3" style={{ background: color }} />
          <div className="h-0.5 rounded bg-slate-200 w-full" />
          <div className="h-0.5 rounded bg-slate-200 w-4/5" />
          <div className="h-0.5 rounded bg-slate-200 w-full" />
          <div className="mt-1.5 h-1 rounded w-1/3" style={{ background: color }} />
          <div className="h-0.5 rounded bg-slate-200 w-full" />
          <div className="h-0.5 rounded bg-slate-200 w-3/4" />
          <div className="mt-1.5 h-1 rounded w-1/3" style={{ background: color }} />
          <div className="h-0.5 rounded bg-slate-200 w-full" />
          <div className="h-0.5 rounded bg-slate-200 w-4/5" />
        </div>
      </div>
    ) : (
      <div className="p-3 h-full flex flex-col">
        {/* Single column standard */}
        <div className="flex justify-between items-start mb-2 pb-1.5 border-b border-slate-100">
          <div>
            <div className="h-1.5 rounded bg-slate-800 w-24 mb-0.5" />
            <div className="h-0.5 rounded w-16" style={{ background: color }} />
          </div>
          <div className="space-y-0.5 text-right">
            <div className="h-0.5 rounded bg-slate-300 w-12 ml-auto" />
            <div className="h-0.5 rounded bg-slate-300 w-10 ml-auto" />
          </div>
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="h-1 rounded w-1/4" style={{ background: color }} />
          <div className="space-y-0.5">
            <div className="h-0.5 rounded bg-slate-200 w-full" />
            <div className="h-0.5 rounded bg-slate-200 w-5/6" />
            <div className="h-0.5 rounded bg-slate-200 w-full" />
          </div>
          <div className="mt-1 h-1 rounded w-1/4" style={{ background: color }} />
          <div className="space-y-0.5">
            <div className="h-0.5 rounded bg-slate-200 w-full" />
            <div className="h-0.5 rounded bg-slate-200 w-4/5" />
          </div>
          <div className="mt-1 flex gap-1 flex-wrap">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-1.5 rounded-full px-1.5" style={{ background: `${color}15`, width: `${28 + Math.random() * 16}px` }}>
                <div className="h-0.5 rounded mt-0.5" style={{ background: `${color}60`, width: '80%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Hover overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
      <div>
        <div className="text-[10px] font-extrabold text-white uppercase tracking-wider">{name}</div>
        <div className="text-[8px] text-white/70 mt-0.5">{category}</div>
      </div>
    </div>

    {/* Color accent line */}
    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
  </motion.div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigate }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { label: 'Resumes Created', value: 1200000, suffix: '+', icon: FileText, color: '#6C63FF' },
    { label: 'Active Users', value: 450000, suffix: '+', icon: Users, color: '#8B5CF6' },
    { label: 'Interview Rate', value: 89, suffix: '%', icon: TrendingUp, color: '#00D4FF' },
    { label: 'AI Optimizations', value: 2500000, suffix: '+', icon: Sparkles, color: '#10B981' },
  ];

  const features = [
    {
      title: 'AI Resume Scoring',
      desc: 'Get instant 0-100 scoring with actionable improvement suggestions powered by Gemini AI.',
      icon: Award,
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
    },
    {
      title: 'ATS Keyword Engine',
      desc: 'Paste any job description to detect missing keywords and optimize your resume instantly.',
      icon: Target,
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
    },
    {
      title: '20+ Premium Templates',
      desc: 'Switch between ATS-friendly, executive, creative, and industry-specific layouts.',
      icon: Palette,
      gradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50',
    },
    {
      title: 'Smart Job Tracker',
      desc: 'Track applications from bookmark to offer with a visual Kanban-style pipeline.',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Cover Letter Generator',
      desc: 'AI writes tailored cover letters for each company and role in seconds.',
      icon: FileText,
      gradient: 'from-rose-500 to-red-500',
      bgLight: 'bg-rose-50',
    },
    {
      title: 'Interview Prep',
      desc: 'Generate technical and behavioral interview questions based on your resume.',
      icon: Brain,
      gradient: 'from-indigo-500 to-violet-500',
      bgLight: 'bg-indigo-50',
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Create Your Profile', desc: 'Enter your personal details, education, skills, and experience through our guided wizard.', icon: Users },
    { step: '02', title: 'AI Optimizes Everything', desc: 'Our AI scores your resume, suggests improvements, and matches it against job descriptions.', icon: Sparkles },
    { step: '03', title: 'Export & Apply', desc: 'Download a pixel-perfect A4 PDF or share your public portfolio link with recruiters.', icon: Rocket },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'Software Engineer at Google', text: 'ResumeAI Pro helped me land my dream job. The ATS optimization was a game-changer.', avatar: 'SC' },
    { name: 'James Wilson', role: 'Product Manager at Stripe', text: 'The AI scoring feature showed me exactly what was missing. Got 3 interview calls in a week.', avatar: 'JW' },
    { name: 'Priya Sharma', role: 'Full Stack Developer', text: 'Best resume builder I have used. The templates are stunning and the AI suggestions are spot-on.', avatar: 'PS' },
  ];

  const templateList = [
    { name: 'ATS Modern', color: '#6C63FF', category: 'ATS Friendly', layout: 'single' as const },
    { name: 'Executive', color: '#1E3A8A', category: 'Corporate', layout: 'sidebar' as const },
    { name: 'Creative', color: '#7C3AED', category: 'Design & Media', layout: 'sidebar' as const },
    { name: 'Minimal', color: '#64748B', category: 'Clean & Simple', layout: 'centered' as const },
    { name: 'Tech Pro', color: '#059669', category: 'Engineering', layout: 'single' as const },
    { name: 'Harvard', color: '#800000', category: 'Academic', layout: 'centered' as const },
    { name: 'Startup', color: '#4F46E5', category: 'Innovation', layout: 'single' as const },
    { name: 'Designer', color: '#06B6D4', category: 'Creative Portfolio', layout: 'sidebar' as const },
    { name: 'Finance', color: '#1E293B', category: 'Professional', layout: 'centered' as const },
    { name: 'Marketing', color: '#DB2777', category: 'Digital & Brand', layout: 'sidebar' as const },
    { name: 'Student', color: '#6366F1', category: 'Entry Level', layout: 'single' as const },
    { name: 'Healthcare', color: '#0D9488', category: 'Clinical', layout: 'single' as const },
  ];

  const faqs = [
    {
      q: "How does the AI Resume Analyzer score my resume?",
      a: "Our scoring engine analyzes your Experience, Skills, Projects, and Education sections against industry standards. It evaluates keyword density, action verb usage, formatting compliance, and content completeness to generate a score from 0-100 with specific improvement suggestions."
    },
    {
      q: "Can I download my resume as a PDF without watermarks?",
      a: "Absolutely! ResumeAI Pro provides clean, high-quality, pixel-perfect A4 PDF exports with zero watermarks. The export engine uses html2canvas at 2x resolution with automatic multi-page slicing for longer resumes."
    },
    {
      q: "How does the job description matching work?",
      a: "Simply paste any job description into the ATS matcher. Our AI scans the JD for technical keywords, required skills, and industry terms, then compares them against your resume to show you exactly which keywords to add for higher ATS pass rates."
    },
    {
      q: "Is my data secure and private?",
      a: "Yes. All data is encrypted at rest and in transit. We use JWT authentication, and your resume data is only accessible to you. Public sharing is opt-in only, and you can revoke it anytime."
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans pt-20">
      
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 1.5}
            x={`${5 + Math.random() * 90}%`}
            size={2 + Math.random() * 4}
            color={`rgba(108, 99, 255, ${0.1 + Math.random() * 0.2})`}
          />
        ))}
      </div>

      {/* Background Animated Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[140px] animate-blob" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[140px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/3 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[160px] animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Mouse Follow Glow */}
      <motion.div 
        className="hidden lg:block fixed pointer-events-none w-[700px] h-[700px] rounded-full bg-primary/4 dark:bg-primary/3 blur-[180px] z-0"
        animate={{
          x: mousePosition.x - 350,
          y: mousePosition.y - 350,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 100 }}
      />

      {/* ============ HERO SECTION ============ */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center"
      >
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-slate-200/50 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl text-xs font-bold text-slate-600 dark:text-slate-300 mb-8 shadow-glass"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Powered by Gemini 1.5 Flash AI
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-black tracking-tight max-w-5xl leading-[1.05]"
        >
          Build a{' '}
          <span className="gradient-text-animated">
            World-Class Resume
          </span>
          <br className="hidden md:block" />
          {' '}With Real-Time AI
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mt-7 leading-relaxed font-medium"
        >
          Grade templates dynamically, scan matching job descriptions, detect missing skills, and compile ATS-proof PDFs that get you interviews.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto"
        >
          <button 
            onClick={onStart}
            className="group magnetic-btn relative flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-sm shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 ripple-container overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              Create My AI Resume
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
          
          <button 
            onClick={() => onNavigate('dashboard')}
            className="magnetic-btn flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/5 font-bold text-sm transition-all duration-300"
          >
            <Globe size={16} />
            Live Demo
          </button>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex items-center gap-6 text-xs text-slate-400"
        >
          <div className="flex -space-x-2">
            {['bg-primary', 'bg-secondary', 'bg-accent', 'bg-emerald-500'].map((bg, i) => (
              <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white dark:border-darkbg flex items-center justify-center text-white text-[10px] font-bold`}>
                {['JD', 'SK', 'AR', 'MK'][i]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 font-semibold">4.9/5</span>
            <span>from 12,000+ reviews</span>
          </div>
        </motion.div>
      </motion.section>

      {/* ============ STATS SECTION ============ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="glass-card rounded-2xl p-5 md:p-6 flex items-center gap-4 relative overflow-hidden group card-lift"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" style={{ background: `linear-gradient(135deg, ${stat.color}, transparent)` }} />
              <div className="p-3 rounded-xl text-white shadow-lg relative z-10" style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}CC)` }}>
                <stat.icon size={20} />
              </div>
              <div className="relative z-10">
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Zap size={12} /> Features
          </span>
          <h2 className="text-3xl md:text-5xl font-black">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Land the Job</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
            Our full-stack builder includes built-in AI processors to audit, optimize, and perfect every section of your resume.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="glass-card rounded-2xl p-6 group card-lift relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: `linear-gradient(to bottom left, ${feature.gradient.includes('amber') ? '#F59E0B' : feature.gradient.includes('emerald') ? '#10B981' : feature.gradient.includes('purple') ? '#8B5CF6' : feature.gradient.includes('blue') ? '#3B82F6' : feature.gradient.includes('rose') ? '#F43F5E' : '#6366F1'}, transparent)` }} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5 shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon size={20} />
              </div>
              <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors relative z-10">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed relative z-10">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold mb-4">
            <Rocket size={12} /> Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-black">How It Works</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-lg mx-auto">
            Three steps to a resume that gets you interviews
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary via-secondary to-accent opacity-20" />
          
          {howItWorks.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="text-center relative"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-black mb-6 shadow-xl shadow-primary/20 relative z-10">
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ TEMPLATE SHOWCASE MARQUEE ============ */}
      <section className="relative z-10 py-20 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12 px-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold mb-4">
            <Palette size={12} /> Templates
          </span>
          <h2 className="text-3xl md:text-5xl font-black">
            20+ <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Premium</span> Templates
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-lg mx-auto">
            Each template is crafted for a specific industry and optimized for ATS compatibility
          </p>
        </motion.div>

        {/* Marquee Row 1 */}
        <div className="marquee-container mb-4">
          <div className="flex animate-marquee gap-4 w-max">
            {[...templateList, ...templateList].map((t, idx) => (
              <TemplateCard key={idx} name={t.name} color={t.color} category={t.category} layout={t.layout} />
            ))}
          </div>
        </div>

        {/* Marquee Row 2 - Reverse */}
        <div className="marquee-container">
          <div className="flex animate-marquee-reverse gap-4 w-max" style={{ animationDirection: 'reverse' }}>
            {[...templateList.slice().reverse(), ...templateList.slice().reverse()].map((t, idx) => (
              <TemplateCard key={idx} name={t.name} color={t.color} category={t.category} layout={t.layout} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold mb-4">
            <Star size={12} /> Loved by Professionals
          </span>
          <h2 className="text-3xl md:text-5xl font-black">What Our Users Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-card rounded-2xl p-6 card-lift"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black">Frequently Asked Questions</h2>
        </motion.div>
        
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeAccordion === idx;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveAccordion(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100/30 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 pr-4">{faq.q}</span>
                  <motion.span 
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary flex-shrink-0"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="px-6 pb-5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/10 pt-3 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-40" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Ready to Build Your Dream Resume?
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8 text-sm md:text-base">
              Join 450,000+ professionals who used ResumeAI Pro to land their dream jobs. Start for free, no credit card required.
            </p>
            <button
              onClick={onStart}
              className="magnetic-btn inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-primary font-extrabold text-sm shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-slate-200/30 dark:border-slate-800/40 bg-white/20 dark:bg-slate-950/20 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="text-white w-4 h-4" />
                </div>
                <span className="font-black text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ResumeAI Pro</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">AI-powered resume builder for modern professionals.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Product</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="hover:text-primary cursor-pointer transition-colors">Templates</p>
                <p className="hover:text-primary cursor-pointer transition-colors">AI Features</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Pricing</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Resources</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="hover:text-primary cursor-pointer transition-colors">Blog</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Resume Guide</p>
                <p className="hover:text-primary cursor-pointer transition-colors">API Docs</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Legal</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="hover:text-primary cursor-pointer transition-colors">Privacy</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Terms</p>
                <p className="hover:text-primary cursor-pointer transition-colors">Security</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200/20 dark:border-slate-800/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-400">&copy; 2026 ResumeAI Pro. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-500" /> SOC 2 Compliant</span>
              <span className="flex items-center gap-1"><Shield size={10} className="text-primary" /> GDPR Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
