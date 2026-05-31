import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import type { ResumeData } from '../features/resumeSlice';
import { ResumeRenderer } from '../templates/ResumeRenderer';
import { 
  Sparkles, Mail, MessageSquare, Download, CheckCircle, 
  Phone, Eye 
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfEngine';

interface SharePageProps {
  shareSlug: string;
  onBack: () => void;
}

export const SharePage: React.FC<SharePageProps> = ({ shareSlug, onBack }) => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [recruiterMessage, setRecruiterMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchSharedResume = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/resumes/share/${shareSlug}`);
        setResume(data);
      } catch (err: any) {
        setError(err.message || 'Shared resume could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedResume();
  }, [shareSlug]);

  const handleRecruiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiterMessage.trim()) return;
    
    // Simulate sending message to candidate
    setMessageSent(true);
    setTimeout(() => {
      setRecruiterMessage('');
    }, 2500);
  };

  const handlePdfDownload = async () => {
    if (!resume) return;
    setExporting(true);
    await exportToPDF('printable-resume-container', `${resume.personalInfo?.fullName || 'Resume'}_AI_Resume`);
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-500">Retrieving portfolio content...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100">
        <div className="glass-card max-w-md p-8 text-center rounded-3xl">
          <h2 className="text-lg font-black text-red-500">Resume Unavailable</h2>
          <p className="text-xs text-slate-400 mt-2">{error || 'This link may have been made private or deleted by the creator.'}</p>
          <button 
            onClick={onBack}
            className="mt-6 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/#share/${shareSlug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg text-slate-800 dark:text-slate-100 font-sans p-6 pt-24">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* RESUME DISPLAY FRAME */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="w-full flex justify-between items-center bg-white/60 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 mb-4 backdrop-blur-md">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Eye size={14} className="text-emerald-500" />
              Public Portfolio Recruiter View
            </span>
            <button
              onClick={handlePdfDownload}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white bg-primary hover:bg-primary-dark text-xs font-bold shadow-md shadow-primary/10 transition-colors"
            >
              {exporting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={13} />
              )}
              {exporting ? 'Generating...' : 'Export PDF'}
            </button>
          </div>

          <div className="w-full flex justify-center bg-slate-200/40 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-200/20 dark:border-slate-800/40 overflow-x-auto min-h-[1100px]">
            <ResumeRenderer data={resume} zoom={100} />
          </div>
        </div>

        {/* SIDE ACTIONS / RECRUITER MODE PANEL */}
        <div className="space-y-6">
          {/* QR CODE SHARE CARD */}
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center">
            <h3 className="text-sm font-bold mb-3">Portfolio QR Code</h3>
            <div className="p-3 bg-white rounded-2xl border border-slate-200/55 shadow-sm">
              <img 
                src={qrCodeUrl} 
                alt="Resume QR Code Link" 
                className="w-32 h-32 object-contain"
                onError={(e) => {
                  // Fallback visual
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 leading-relaxed max-w-[200px]">
              Scan this code to load this candidate profile on any mobile browser.
            </p>
          </div>

          {/* RECRUITER INTEREST DRAWER */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-primary">
                <Sparkles size={16} />
                <h3 className="text-sm font-bold">Contact Candidate</h3>
              </div>
              
              <button
                onClick={() => setRecruiterMode(!recruiterMode)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase border transition-colors ${
                  recruiterMode 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400 border-transparent'
                }`}
              >
                {recruiterMode ? 'Recruiter Mode ON' : 'Recruiter Mode OFF'}
              </button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Are you interested in hiring {resume.personalInfo?.fullName || 'this candidate'}? Send an interview invitation or detail request below.
            </p>

            <form onSubmit={handleRecruiterSubmit} className="space-y-3">
              <textarea
                placeholder="Hi! We would love to chat with you regarding our Senior Engineer opening..."
                value={recruiterMessage}
                onChange={(e) => setRecruiterMessage(e.target.value)}
                rows={4}
                className="w-full p-3 text-xs bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/80 rounded-2xl focus:outline-none focus:border-primary/50 text-slate-800 dark:text-white"
              />

              {messageSent ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle size={12} />
                  Simulated Invite Sent Successfully!
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!recruiterMessage.trim()}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
                >
                  <MessageSquare size={13} />
                  Send Invitation
                </button>
              )}
            </form>

            <div className="border-t border-slate-200/20 pt-4 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Contacts</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {resume.personalInfo?.email && (
                  <a href={`mailto:${resume.personalInfo.email}`} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
                    <Mail size={12} />
                    <span>{resume.personalInfo.email}</span>
                  </a>
                )}
                {resume.personalInfo?.phone && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone size={12} />
                    <span>{resume.personalInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
