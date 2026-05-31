import React from 'react';
import type { ResumeData } from '../features/resumeSlice';
import { 
  Mail, Phone, MapPin, Globe, 
  Award, Briefcase, GraduationCap, Code, FolderGit, CheckSquare 
} from 'lucide-react';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = '' }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface ResumeRendererProps {
  data: ResumeData;
  zoom?: number;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ data, zoom = 100 }) => {
  const {
    templateId = 'ats-modern',
    personalInfo = { fullName: '', email: '', phone: '', location: '', title: '', website: '', linkedin: '', github: '', photo: '' },
    education = [],
    experience = [],
    skills = [],
    projects = [],
    certifications = [],
    achievements = [],
    customSections = []
  } = data;

  // Set font class & themes based on selected template
  let fontClass = 'font-sans';
  let primaryColor = 'text-slate-900';
  let accentColorBg = 'bg-primary';
  let accentColorText = 'text-primary';
  let accentBorderColor = 'border-primary';
  let pageBg = 'bg-white';
  let textColor = 'text-slate-700';
  let sectionHeaderClass = 'border-b border-slate-200 pb-1 mb-2 font-bold text-lg';
  let doubleColumn = false;
  let leftColumnWidth = 'w-1/3';
  let rightColumnWidth = 'w-2/3';

  // Customize based on 20 templates
  switch (templateId) {
    case 'ats-modern':
      fontClass = 'font-sans';
      primaryColor = 'text-slate-900';
      accentColorText = 'text-slate-950';
      accentBorderColor = 'border-slate-800';
      textColor = 'text-slate-800';
      sectionHeaderClass = 'border-b-2 border-slate-800 pb-0.5 mb-2 font-extrabold uppercase tracking-wide text-[13px]';
      break;

    case 'modern-executive':
      fontClass = 'font-sans';
      primaryColor = 'text-[#1E3A8A]'; // Dark Blue
      accentColorText = 'text-[#1E3A8A]';
      accentColorBg = 'bg-[#1E3A8A]';
      accentBorderColor = 'border-[#1E3A8A]';
      textColor = 'text-slate-700';
      sectionHeaderClass = 'border-l-4 border-[#1E3A8A] pl-2 mb-2 font-bold uppercase tracking-wider text-[14px] bg-slate-50 py-0.5';
      break;

    case 'creative-portfolio':
      fontClass = 'font-sans';
      primaryColor = 'text-[#7C3AED]'; // Purple
      accentColorText = 'text-[#7C3AED]';
      accentColorBg = 'bg-[#7C3AED]';
      accentBorderColor = 'border-[#7C3AED]';
      doubleColumn = true;
      leftColumnWidth = 'w-1/3 pr-4 border-r border-slate-100';
      rightColumnWidth = 'w-2/3 pl-4';
      sectionHeaderClass = 'border-b-2 border-[#7C3AED] pb-1 mb-3 font-semibold text-[14px] uppercase tracking-wide';
      break;

    case 'startup-style':
      fontClass = 'font-sans';
      primaryColor = 'text-slate-900';
      accentColorText = 'text-indigo-600';
      accentColorBg = 'bg-indigo-600';
      accentBorderColor = 'border-indigo-600';
      textColor = 'text-slate-600';
      sectionHeaderClass = 'mb-3 font-bold text-[14px] text-indigo-600 uppercase tracking-widest flex items-center gap-1 after:content-[""] after:flex-grow after:h-px after:bg-indigo-100 after:ml-2';
      break;

    case 'harvard-style':
      fontClass = 'font-serif'; // Lora or Playfair style
      primaryColor = 'text-[#800000]'; // Harvard Crimson
      accentColorText = 'text-[#800000]';
      accentColorBg = 'bg-[#800000]';
      accentBorderColor = 'border-[#800000]';
      textColor = 'text-slate-900';
      sectionHeaderClass = 'border-b border-[#800000] pb-0.5 mb-3 text-center uppercase tracking-widest font-semibold text-[12px]';
      break;

    case 'tech-professional':
      fontClass = 'font-mono'; // Monospace tech theme
      primaryColor = 'text-emerald-700';
      accentColorText = 'text-emerald-700';
      accentColorBg = 'bg-emerald-700';
      accentBorderColor = 'border-emerald-600';
      textColor = 'text-slate-800';
      sectionHeaderClass = 'border-b border-dashed border-emerald-300 pb-1 mb-3 font-bold text-[13px] uppercase tracking-wide';
      break;

    case 'minimalist':
      fontClass = 'font-sans';
      primaryColor = 'text-slate-800';
      accentColorText = 'text-slate-800';
      accentBorderColor = 'border-slate-300';
      textColor = 'text-slate-600';
      sectionHeaderClass = 'border-b border-slate-200 pb-0.5 mb-2 font-medium text-[13px] tracking-wider uppercase';
      break;

    case 'accent-bold':
      fontClass = 'font-sans';
      primaryColor = 'text-white';
      accentColorText = 'text-[#3B82F6]'; // Blue
      accentColorBg = 'bg-[#3B82F6]';
      accentBorderColor = 'border-[#3B82F6]';
      doubleColumn = true;
      leftColumnWidth = 'w-[30%] bg-slate-900 text-white p-4 -ml-6 -mt-6 -mb-6 min-h-[1050px]';
      rightColumnWidth = 'w-[70%] pl-6';
      sectionHeaderClass = 'border-b-2 border-slate-700 pb-1 mb-3 font-semibold text-[13px] uppercase tracking-wide text-slate-300';
      break;

    case 'grid-portfolio':
      fontClass = 'font-sans';
      primaryColor = 'text-[#0EA5E9]'; // Sky Blue
      accentColorText = 'text-[#0EA5E9]';
      accentColorBg = 'bg-[#0EA5E9]';
      accentBorderColor = 'border-[#0EA5E9]';
      textColor = 'text-slate-700';
      sectionHeaderClass = 'border-b border-sky-100 pb-1 mb-3 font-bold text-[15px] text-sky-800';
      break;

    case 'elegant-premium':
      fontClass = 'font-serif';
      primaryColor = 'text-[#B45309]'; // Amber / Gold tone
      accentColorText = 'text-[#B45309]';
      accentColorBg = 'bg-[#B45309]';
      accentBorderColor = 'border-[#B45309]';
      textColor = 'text-slate-800';
      sectionHeaderClass = 'border-b-2 border-[#B45309] pb-1 mb-3 text-[14px] uppercase tracking-widest font-semibold text-center italic';
      break;

    case 'academic-cv':
      fontClass = 'font-serif';
      primaryColor = 'text-slate-900';
      accentColorText = 'text-slate-900';
      accentBorderColor = 'border-slate-800';
      textColor = 'text-slate-800';
      sectionHeaderClass = 'border-b border-slate-900 pb-0.5 mb-2 font-bold text-[13px] tracking-wide uppercase';
      break;

    case 'designer-dark':
      fontClass = 'font-sans';
      primaryColor = 'text-cyan-400';
      accentColorText = 'text-cyan-400';
      accentColorBg = 'bg-cyan-500';
      accentBorderColor = 'border-cyan-500';
      pageBg = 'bg-[#1E293B] text-slate-100';
      textColor = 'text-slate-300';
      sectionHeaderClass = 'border-b border-slate-700 pb-1 mb-3 text-cyan-400 font-bold uppercase tracking-wider text-[13px]';
      break;

    case 'engineering-standard':
      fontClass = 'font-sans';
      primaryColor = 'text-[#0F766E]'; // Teal
      accentColorText = 'text-[#0F766E]';
      accentColorBg = 'bg-[#0F766E]';
      accentBorderColor = 'border-[#0F766E]';
      textColor = 'text-slate-700';
      sectionHeaderClass = 'border-b-2 border-[#0F766E] pb-0.5 mb-2 font-bold uppercase tracking-wider text-[13px]';
      break;

    case 'management-lead':
      fontClass = 'font-sans';
      primaryColor = 'text-[#475569]'; // Slate Lead
      accentColorText = 'text-[#475569]';
      accentColorBg = 'bg-[#475569]';
      accentBorderColor = 'border-[#475569]';
      textColor = 'text-slate-700';
      sectionHeaderClass = 'border-l-4 border-slate-500 pl-2 mb-2 font-bold uppercase tracking-wider text-[13px] bg-slate-100 py-1';
      break;

    case 'finance-pro':
      fontClass = 'font-serif';
      primaryColor = 'text-[#1E293B]';
      accentColorText = 'text-slate-800';
      accentBorderColor = 'border-slate-800';
      textColor = 'text-slate-900';
      sectionHeaderClass = 'border-b-2 border-slate-900 pb-0.5 mb-2 font-extrabold uppercase tracking-wide text-[12px]';
      break;

    case 'marketing-creative':
      fontClass = 'font-sans';
      primaryColor = 'text-pink-600';
      accentColorText = 'text-pink-600';
      accentColorBg = 'bg-pink-600';
      accentBorderColor = 'border-pink-300';
      doubleColumn = true;
      leftColumnWidth = 'w-[32%] border-r border-pink-100 pr-4';
      rightColumnWidth = 'w-[68%] pl-4';
      sectionHeaderClass = 'border-b-2 border-pink-500 pb-1 mb-3 font-semibold text-[13px] uppercase text-pink-700';
      break;

    case 'sales-driver':
      fontClass = 'font-sans';
      primaryColor = 'text-[#15803D]'; // Green
      accentColorText = 'text-[#15803D]';
      accentColorBg = 'bg-[#15803D]';
      accentBorderColor = 'border-[#15803D]';
      doubleColumn = true;
      leftColumnWidth = 'w-[30%] border-r border-slate-200 pr-4';
      rightColumnWidth = 'w-[70%] pl-4';
      sectionHeaderClass = 'border-b-2 border-green-700 pb-1 mb-2 font-bold uppercase text-[12px]';
      break;

    case 'freelancer-tech':
      fontClass = 'font-mono';
      primaryColor = 'text-blue-700';
      accentColorText = 'text-blue-700';
      accentColorBg = 'bg-blue-600';
      accentBorderColor = 'border-blue-600';
      textColor = 'text-slate-800';
      sectionHeaderClass = 'border-b border-blue-400 pb-1 mb-3 font-bold text-[13px] uppercase';
      break;

    case 'healthcare-pro':
      fontClass = 'font-sans';
      primaryColor = 'text-[#0D9488]'; // Teal clinical
      accentColorText = 'text-[#0D9488]';
      accentColorBg = 'bg-[#0D9488]';
      accentBorderColor = 'border-[#0D9488]';
      textColor = 'text-slate-700';
      sectionHeaderClass = 'border-b border-teal-200 pb-1 mb-2 font-bold uppercase tracking-wider text-[13px] text-teal-800';
      break;

    case 'student-entry':
      fontClass = 'font-sans';
      primaryColor = 'text-indigo-600';
      accentColorText = 'text-indigo-600';
      accentColorBg = 'bg-indigo-600';
      accentBorderColor = 'border-indigo-500';
      textColor = 'text-slate-600';
      sectionHeaderClass = 'border-b-2 border-indigo-500 pb-0.5 mb-2 font-bold text-[13px] uppercase tracking-wide';
      break;
  }

  // Sub-renderers
  const renderHeader = () => {
    // Left bold bar headers or centered Harvard headers
    if (templateId === 'harvard-style' || templateId === 'elegant-premium') {
      return (
        <div className="text-center mb-6">
          <h1 className={`text-3xl font-extrabold tracking-wide uppercase ${primaryColor}`}>{personalInfo.fullName || 'YOUR NAME'}</h1>
          <p className="text-sm font-medium tracking-widest text-slate-500 uppercase mt-1">{personalInfo.title}</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-3 max-w-xl mx-auto border-t border-slate-100 pt-2">
            {personalInfo.email && <span className="flex items-center gap-1"><Mail size={10} /> {personalInfo.email}</span>}
            {personalInfo.phone && <span className="flex items-center gap-1"><Phone size={10} /> {personalInfo.phone}</span>}
            {personalInfo.location && <span className="flex items-center gap-1"><MapPin size={10} /> {personalInfo.location}</span>}
            {personalInfo.website && <span className="flex items-center gap-1"><Globe size={10} /> {personalInfo.website}</span>}
          </div>
        </div>
      );
    }

    if (templateId === 'accent-bold') {
      return (
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{personalInfo.fullName || 'YOUR NAME'}</h1>
          <p className="text-sm text-slate-400 font-medium uppercase mt-0.5">{personalInfo.title}</p>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-start gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${primaryColor}`}>{personalInfo.fullName || 'YOUR NAME'}</h1>
          <p className={`text-base font-semibold uppercase mt-0.5 ${accentColorText}`}>{personalInfo.title}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
            {personalInfo.email && <span className="flex items-center gap-1"><Mail size={12} /> {personalInfo.email}</span>}
            {personalInfo.phone && <span className="flex items-center gap-1"><Phone size={12} /> {personalInfo.phone}</span>}
            {personalInfo.location && <span className="flex items-center gap-1"><MapPin size={12} /> {personalInfo.location}</span>}
            {personalInfo.website && <span className="flex items-center gap-1"><Globe size={12} /> {personalInfo.website}</span>}
            {personalInfo.linkedin && <span className="flex items-center gap-1"><LinkedinIcon size={12} /> {personalInfo.linkedin}</span>}
            {personalInfo.github && <span className="flex items-center gap-1"><GithubIcon size={12} /> {personalInfo.github}</span>}
          </div>
        </div>
        
        {personalInfo.photo && (
          <img 
            src={personalInfo.photo} 
            alt={personalInfo.fullName} 
            className="w-16 h-16 rounded-lg object-cover border border-slate-200"
          />
        )}
      </div>
    );
  };

  const renderSectionHeader = (title: string, IconComponent: any) => {
    const isDarkTheme = templateId === 'designer-dark';
    const headerColorClass = isDarkTheme ? 'text-cyan-400 border-slate-700' : 'text-slate-800 border-slate-200';
    
    let appliedClass = sectionHeaderClass;
    if (templateId === 'ats-modern') appliedClass = 'border-b-2 border-slate-800 pb-0.5 mb-2 font-extrabold uppercase tracking-wide text-[12px] text-slate-900';
    else if (templateId === 'harvard-style') appliedClass = 'border-b border-[#800000] pb-0.5 mb-2 text-center uppercase tracking-widest font-semibold text-[11px] text-[#800000]';
    
    return (
      <h2 className={`${appliedClass} flex items-center gap-1.5`}>
        {templateId !== 'harvard-style' && <IconComponent size={14} className={templateId === 'designer-dark' ? 'text-cyan-400' : accentColorText} />}
        <span>{title}</span>
      </h2>
    );
  };

  const renderEducation = () => {
    if (education.length === 0) return null;
    return (
      <div className="mb-5">
        {renderSectionHeader('Education', GraduationCap)}
        <div className="space-y-3">
          {education.map((edu, idx) => (
            <div key={idx} className="text-xs">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100">
                <span>{edu.degree} in {edu.fieldOfStudy}</span>
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">{edu.institution}</div>
              {edu.description && <p className="text-slate-500 dark:text-slate-400 mt-1">{edu.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (experience.length === 0) return null;
    return (
      <div className="mb-5">
        {renderSectionHeader('Experience', Briefcase)}
        <div className="space-y-4">
          {experience.map((exp, idx) => (
            <div key={idx} className="text-xs">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100">
                <span>{exp.position}</span>
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-semibold mb-1">
                {exp.company} {exp.location && `| ${exp.location}`}
              </div>
              {exp.description && <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{exp.description}</p>}
              
              {exp.keyAchievements && exp.keyAchievements.length > 0 && (
                <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-slate-500 dark:text-slate-400 pl-1 leading-relaxed">
                  {exp.keyAchievements.map((ach, aIdx) => (
                    <li key={aIdx}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (skills.length === 0) return null;
    
    // Group skills by category if categories exist
    const categories: Record<string, typeof skills> = {};
    skills.forEach(s => {
      const cat = s.category || 'General Skills';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s);
    });

    return (
      <div className="mb-5">
        {renderSectionHeader('Skills', Code)}
        <div className="space-y-2">
          {Object.entries(categories).map(([catName, skillList], idx) => (
            <div key={idx} className="text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">{catName}: </span>
              <span className="text-slate-600 dark:text-slate-400">
                {skillList.map(s => s.name).join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (projects.length === 0) return null;
    return (
      <div className="mb-5">
        {renderSectionHeader('Projects', FolderGit)}
        <div className="space-y-4">
          {projects.map((proj, idx) => (
            <div key={idx} className="text-xs">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100">
                <span>{proj.name}</span>
                <span className="font-normal text-slate-500 dark:text-slate-400 flex gap-2">
                  {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="underline hover:text-primary">Live</a>}
                  {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="underline hover:text-primary">GitHub</a>}
                </span>
              </div>
              {proj.role && <div className="text-slate-500 font-medium text-[11px] mb-0.5">{proj.role}</div>}
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {proj.technologies.map((tech, tIdx) => (
                    <span 
                      key={tIdx} 
                      className={`px-1.5 py-0.5 rounded text-[10px] ${templateId === 'designer-dark' ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (certifications.length === 0) return null;
    return (
      <div className="mb-4">
        {renderSectionHeader('Certifications', Award)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {certifications.map((cert, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{cert.name}</span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{cert.issuer}</p>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">{cert.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    if (achievements.length === 0) return null;
    return (
      <div className="mb-4">
        {renderSectionHeader('Achievements & Awards', CheckSquare)}
        <div className="space-y-2 text-xs">
          {achievements.map((ach, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{ach.title}</span>
                {ach.description && <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{ach.description}</p>}
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">{ach.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSections = () => {
    if (customSections.length === 0) return null;
    return customSections.map((sect, sIdx) => (
      <div key={sIdx} className="mb-5">
        {renderSectionHeader(sect.sectionTitle, Award)}
        <div className="space-y-3">
          {sect.items && sect.items.map((item, idx) => (
            <div key={idx} className="text-xs">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100">
                <span>{item.title}</span>
                <span className="font-normal text-slate-400 dark:text-slate-500">{item.date}</span>
              </div>
              {item.subtitle && <div className="text-slate-500 dark:text-slate-400 font-medium">{item.subtitle}</div>}
              {item.description && <p className="text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Render Page Content Layout
  return (
    <div 
      id="printable-resume-container"
      className={`p-6 md:p-8 rounded shadow-sm w-full select-text text-left ${fontClass} ${pageBg} ${textColor}`}
      style={{ 
        transform: `scale(${zoom / 100})`, 
        transformOrigin: 'top center',
        width: '100%',
        maxWidth: '820px', // Standard A4 max-width
        minHeight: '1050px', // Standard A4 ratio height
        boxSizing: 'border-box'
      }}
    >
      {doubleColumn ? (
        // DOUBLE COLUMN LAYOUT
        <div className="flex gap-4 min-h-full">
          {/* LEFT SIDEBAR PANEL */}
          <div className={leftColumnWidth}>
            {/* If template is accent-bold, profile header is in right column or top left */}
            {templateId === 'accent-bold' && (
              <div className="mb-6 flex flex-col items-center text-center">
                {personalInfo.photo && (
                  <img 
                    src={personalInfo.photo} 
                    alt={personalInfo.fullName} 
                    className="w-20 h-20 rounded-full border-2 border-slate-700 object-cover mb-3"
                  />
                )}
                <h1 className="text-lg font-bold tracking-tight text-white">{personalInfo.fullName || 'YOUR NAME'}</h1>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">{personalInfo.title}</p>
                <div className="flex flex-col gap-2 mt-4 text-[10px] text-slate-300 w-full">
                  {personalInfo.email && <span className="flex items-center gap-1.5"><Mail size={10} /> {personalInfo.email}</span>}
                  {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone size={10} /> {personalInfo.phone}</span>}
                  {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin size={10} /> {personalInfo.location}</span>}
                  {personalInfo.website && <span className="flex items-center gap-1.5"><Globe size={10} /> {personalInfo.website}</span>}
                </div>
              </div>
            )}
            
            {templateId !== 'accent-bold' && personalInfo.photo && (
              <img 
                src={personalInfo.photo} 
                alt={personalInfo.fullName} 
                className="w-24 h-24 rounded-full object-cover border border-slate-200 mb-4 mx-auto"
              />
            )}

            {/* Render personal details if not in header */}
            {templateId !== 'accent-bold' && (
              <div className="mb-6 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                {personalInfo.email && <div className="flex items-center gap-1.5"><Mail size={10} /> {personalInfo.email}</div>}
                {personalInfo.phone && <div className="flex items-center gap-1.5"><Phone size={10} /> {personalInfo.phone}</div>}
                {personalInfo.location && <div className="flex items-center gap-1.5"><MapPin size={10} /> {personalInfo.location}</div>}
                {personalInfo.website && <div className="flex items-center gap-1.5"><Globe size={10} /> {personalInfo.website}</div>}
              </div>
            )}

            {renderSkills()}
            {renderCertifications()}
            {renderAchievements()}
          </div>

          {/* RIGHT BODY PANEL */}
          <div className={rightColumnWidth}>
            {templateId !== 'accent-bold' && renderHeader()}
            {templateId === 'accent-bold' && (
              <div className="mb-5 border-b pb-3">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Results-driven and highly motivated professional, specializing in architecting custom applications, streamlining infrastructure protocols, and delivering modern UI/UX solutions.
                </p>
              </div>
            )}
            {renderExperience()}
            {renderProjects()}
            {renderEducation()}
            {renderCustomSections()}
          </div>
        </div>
      ) : (
        // SINGLE COLUMN STANDARD LAYOUT
        <>
          {renderHeader()}
          {renderExperience()}
          {renderProjects()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderEducation()}
            {renderSkills()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {renderCertifications()}
            {renderAchievements()}
          </div>
          {renderCustomSections()}
        </>
      )}
    </div>
  );
};
