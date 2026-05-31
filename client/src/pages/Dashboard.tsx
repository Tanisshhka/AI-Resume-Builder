import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAppDispatch, useAppSelector } from '../store';
import { setMyResumes, setCurrentResume } from '../features/resumeSlice';
import { 
  FileText, Sparkles, Plus, Trash2, Edit3, Share2, 
  Briefcase, CheckCircle, ExternalLink, RefreshCw,
  TrendingUp, Clock, ArrowUpRight, BarChart3,
  Zap, Target, Award, Eye
} from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

interface DashboardProps {
  onEditResume: () => void;
  onViewShare: (slug: string) => void;
}

const MiniChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((val, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(val / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="w-1.5 rounded-full"
          style={{ background: color, minHeight: '2px' }}
        />
      ))}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onEditResume, onViewShare }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobStatus, setJobStatus] = useState('bookmarked');
  const [jobSalary, setJobSalary] = useState('');
  const [jobUrl, setJobUrl] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resumeList, jobList] = await Promise.all([
        api.get('/resumes'),
        api.get('/jobs')
      ]);
      setResumes(resumeList);
      dispatch(setMyResumes(resumeList));
      setJobs(jobList);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleCreateResume = async () => {
    setActionLoading(true);
    try {
      const newResume = await api.post('/resumes', { title: 'New AI Resume', templateId: 'ats-modern' });
      dispatch(setCurrentResume(newResume));
      onEditResume();
    } catch (err: any) {
      alert(err.message || 'Failed to create resume');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectResume = async (id: string) => {
    try {
      const fullResume = await api.get(`/resumes/${id}`);
      dispatch(setCurrentResume(fullResume));
      onEditResume();
    } catch (err: any) {
      alert(err.message || 'Failed to fetch resume');
    }
  };

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try { await api.delete(`/resumes/${id}`); fetchDashboardData(); } catch (err: any) { alert(err.message); }
  };

  const handleToggleShare = async (id: string, currentPublic: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await api.post(`/resumes/${id}/share`, { isPublic: !currentPublic });
      fetchDashboardData();
      if (!currentPublic) { triggerConfetti(); }
    } catch (err: any) { alert(err.message); }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) return;
    try {
      await api.post('/jobs', { companyName, jobTitle, status: jobStatus, salary: jobSalary, url: jobUrl });
      setShowJobModal(false);
      setCompanyName(''); setJobTitle(''); setJobStatus('bookmarked'); setJobSalary(''); setJobUrl('');
      fetchDashboardData();
    } catch (err: any) { alert(err.message); }
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try { await api.put(`/jobs/${jobId}`, { status: newStatus }); fetchDashboardData(); } catch (err: any) { alert(err.message); }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Remove this job?')) return;
    try { await api.delete(`/jobs/${jobId}`); fetchDashboardData(); } catch (err: any) { alert(err.message); }
  };

  const averageScore = resumes.length > 0 ? Math.round(resumes.reduce((acc, r) => acc + (r.resumeScore || 0), 0) / resumes.length) : 0;
  const appliedJobsCount = jobs.filter(j => j.status === 'applied' || j.status === 'interviewing').length;
  const interviewsCount = jobs.filter(j => j.status === 'interviewing').length;
  const offeredCount = jobs.filter(j => j.status === 'offered').length;
  const completionRate = resumes.length > 0 ? Math.round((resumes.filter(r => (r.resumeScore || 0) > 50).length / resumes.length) * 100) : 0;

  const recentActivity = [
    ...resumes.slice(0, 3).map(r => ({ type: 'resume', title: r.title, time: r.updatedAt, icon: FileText, color: 'text-primary' })),
    ...jobs.slice(0, 3).map(j => ({ type: 'job', title: `${j.jobTitle} at ${j.companyName}`, time: j.createdAt, icon: Briefcase, color: 'text-secondary' })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={16} className="text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-500">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const metrics = [
    { label: 'Total Resumes', value: resumes.length, icon: FileText, gradient: 'from-primary to-primary-dark', change: '+2 this week' },
    { label: 'Avg Score', value: `${averageScore}%`, icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', change: averageScore > 70 ? 'Great!' : 'Keep improving' },
    { label: 'Applications', value: appliedJobsCount, icon: Briefcase, gradient: 'from-secondary to-purple-600', change: `${interviewsCount} interviewing` },
    { label: 'Interview Rate', value: `${appliedJobsCount > 0 ? Math.round((interviewsCount / appliedJobsCount) * 100) : 0}%`, icon: Target, gradient: 'from-emerald-500 to-teal-500', change: `${offeredCount} offers` },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans p-6 pt-24">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/80 pb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Here's an overview of your resume performance and job search pipeline.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateResume}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-xs shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            {actionLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <Plus size={16} />}
            New Resume
          </motion.button>
        </motion.div>

        {/* METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="glass-card rounded-2xl p-5 relative overflow-hidden group card-lift"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl rounded-bl-full opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: `linear-gradient(to bottom left, ${idx === 0 ? '#6C63FF' : idx === 1 ? '#F59E0B' : idx === 2 ? '#8B5CF6' : '#10B981'}, transparent)` }} />
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${m.gradient} text-white shadow-md`}>
                  <m.icon size={14} />
                </div>
              </div>
              <div className="text-2xl font-black">{m.value}</div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{m.change}</p>
            </motion.div>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* RESUMES LIST */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Your Resumes
              </h2>
              <button 
                onClick={fetchDashboardData}
                className="p-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {resumes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-12 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-primary/40" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Resumes Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mb-6">Create your first AI-optimized resume to start landing interviews.</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateResume}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/20"
                >
                  Create Your First Resume
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.map((res, idx) => (
                  <motion.div
                    key={res._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelectResume(res._id)}
                    className="glass-card rounded-2xl p-5 group card-lift cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100/60 dark:bg-slate-800/60 px-2 py-0.5 rounded">{res.templateId?.replace(/-/g, ' ')}</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                        <Award size={10} />
                        {res.resumeScore || 0}%
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Updated {new Date(res.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    {/* Score bar */}
                    <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-1 mt-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${res.resumeScore || 0}%` }}
                        transition={{ delay: 0.3 + idx * 0.05, duration: 0.8 }}
                        className={`h-1 rounded-full ${(res.resumeScore || 0) >= 80 ? 'bg-emerald-500' : (res.resumeScore || 0) >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/50 pt-3 mt-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => handleToggleShare(res._id, res.isPublic, e)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            res.isPublic 
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                              : 'bg-slate-100/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400'
                          }`}
                          title="Toggle Sharing"
                        >
                          <Share2 size={12} />
                        </button>
                        {res.isPublic && res.shareSlug && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onViewShare(res.shareSlug); }}
                            className="p-2 rounded-lg bg-slate-100/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                            title="View Public"
                          >
                            <Eye size={12} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelectResume(res._id); }}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                      <button
                        onClick={(e) => handleDeleteResume(res._id, e)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* AI Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Quick Actions</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Analyze Resume Score', icon: BarChart3, color: 'text-amber-500' },
                  { label: 'ATS Keyword Check', icon: Target, color: 'text-emerald-500' },
                  { label: 'Generate Cover Letter', icon: FileText, color: 'text-blue-500' },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => { if (resumes.length > 0) { handleSelectResume(resumes[0]._id); } }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                  >
                    <action.icon size={14} className={action.color} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">{action.label}</span>
                    <ArrowUpRight size={12} className="ml-auto text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Activity Timeline */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-secondary">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Recent Activity</span>
              </div>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100/60 dark:bg-slate-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <act.icon size={12} className={act.color} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{act.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(act.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
              )}
            </motion.div>

            {/* Tips Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-5 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-primary/10"
            >
              <div className="flex items-center gap-2 text-primary mb-3">
                <Zap size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Pro Tip</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Add quantitative metrics to your experience bullets (e.g., "increased efficiency by 25%") to boost your resume score above 85.
              </p>
            </motion.div>
          </div>
        </div>

        {/* JOB TRACKER */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Briefcase size={16} className="text-secondary" />
                Job Application Tracker
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Track your job search pipeline</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowJobModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Plus size={14} />
              Add Job
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['bookmarked', 'applied', 'interviewing', 'offered', 'rejected'].map((colKey) => {
              const columnJobs = jobs.filter(j => j.status === colKey);
              const colors: Record<string, string> = {
                bookmarked: 'border-slate-300 dark:border-slate-700',
                applied: 'border-blue-300 dark:border-blue-700',
                interviewing: 'border-amber-300 dark:border-amber-700',
                offered: 'border-emerald-300 dark:border-emerald-700',
                rejected: 'border-red-300 dark:border-red-700',
              };
              return (
                <div key={colKey} className={`bg-slate-100/40 dark:bg-slate-900/30 border-t-2 ${colors[colKey]} rounded-2xl p-3 flex flex-col min-h-[250px]`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{colKey}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200/60 dark:bg-slate-800/60 text-slate-500">{columnJobs.length}</span>
                  </div>
                  <div className="flex-grow space-y-2">
                    {columnJobs.map((job) => (
                      <motion.div 
                        key={job._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-xl p-3 text-xs card-lift"
                      >
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">{job.jobTitle}</h4>
                        <p className="text-slate-500 text-[10px] mt-0.5">{job.companyName}</p>
                        {job.salary && <p className="text-slate-400 text-[9px] mt-0.5">{job.salary}</p>}
                        <div className="flex justify-between items-center border-t border-slate-200/20 pt-2 mt-2">
                          <select 
                            value={job.status} 
                            onChange={(e) => handleUpdateJobStatus(job._id, e.target.value)}
                            className="bg-transparent text-[9px] text-slate-400 focus:outline-none cursor-pointer font-semibold"
                          >
                            <option value="bookmarked">Bookmarked</option>
                            <option value="applied">Applied</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="offered">Offered</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button onClick={() => handleDeleteJob(job._id)} className="text-red-400 hover:text-red-500 text-[9px]">
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ADD JOB MODAL */}
      <AnimatePresence>
        {showJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowJobModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-md w-full rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-base font-bold mb-4">Track New Job</h3>
              <form onSubmit={handleAddJob} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company</label>
                    <input type="text" required placeholder="Stripe" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job Title</label>
                    <input type="text" required placeholder="Frontend Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary</label>
                    <input type="text" placeholder="$120,000/yr" value={jobSalary} onChange={(e) => setJobSalary(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                    <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/80 rounded-xl focus:outline-none input-premium">
                      <option value="bookmarked">Bookmarked</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Job URL</label>
                  <input type="url" placeholder="https://..." value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} className="w-full px-3 py-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/80 rounded-xl focus:outline-none focus:border-primary/50 input-premium" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl text-white bg-gradient-to-r from-primary to-secondary font-extrabold shadow-md shadow-primary/15 hover:shadow-primary/30 transition-shadow">Track Job</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
