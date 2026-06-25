import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../store';
import { 
  updatePersonalInfo, addEducation, removeEducation,
  addExperience, removeExperience,
  addSkill, removeSkill,
  addProject, removeProject,
  addCertification, removeCertification,
  addAchievement, removeAchievement,
  updateTemplateId, updateResumeTitle, updateResumeScores
} from '../features/resumeSlice';
import { api } from '../utils/api';
import { ResumeRenderer } from '../templates/ResumeRenderer';
import { exportToPDF } from '../utils/pdfEngine';
import { 
  Sparkles, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2, 
  Download, ZoomIn, ZoomOut, FileText, MessageSquare, AlertCircle,
  User, GraduationCap, Code, Briefcase, FolderGit, Award, Trophy,
  Brain, Target, Copy, Check, Wand2
} from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

interface EditorProps {
  onBack: () => void;
}

const steps = [
  { id: 1, label: 'Personal', icon: User, color: '#6C63FF' },
  { id: 2, label: 'Education', icon: GraduationCap, color: '#8B5CF6' },
  { id: 3, label: 'Skills', icon: Code, color: '#00D4FF' },
  { id: 4, label: 'Experience', icon: Briefcase, color: '#10B981' },
  { id: 5, label: 'Projects', icon: FolderGit, color: '#F59E0B' },
  { id: 6, label: 'Certs', icon: Award, color: '#EC4899' },
  { id: 7, label: 'Awards', icon: Trophy, color: '#8B5CF6' },
  { id: 8, label: 'AI Optimize', icon: Brain, color: '#6C63FF' },
];

export const Editor: React.FC<EditorProps> = ({ onBack }) => {
  const dispatch = useAppDispatch();
  const currentResume = useAppSelector((state) => state.resume.currentResume);
  const [step, setStep] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [copiedText, setCopiedText] = useState('');

  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, description: '' });
  const [newExp, setNewExp] = useState({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', keyAchievements: [] as string[] });
  const [newExpAch, setNewExpAch] = useState('');
  const [newSkill, setNewSkill] = useState({ name: '', level: 3, category: 'Technical' });
  const [newProj, setNewProj] = useState({ name: '', description: '', url: '', githubUrl: '', technologies: [] as string[], role: '' });
  const [newProjTech, setNewProjTech] = useState('');
  const [newCert, setNewCert] = useState({ name: '', issuer: '', date: '', url: '' });
  const [newAch, setNewAch] = useState({ title: '', description: '', date: '' });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiJobDescription, setAiJobDescription] = useState('');
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [customLetter, setCustomLetter] = useState('');
  const [prepQuestions, setPrepQuestions] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiObjective, setAiObjective] = useState('');
  const [aiSkillRecs, setAiSkillRecs] = useState<string[]>([]);
  const [linkedinHeadlines, setLinkedinHeadlines] = useState<string[]>([]);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!currentResume?._id) return;
    setSavingStatus('saving');
    const delayDebounceFn = setTimeout(async () => {
      try {
        await api.put(`/resumes/${currentResume._id}`, currentResume);
        setSavingStatus('saved');
      } catch (err) {
        setSavingStatus('error');
      }
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [currentResume]);

  useEffect(() => {
    const pendingImport = localStorage.getItem('trigger_editor_import');
    if (pendingImport) {
      localStorage.removeItem('trigger_editor_import');
      try {
        const { linkedinUrl: lUrl, githubUrl: gUrl } = JSON.parse(pendingImport);
        if (lUrl) setLinkedinUrl(lUrl);
        if (gUrl) setGithubUrl(gUrl);
        generateFromProfiles(lUrl, gUrl);
      } catch (e) {
        console.error('Error parsing pending import in Editor:', e);
      }
    }
  }, []);

  const handlePersonalInfoChange = (field: string, value: string) => {
    dispatch(updatePersonalInfo({ [field]: value }));
  };

  const handleAddEdu = () => { if (!newEdu.institution || !newEdu.degree) return; dispatch(addEducation(newEdu)); setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', current: false, description: '' }); };
  const handleAddExp = () => { if (!newExp.company || !newExp.position) return; dispatch(addExperience(newExp)); setNewExp({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', keyAchievements: [] }); };
  const handleAddSkill = () => { if (!newSkill.name) return; dispatch(addSkill(newSkill)); setNewSkill({ name: '', level: 3, category: 'Technical' }); };
  const handleAddProj = () => { if (!newProj.name) return; dispatch(addProject(newProj)); setNewProj({ name: '', description: '', url: '', githubUrl: '', technologies: [], role: '' }); };
  const handleAddCert = () => { if (!newCert.name) return; dispatch(addCertification(newCert)); setNewCert({ name: '', issuer: '', date: '', url: '' }); };
  const handleAddAch = () => { if (!newAch.title) return; dispatch(addAchievement(newAch)); setNewAch({ title: '', description: '', date: '' }); };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // AI ACTIONS
  const runAiScoreAnalysis = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/analyze-score', { resumeData: currentResume });
      dispatch(updateResumeScores({ resumeScore: data.score, aiSuggestions: data.suggestions }));
      triggerConfetti();
    } catch (err: any) { alert(err.message || 'AI score failed'); } finally { setAiLoading(false); }
  };

  const runAtsCheck = async () => {
    if (!currentResume || !aiJobDescription) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/ats-check', { resumeData: currentResume, jobDescription: aiJobDescription });
      setAtsAnalysis(data);
      dispatch(updateResumeScores({ atsScore: data.matchPercentage }));
    } catch (err: any) { alert(err.message); } finally { setAiLoading(false); }
  };

  const generateSummary = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/summary', { skills: currentResume.skills, experience: currentResume.experience, education: currentResume.education });
      setAiSummary(data.summary);
    } catch (err: any) { alert(err.message); } finally { setAiLoading(false); }
  };

  const generateObjective = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/objective', { skills: currentResume.skills, fieldOfStudy: currentResume.education[0]?.fieldOfStudy || '', targetRole: currentResume.personalInfo?.title || '' });
      setAiObjective(data.objective);
    } catch (err: any) { alert(err.message); } finally { setAiLoading(false); }
  };

  const recommendSkills = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/recommend-skills', { skills: currentResume.skills, jobTitle: currentResume.personalInfo?.title || 'Software Engineer' });
      setAiSkillRecs(data.recommendedSkills || []);
    } catch (err: any) { alert(err.message); } finally { setAiLoading(false); }
  };

  const generateLinkedInHeadlines = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/linkedin-headlines', { jobTitle: currentResume.personalInfo?.title || 'Engineer', skills: currentResume.skills.map(s => s.name), experienceYears: 3 });
      setLinkedinHeadlines(data.headlines || []);
    } catch (err: any) { alert(err.message); } finally { setAiLoading(false); }
  };

  const generateFromProfiles = async (lUrl?: string, gUrl?: string) => {
    const finalLinkedin = lUrl !== undefined ? lUrl : linkedinUrl;
    const finalGithub = gUrl !== undefined ? gUrl : githubUrl;
    if (!finalLinkedin && !finalGithub) { alert('Please enter at least one URL (LinkedIn or GitHub)'); return; }
    setProfileLoading(true);
    try {
      const data = await api.post('/ai/generate-from-profiles', { linkedinUrl: finalLinkedin, githubUrl: finalGithub });
      if (data.personalInfo) dispatch(updatePersonalInfo(data.personalInfo));
      if (data.experience) data.experience.forEach((exp: any) => dispatch(addExperience(exp)));
      if (data.education) data.education.forEach((edu: any) => dispatch(addEducation(edu)));
      if (data.skills) data.skills.forEach((skill: any) => dispatch(addSkill(skill)));
      if (data.projects) data.projects.forEach((proj: any) => dispatch(addProject(proj)));
      if (data.certifications) data.certifications.forEach((cert: any) => dispatch(addCertification(cert)));
      if (data.achievements) data.achievements.forEach((ach: any) => dispatch(addAchievement(ach)));
      if (data.summary) setAiSummary(data.summary);
      alert('Resume auto-generated from your profiles! Review and edit the filled sections.');
      setStep(1);
    } catch (err: any) { alert(err.message || 'Failed to generate from profiles'); } finally { setProfileLoading(false); }
  };

  const generateCoverLetter = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/cover-letter', { resumeData: currentResume, companyName: 'Target Company', jobTitle: currentResume.personalInfo?.title || 'Engineer' });
      setCustomLetter(data.coverLetter);
    } catch (err: any) { alert(err.message); } finally { setAiLoading(false); }
  };

  const generateInterviewPrep = async () => {
    if (!currentResume) return;
    setAiLoading(true);
    try {
      const data = await api.post('/ai/interview-prep', { resumeData: currentResume, jobTitle: currentResume.personalInfo?.title });
      setPrepQuestions(data);
    } catch (err: any) { alert(err.message); } finally { setAiLoading(false); }
  };

  const handleExportPdf = async () => {
    if (!currentResume) return;
    await exportToPDF('printable-resume-container', `${currentResume.title.replace(/\s+/g, '_')}_Resume`);
  };

  const templateOptions = [
    { id: 'ats-modern', name: 'ATS Modern' }, { id: 'modern-executive', name: 'Executive' }, { id: 'creative-portfolio', name: 'Creative' },
    { id: 'startup-style', name: 'Startup' }, { id: 'harvard-style', name: 'Harvard' }, { id: 'tech-professional', name: 'Tech Pro' },
    { id: 'minimalist', name: 'Minimal' }, { id: 'accent-bold', name: 'Bold Sidebar' }, { id: 'grid-portfolio', name: 'Grid' },
    { id: 'elegant-premium', name: 'Elegant' }, { id: 'academic-cv', name: 'Academic' }, { id: 'designer-dark', name: 'Dark' },
    { id: 'engineering-standard', name: 'Engineering' }, { id: 'management-lead', name: 'Management' }, { id: 'finance-pro', name: 'Finance' },
    { id: 'marketing-creative', name: 'Marketing' }, { id: 'sales-driver', name: 'Sales' }, { id: 'freelancer-tech', name: 'Freelancer' },
    { id: 'healthcare-pro', name: 'Healthcare' }, { id: 'student-entry', name: 'Student' },
  ];

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!currentResume) return 0;
    let total = 0, filled = 0;
    const check = (val: any) => { total++; if (val && val !== '' && val !== 0) filled++; };
    
    check(currentResume.personalInfo?.fullName); check(currentResume.personalInfo?.email);
    check(currentResume.personalInfo?.phone); check(currentResume.personalInfo?.title);
    total++; filled += currentResume.education.length > 0 ? 1 : 0;
    total++; filled += currentResume.skills.length > 0 ? 1 : 0;
    total++; filled += currentResume.experience.length > 0 ? 1 : 0;
    total++; filled += currentResume.projects.length > 0 ? 1 : 0;
    return Math.round((filled / total) * 100);
  };

  if (!currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg">
        <p className="text-xs font-bold text-slate-500">No active resume loaded.</p>
      </div>
    );
  }

  const completion = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans pt-16 flex flex-col">
      {/* EDITOR HEADER */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/80 px-3 md:px-6 py-2.5 flex flex-wrap justify-between items-center z-10 gap-2 sticky top-16">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] md:text-xs font-bold transition-colors flex-shrink-0">
            <ChevronLeft size={12} /> <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <input type="text" value={currentResume.title} onChange={(e) => dispatch(updateResumeTitle(e.target.value))} className="bg-transparent font-bold text-xs md:text-sm focus:outline-none border-b border-transparent focus:border-slate-300 py-0.5 w-28 md:w-48 min-w-0" />
          <span className={`text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded font-bold flex-shrink-0 ${savingStatus === 'saving' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : savingStatus === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'error' ? 'Error' : 'Saved'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <select value={currentResume.templateId} onChange={(e) => dispatch(updateTemplateId(e.target.value))} className="px-2 md:px-3 py-1.5 text-[10px] md:text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-primary/50 font-semibold max-w-[120px] md:max-w-none">
            {templateOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExportPdf} className="flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary text-[10px] md:text-xs font-bold shadow-md shadow-primary/15 hover:shadow-primary/30 transition-shadow">
            <Download size={12} /> PDF
          </motion.button>
        </div>
      </div>

      {/* COMPLETION BAR */}
      <div className="bg-white/50 dark:bg-slate-900/50 border-b border-slate-200/30 dark:border-slate-800/50 px-6 py-2">
        <div className="flex items-center gap-3 max-w-[820px] mx-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{completion}% Complete</span>
          <div className="flex-grow bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-1.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.8 }}
              className={`h-1.5 rounded-full ${completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-amber-500' : 'bg-primary'}`}
            />
          </div>
        </div>
      </div>

      {/* EDITOR BODY */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 min-h-0">
        
        {/* LEFT - WIZARD */}
        <div className="p-3 md:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/40 dark:border-slate-800/80 overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-200px)]">
          
          {/* Step Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
            {steps.map((s) => (
              <motion.button
                key={s.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 ${
                  step === s.id 
                    ? 'text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={step === s.id ? { background: `linear-gradient(135deg, ${s.color}, ${s.color}CC)` } : {}}
              >
                <s.icon size={12} />
                <span className="hidden sm:inline">{s.label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-xs space-y-4"
            >
              {/* STEP 1: PERSONAL INFO */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">Full Name</label>
                      <input type="text" value={currentResume.personalInfo?.fullName || ''} onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)} placeholder="Jane Doe" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">Professional Title</label>
                      <input type="text" value={currentResume.personalInfo?.title || ''} onChange={(e) => handlePersonalInfoChange('title', e.target.value)} placeholder="Senior Engineer" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">Email</label>
                      <input type="email" value={currentResume.personalInfo?.email || ''} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} placeholder="jane@example.com" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">Phone</label>
                      <input type="text" value={currentResume.personalInfo?.phone || ''} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} placeholder="+1 (555) 123-4567" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">Location</label>
                      <input type="text" value={currentResume.personalInfo?.location || ''} onChange={(e) => handlePersonalInfoChange('location', e.target.value)} placeholder="San Francisco, CA" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">Website</label>
                      <input type="text" value={currentResume.personalInfo?.website || ''} onChange={(e) => handlePersonalInfoChange('website', e.target.value)} placeholder="https://janedoe.dev" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">LinkedIn</label>
                      <input type="text" value={currentResume.personalInfo?.linkedin || ''} onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)} placeholder="linkedin.com/in/jane" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400 text-[10px]">GitHub</label>
                      <input type="text" value={currentResume.personalInfo?.github || ''} onChange={(e) => handlePersonalInfoChange('github', e.target.value)} placeholder="github.com/janedoe" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 text-[10px]">Photo URL</label>
                    <input type="text" value={currentResume.personalInfo?.photo || ''} onChange={(e) => handlePersonalInfoChange('photo', e.target.value)} placeholder="https://... or base64" className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                  </div>
                </div>
              )}

              {/* STEP 2: EDUCATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Education</h3>
                  {currentResume.education.map((edu, idx) => (
                    <motion.div key={idx} layout className="flex justify-between items-center bg-slate-100/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <div>
                        <span className="font-bold text-[11px]">{edu.degree} in {edu.fieldOfStudy}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{edu.institution} | {edu.startDate} - {edu.current ? 'Present' : edu.endDate}</p>
                      </div>
                      <button onClick={() => dispatch(removeEducation(idx))} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={12} /></button>
                    </motion.div>
                  ))}
                  <div className="border-t border-slate-200/20 pt-4 space-y-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Add Education</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Degree" value={newEdu.degree} onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="Field of Study" value={newEdu.fieldOfStudy} onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <input type="text" placeholder="Institution" value={newEdu.institution} onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Start Date" value={newEdu.startDate} onChange={(e) => setNewEdu({ ...newEdu, startDate: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="End Date" value={newEdu.endDate} onChange={(e) => setNewEdu({ ...newEdu, endDate: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleAddEdu} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-bold text-[11px] shadow-md shadow-primary/15"><Plus size={12} /> Add</motion.button>
                  </div>
                </div>
              )}

              {/* STEP 3: SKILLS */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResume.skills.map((skill, idx) => (
                      <motion.span key={idx} layout className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-800/80 text-[10px] font-bold">
                        {skill.name} <span className="text-slate-400">{skill.level}/5</span>
                        <button onClick={() => dispatch(removeSkill(idx))} className="text-red-400 hover:text-red-500 ml-0.5">×</button>
                      </motion.span>
                    ))}
                  </div>
                  <div className="border-t border-slate-200/20 pt-4 space-y-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Add Skill</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" placeholder="Skill name" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} className="p-2.5 col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <select value={newSkill.level} onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none input-premium">
                        <option value="1">1-Beg</option><option value="2">2-Int</option><option value="3">3-Mid</option><option value="4">4-Adv</option><option value="5">5-Exp</option>
                      </select>
                    </div>
                    <input type="text" placeholder="Category (e.g. Frontend)" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleAddSkill} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-bold text-[11px] shadow-md shadow-primary/15"><Plus size={12} /> Add Skill</motion.button>
                  </div>
                </div>
              )}

              {/* STEP 4: EXPERIENCE */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Work Experience</h3>
                  {currentResume.experience.map((exp, idx) => (
                    <motion.div key={idx} layout className="flex justify-between items-center bg-slate-100/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <div>
                        <span className="font-bold text-[11px]">{exp.position}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{exp.company} | {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                      </div>
                      <button onClick={() => dispatch(removeExperience(idx))} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={12} /></button>
                    </motion.div>
                  ))}
                  <div className="border-t border-slate-200/20 pt-4 space-y-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Add Experience</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Company" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="Position" value={newExp.position} onChange={(e) => setNewExp({ ...newExp, position: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" placeholder="Location" value={newExp.location} onChange={(e) => setNewExp({ ...newExp, location: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="Start" value={newExp.startDate} onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="End" value={newExp.endDate} onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <textarea placeholder="Description..." value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} rows={2} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    <div className="space-y-2">
                      <label className="font-bold text-slate-400 text-[10px]">Key Achievements</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="e.g., Scaled API by 40%" value={newExpAch} onChange={(e) => setNewExpAch(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                        <button type="button" onClick={() => { if (!newExpAch) return; setNewExp({ ...newExp, keyAchievements: [...newExp.keyAchievements, newExpAch] }); setNewExpAch(''); }} className="px-3 bg-secondary text-white rounded-xl font-bold text-[11px]">+</button>
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5">{newExp.keyAchievements.map((ach, i) => <li key={i} className="text-[10px] text-slate-400">{ach}</li>)}</ul>
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleAddExp} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-bold text-[11px] shadow-md shadow-primary/15"><Plus size={12} /> Add Experience</motion.button>
                  </div>
                </div>
              )}

              {/* STEP 5: PROJECTS */}
              {step === 5 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Projects</h3>
                  {currentResume.projects.map((proj, idx) => (
                    <motion.div key={idx} layout className="flex justify-between items-center bg-slate-100/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <div>
                        <span className="font-bold text-[11px]">{proj.name}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{proj.technologies.join(', ')}</p>
                      </div>
                      <button onClick={() => dispatch(removeProject(idx))} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={12} /></button>
                    </motion.div>
                  ))}
                  <div className="border-t border-slate-200/20 pt-4 space-y-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Add Project</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Project Name" value={newProj.name} onChange={(e) => setNewProj({ ...newProj, name: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="Role" value={newProj.role} onChange={(e) => setNewProj({ ...newProj, role: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <textarea placeholder="Description..." value={newProj.description} onChange={(e) => setNewProj({ ...newProj, description: e.target.value })} rows={2} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    <div className="space-y-2">
                      <label className="font-bold text-slate-400 text-[10px]">Technologies</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="e.g. React, Node" value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                        <button type="button" onClick={() => { if (!newProjTech) return; setNewProj({ ...newProj, technologies: [...newProj.technologies, newProjTech] }); setNewProjTech(''); }} className="px-3 bg-secondary text-white rounded-xl font-bold text-[11px]">+</button>
                      </div>
                      <div className="flex flex-wrap gap-1">{newProj.technologies.map((t, i) => <span key={i} className="bg-slate-200/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded text-[9px] font-bold">{t}</span>)}</div>
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleAddProj} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-bold text-[11px] shadow-md shadow-primary/15"><Plus size={12} /> Add Project</motion.button>
                  </div>
                </div>
              )}

              {/* STEP 6: CERTIFICATIONS */}
              {step === 6 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Certifications</h3>
                  {currentResume.certifications.map((cert, idx) => (
                    <motion.div key={idx} layout className="flex justify-between items-center bg-slate-100/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <div><span className="font-bold text-[11px]">{cert.name}</span><p className="text-[10px] text-slate-400 mt-0.5">{cert.issuer} | {cert.date}</p></div>
                      <button onClick={() => dispatch(removeCertification(idx))} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={12} /></button>
                    </motion.div>
                  ))}
                  <div className="border-t border-slate-200/20 pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Certification Name" value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="Issuer" value={newCert.issuer} onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Date" value={newCert.date} onChange={(e) => setNewCert({ ...newCert, date: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="url" placeholder="Verification URL" value={newCert.url} onChange={(e) => setNewCert({ ...newCert, url: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleAddCert} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-bold text-[11px] shadow-md shadow-primary/15"><Plus size={12} /> Add Certification</motion.button>
                  </div>
                </div>
              )}

              {/* STEP 7: ACHIEVEMENTS */}
              {step === 7 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">Achievements</h3>
                  {currentResume.achievements.map((ach, idx) => (
                    <motion.div key={idx} layout className="flex justify-between items-center bg-slate-100/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <div><span className="font-bold text-[11px]">{ach.title}</span><p className="text-[10px] text-slate-400 mt-0.5">{ach.date}</p></div>
                      <button onClick={() => dispatch(removeAchievement(idx))} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={12} /></button>
                    </motion.div>
                  ))}
                  <div className="border-t border-slate-200/20 pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Title" value={newAch.title} onChange={(e) => setNewAch({ ...newAch, title: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                      <input type="text" placeholder="Date" value={newAch.date} onChange={(e) => setNewAch({ ...newAch, date: e.target.value })} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    </div>
                    <textarea placeholder="Description..." value={newAch.description} onChange={(e) => setNewAch({ ...newAch, description: e.target.value })} rows={2} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleAddAch} className="flex items-center gap-1 px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-bold text-[11px] shadow-md shadow-primary/15"><Plus size={12} /> Add Achievement</motion.button>
                  </div>
                </div>
              )}

              {/* STEP 8: AI OPTIMIZATION */}
              {step === 8 && (
                <div className="space-y-5">
                  {/* Score */}
                  <div className="p-4 bg-gradient-to-tr from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-primary" />
                        <div>
                          <h3 className="font-bold text-sm">Resume Score</h3>
                          <p className="text-[10px] text-slate-500">{currentResume.resumeScore || 0}/100</p>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runAiScoreAnalysis} disabled={aiLoading} className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-extrabold text-[11px] shadow-md shadow-primary/15 disabled:opacity-60">
                        {aiLoading ? 'Analyzing...' : 'Run Audit'}
                      </motion.button>
                    </div>
                    {currentResume.resumeScore > 0 && (
                      <div className="w-full bg-white/50 dark:bg-slate-800/50 rounded-full h-2 mt-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${currentResume.resumeScore}%` }} transition={{ duration: 1 }} className={`h-2 rounded-full ${currentResume.resumeScore >= 80 ? 'bg-emerald-500' : currentResume.resumeScore >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} />
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {currentResume.aiSuggestions && currentResume.aiSuggestions.length > 0 && (
                    <div className="glass-card rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-amber-500 flex items-center gap-1 text-[11px]"><AlertCircle size={12} /> AI Suggestions</h4>
                      <ul className="space-y-1.5">{currentResume.aiSuggestions.map((s, i) => <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2"><CheckCircle size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />{s}</li>)}</ul>
                    </div>
                  )}

                  {/* ATS Matcher */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">ATS Keyword Matcher</h3>
                    <textarea placeholder="Paste job description here..." value={aiJobDescription} onChange={(e) => setAiJobDescription(e.target.value)} rows={3} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={runAtsCheck} disabled={aiLoading || !aiJobDescription} className="px-4 py-2 rounded-xl text-white bg-secondary hover:bg-secondary-dark font-bold text-[11px] disabled:opacity-50">
                      {aiLoading ? 'Comparing...' : 'Check ATS Match'}
                    </motion.button>
                    {atsAnalysis && (
                      <div className="glass-card rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between font-bold text-[11px]"><span>ATS Match</span><span className="text-emerald-500">{atsAnalysis.matchPercentage}%</span></div>
                        <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-1.5"><motion.div initial={{ width: 0 }} animate={{ width: `${atsAnalysis.matchPercentage}%` }} className="h-1.5 rounded-full bg-emerald-500" /></div>
                        <div><span className="font-bold text-[10px] text-emerald-400">Matching:</span><p className="text-slate-500 text-[10px]">{atsAnalysis.matchingKeywords?.join(', ')}</p></div>
                        <div><span className="font-bold text-[10px] text-red-400">Missing:</span><p className="text-slate-500 text-[10px]">{atsAnalysis.missingKeywords?.join(', ')}</p></div>
                      </div>
                    )}
                  </div>

                  {/* Auto-Generate from Profiles */}
                  <div className="p-4 bg-gradient-to-tr from-accent/10 to-primary/10 border border-accent/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Wand2 size={16} className="text-accent" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Auto-Generate Resume</h3>
                        <p className="text-[10px] text-slate-500">AI builds your resume from LinkedIn & GitHub profiles</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <input type="url" placeholder="LinkedIn Profile URL (e.g. https://linkedin.com/in/yourname)" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium text-[11px]" />
                      <input type="url" placeholder="GitHub Profile URL (e.g. https://github.com/yourname)" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary/50 input-premium text-[11px]" />
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={generateFromProfiles} disabled={profileLoading} className="w-full py-2.5 rounded-xl text-white bg-gradient-to-r from-accent to-primary font-extrabold text-[11px] shadow-md shadow-accent/20 disabled:opacity-60 flex items-center justify-center gap-2">
                      {profileLoading ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>) : (<><Wand2 size={12} /> Generate Resume from Profiles</>)}
                    </motion.button>
                  </div>

                  {/* AI Content Generators */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">AI Content Generators</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Summary', fn: generateSummary, icon: Wand2 },
                        { label: 'Objective', fn: generateObjective, icon: Target },
                        { label: 'Skill Recs', fn: recommendSkills, icon: Code },
                        { label: 'LinkedIn', fn: generateLinkedInHeadlines, icon: Copy },
                        { label: 'Cover Letter', fn: generateCoverLetter, icon: FileText },
                        { label: 'Interview Prep', fn: generateInterviewPrep, icon: MessageSquare },
                      ].map((btn) => (
                        <motion.button key={btn.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={btn.fn} disabled={aiLoading} className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold text-[10px] flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors">
                          <btn.icon size={11} /> {aiLoading ? 'Loading...' : btn.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* AI Outputs */}
                  {aiSummary && (
                    <div className="glass-card rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center"><h4 className="font-bold text-primary text-[11px]">AI Summary</h4><button onClick={() => copyToClipboard(aiSummary)} className="text-[10px] text-slate-400 hover:text-primary">{copiedText === aiSummary ? 'Copied!' : 'Copy'}</button></div>
                      <p className="text-slate-500 text-[11px] leading-relaxed p-3 bg-slate-100/50 dark:bg-slate-900/60 rounded-xl">{aiSummary}</p>
                    </div>
                  )}
                  {aiObjective && (
                    <div className="glass-card rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center"><h4 className="font-bold text-primary text-[11px]">Career Objective</h4><button onClick={() => copyToClipboard(aiObjective)} className="text-[10px] text-slate-400 hover:text-primary">{copiedText === aiObjective ? 'Copied!' : 'Copy'}</button></div>
                      <p className="text-slate-500 text-[11px] leading-relaxed p-3 bg-slate-100/50 dark:bg-slate-900/60 rounded-xl">{aiObjective}</p>
                    </div>
                  )}
                  {aiSkillRecs.length > 0 && (
                    <div className="glass-card rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-primary text-[11px]">Recommended Skills</h4>
                      <div className="flex flex-wrap gap-1.5">{aiSkillRecs.map((s, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold">{s}</span>)}</div>
                    </div>
                  )}
                  {linkedinHeadlines.length > 0 && (
                    <div className="glass-card rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-primary text-[11px]">LinkedIn Headlines</h4>
                      <div className="space-y-1.5">{linkedinHeadlines.map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-100/50 dark:bg-slate-900/60 rounded-lg">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">{h}</span>
                          <button onClick={() => copyToClipboard(h)} className="text-[9px] text-slate-400 hover:text-primary ml-2">{copiedText === h ? 'Copied!' : 'Copy'}</button>
                        </div>
                      ))}</div>
                    </div>
                  )}
                  {customLetter && (
                    <div className="glass-card rounded-2xl p-4 space-y-2">
                      <h4 className="font-bold text-primary text-[11px]">Cover Letter</h4>
                      <p className="text-slate-500 text-[11px] whitespace-pre-line leading-relaxed p-3 bg-slate-100/50 dark:bg-slate-900/60 rounded-xl">{customLetter}</p>
                    </div>
                  )}
                  {prepQuestions && (
                    <div className="glass-card rounded-2xl p-4 space-y-4 text-[11px]">
                      <h4 className="font-bold text-primary">Interview Questions</h4>
                      {prepQuestions.technical && <div><span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px] mb-2">Technical</span>{prepQuestions.technical.map((q: any, i: number) => <div key={i} className="mb-2"><p className="font-bold text-slate-700 dark:text-slate-300">{q.question}</p><p className="text-slate-500 italic pl-2 text-[10px]">Points: {q.expectedPoints?.join(', ')}</p></div>)}</div>}
                      {prepQuestions.behavioral && <div><span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px] mb-2">Behavioral</span>{prepQuestions.behavioral.map((q: any, i: number) => <div key={i} className="mb-2"><p className="font-bold text-slate-700 dark:text-slate-300">{q.question}</p><p className="text-slate-500 italic pl-2 text-[10px]">Points: {q.expectedPoints?.join(', ')}</p></div>)}</div>}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT - PREVIEW */}
        <div className="bg-slate-200/30 dark:bg-slate-900/30 p-3 md:p-6 flex flex-col items-center overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-200px)] select-none">
          <div className="w-full max-w-[820px] flex justify-between items-center bg-white/70 dark:bg-slate-900/70 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800/80 mb-3 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
            <div className="flex gap-1.5">
              <button onClick={() => setZoom(prev => Math.max(50, prev - 10))} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><ZoomOut size={12} /></button>
              <span className="text-[10px] font-bold text-slate-400 px-2">{zoom}%</span>
              <button onClick={() => setZoom(prev => Math.min(150, prev + 10))} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><ZoomIn size={12} /></button>
            </div>
          </div>
          <div className="w-full flex justify-center overflow-x-auto">
            <ResumeRenderer data={currentResume} zoom={zoom} />
          </div>
        </div>
      </div>
    </div>
  );
};
