const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ DATABASE ============
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// ============ MODELS ============
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bio: { type: String, default: '' },
  socialLinks: { github: { type: String, default: '' }, linkedin: { type: String, default: '' }, twitter: { type: String, default: '' }, website: { type: String, default: '' } },
  aiTokensUsed: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const EducationSchema = new mongoose.Schema({ institution: { type: String, default: '' }, degree: { type: String, default: '' }, fieldOfStudy: { type: String, default: '' }, startDate: { type: String, default: '' }, endDate: { type: String, default: '' }, current: { type: Boolean, default: false }, description: { type: String, default: '' } });
const ExperienceSchema = new mongoose.Schema({ company: { type: String, default: '' }, position: { type: String, default: '' }, location: { type: String, default: '' }, startDate: { type: String, default: '' }, endDate: { type: String, default: '' }, current: { type: Boolean, default: false }, description: { type: String, default: '' }, keyAchievements: [{ type: String }] });
const SkillSchema = new mongoose.Schema({ name: { type: String, required: true }, level: { type: Number, default: 3, min: 1, max: 5 }, category: { type: String, default: '' } });
const ProjectSchema = new mongoose.Schema({ name: { type: String, default: '' }, description: { type: String, default: '' }, url: { type: String, default: '' }, githubUrl: { type: String, default: '' }, technologies: [{ type: String }], role: { type: String, default: '' } });
const CertificationSchema = new mongoose.Schema({ name: { type: String, default: '' }, issuer: { type: String, default: '' }, date: { type: String, default: '' }, url: { type: String, default: '' } });
const AchievementSchema = new mongoose.Schema({ title: { type: String, default: '' }, description: { type: String, default: '' }, date: { type: String, default: '' } });
const CustomItemSchema = new mongoose.Schema({ title: { type: String, default: '' }, subtitle: { type: String, default: '' }, date: { type: String, default: '' }, description: { type: String, default: '' } });
const CustomSectionSchema = new mongoose.Schema({ sectionTitle: { type: String, required: true }, items: [CustomItemSchema] });
const ResumeVersionSchema = new mongoose.Schema({ versionId: { type: String, required: true }, timestamp: { type: Date, default: Date.now }, comment: { type: String, default: 'Auto-saved version' }, data: { type: Object, required: true } });

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Untitled Resume' },
  templateId: { type: String, default: 'ats-modern' },
  personalInfo: { fullName: { type: String, default: '' }, email: { type: String, default: '' }, phone: { type: String, default: '' }, location: { type: String, default: '' }, title: { type: String, default: '' }, website: { type: String, default: '' }, linkedin: { type: String, default: '' }, github: { type: String, default: '' }, photo: { type: String, default: '' } },
  education: [EducationSchema], experience: [ExperienceSchema], skills: [SkillSchema], projects: [ProjectSchema], certifications: [CertificationSchema], achievements: [AchievementSchema], customSections: [CustomSectionSchema],
  resumeScore: { type: Number, default: 0 }, atsScore: { type: Number, default: 0 }, aiSuggestions: [{ type: String }],
  isPublic: { type: Boolean, default: false }, shareSlug: { type: String, unique: true, sparse: true },
  versions: [ResumeVersionSchema]
}, { timestamps: true });

const JobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, trim: true },
  jobTitle: { type: String, required: true, trim: true },
  status: { type: String, enum: ['bookmarked', 'applied', 'interviewing', 'offered', 'rejected'], default: 'bookmarked' },
  url: { type: String, default: '' }, notes: { type: String, default: '' }, appliedDate: { type: Date, default: null },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null }, salary: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

// ============ MIDDLEWARE ============
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret', { expiresIn: '30d' });

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'Not authorized' });
      next();
    } catch (error) { res.status(401).json({ message: 'Token failed' }); }
  }
  if (!token) res.status(401).json({ message: 'No token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ message: 'Not admin' });
};

// ============ AI MOCK DATA ============
const getMockAI = (sys, isJson) => {
  if (isJson) {
    if (sys.includes('analyze-score')) return { score: 78, formattingScore: 82, contentScore: 75, strengths: ['Solid technical skills', 'Good summary statement', 'Well-structured education'], improvements: ['Add quantitative metrics', 'More project detail', 'Include GitHub links'], suggestions: ['Add metrics like "increased efficiency by 20%"', 'Add certification URLs', 'Improve heading hierarchy'] };
    if (sys.includes('ats-check')) return { matchPercentage: 72, matchingKeywords: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'SQL'], missingKeywords: ['Redux Toolkit', 'System Design', 'Agile Scrum', 'CI/CD'], atsFormattingAlerts: ['Verify standard text flow', 'Avoid embedded text in graphics'], optimizationSuggestions: 'Add "Redux Toolkit", "Agile", and "Unit Testing" keywords.' };
    if (sys.includes('recommend-skills')) return { recommendedSkills: ['GraphQL', 'Docker', 'Kubernetes', 'Jest', 'AWS', 'Next.js'].sort(() => 0.5 - Math.random()).slice(0, 6) };
    if (sys.includes('linkedin-headlines')) return { headlines: ['Senior Software Engineer | React & Node.js Specialist', 'TypeScript & Frontend Architect | UX/UI Passionate', 'Full Stack Developer | React • Node • Cloud', 'Software Engineer | Performance & Scale Expert', 'Full Stack Engineer | Building Scalable Web Apps'] };
    if (sys.includes('interview-prep')) return { technical: [{ question: 'How do you optimize React state management?', expectedPoints: ['Context performance', 'Redux memoization', 'State libraries comparison'] }, { question: 'Explain the Node.js event loop.', expectedPoints: ['Call stack', 'Microtasks', 'Non-blocking I/O'] }], behavioral: [{ question: 'Describe a team disagreement resolution.', expectedPoints: ['Active listening', 'Facts evaluation', 'Compromise'] }] };
    if (sys.includes('generate-from-profiles')) return { personalInfo: { fullName: 'Alex Rivera', title: 'Senior Full Stack Engineer', email: 'alex@email.com', phone: '+1 (415) 555-0192', location: 'San Francisco, CA', website: 'https://alexrivera.dev', linkedin: 'https://linkedin.com/in/alexrivera', github: 'https://github.com/alexrivera', photo: '' }, summary: 'Results-driven Full Stack Engineer with 5+ years building scalable web apps using React, TypeScript, and Node.js.', education: [{ institution: 'UC Berkeley', degree: 'B.S.', fieldOfStudy: 'Computer Science', startDate: '2016', endDate: '2020', current: false, description: 'Dean\'s List' }], experience: [{ company: 'Stripe', position: 'Senior Software Engineer', location: 'SF, CA', startDate: 'Jan 2023', endDate: 'Present', current: true, description: 'Lead frontend architecture.', keyAchievements: ['Reduced load time by 42%', 'Built real-time analytics for 10K events/sec'] }, { company: 'Airbnb', position: 'Software Engineer', location: 'SF, CA', startDate: 'Jun 2021', endDate: 'Dec 2022', current: false, description: 'Core booking flow features.', keyAchievements: ['Increased conversion by 18%', 'Migrated jQuery to React'] }], skills: [{ name: 'React', level: 5, category: 'Frontend' }, { name: 'TypeScript', level: 5, category: 'Languages' }, { name: 'Node.js', level: 4, category: 'Backend' }, { name: 'Python', level: 4, category: 'Languages' }, { name: 'PostgreSQL', level: 4, category: 'Databases' }, { name: 'AWS', level: 4, category: 'Cloud' }, { name: 'Docker', level: 3, category: 'DevOps' }, { name: 'GraphQL', level: 4, category: 'APIs' }], projects: [{ name: 'DevFlow', description: 'Developer productivity tool with 2.3K GitHub stars.', url: 'https://devflow.app', githubUrl: 'https://github.com/alex/devflow', technologies: ['React', 'TypeScript', 'Socket.io'], role: 'Creator' }, { name: 'CloudDeploy', description: 'One-click deployment platform.', url: '', githubUrl: 'https://github.com/alex/clouddeploy', technologies: ['Next.js', 'AWS Lambda'], role: 'Full Stack Dev' }], certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023', url: '' }], achievements: [{ title: 'ReactConf 2023 Speaker', description: 'Presented "Scaling React at Stripe"', date: '2023' }] };
    return {};
  }
  if (sys.includes('professional summary')) return 'Results-driven Professional with expertise in building scalable web solutions using modern JavaScript frameworks. Proven track record of architecting high-performance applications and mentoring teams.';
  if (sys.includes('career objective')) return 'Seeking a challenging role to utilize advanced engineering skills and contribute to software innovation while growing in full-stack ecosystems.';
  if (sys.includes('cover letter')) return 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the position. With extensive experience in React, TypeScript, and Node.js, I am confident in my ability to make an immediate impact.\n\nThroughout my career, I have optimized performance, increased application speed, and collaborated with cross-functional teams to deliver premium user experiences.\n\nI look forward to discussing how my skills align with your goals.\n\nSincerely,\n[Your Name]';
  if (sys.includes('improve-content') || sys.includes('editor')) return 'Spearheaded development of scalable web features, improving response times by 32% and enhancing user engagement with mobile-responsive layouts.';
  return 'Successfully implemented full-stack solutions.';
};

// ============ ROUTES ============

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'ResumeAI Pro is running' }));

// AUTH
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const isFirst = (await User.countDocuments({})) === 0;
    const user = await User.create({ name, email, password, role: isFirst ? 'admin' : 'user' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, socialLinks: user.socialLinks, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, socialLinks: user.socialLinks, token: generateToken(user._id) });
    } else { res.status(401).json({ message: 'Invalid email or password' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/auth/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, socialLinks: user.socialLinks, aiTokensUsed: user.aiTokensUsed });
    else res.status(404).json({ message: 'Not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/auth/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, bio: updated.bio, socialLinks: updated.socialLinks, token: generateToken(updated._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// RESUMES
const genSlug = (n) => { const c = n.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'); return `${c}-${Math.random().toString(36).substring(2, 7)}`; };

app.post('/api/resumes', protect, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.create({ userId: req.user._id, title: req.body.title || 'My AI Resume', templateId: req.body.templateId || 'ats-modern', personalInfo: { fullName: req.user.name, email: req.user.email, phone: '', location: '', title: '', website: '', linkedin: req.user.socialLinks?.linkedin || '', github: req.user.socialLinks?.github || '', photo: '' } });
    res.status(201).json(resume);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/resumes', protect, async (req, res) => {
  try {
    await connectDB();
    const resumes = await Resume.find({ userId: req.user._id }).select('title templateId resumeScore atsScore updatedAt isPublic shareSlug').sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/resumes/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (resume.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    res.json(resume);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.put('/api/resumes/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (resume.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const fields = ['title', 'templateId', 'personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements', 'customSections', 'resumeScore', 'atsScore', 'aiSuggestions'];
    fields.forEach(f => { if (req.body[f] !== undefined) resume[f] = req.body[f]; });
    if (req.body.saveAsVersion) {
      resume.versions.push({ versionId: Math.random().toString(36).substring(2, 9), comment: req.body.versionComment || 'Manual save', timestamp: new Date(), data: { title: resume.title, templateId: resume.templateId, personalInfo: resume.personalInfo, education: resume.education, experience: resume.experience, skills: resume.skills, projects: resume.projects, certifications: resume.certifications, achievements: resume.achievements, customSections: resume.customSections } });
      if (resume.versions.length > 15) resume.versions.shift();
    }
    const updated = await resume.save();
    res.json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.delete('/api/resumes/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (resume.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await resume.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/resumes/:id/share', protect, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (resume.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    resume.isPublic = req.body.isPublic;
    if (resume.isPublic && !resume.shareSlug) resume.shareSlug = genSlug(resume.personalInfo?.fullName || req.user.name);
    const updated = await resume.save();
    res.json({ isPublic: updated.isPublic, shareSlug: updated.shareSlug, url: `/share/${updated.shareSlug}` });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/resumes/share/:slug', async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findOne({ shareSlug: req.params.slug, isPublic: true }).populate('userId', 'name email bio socialLinks');
    if (!resume) return res.status(404).json({ message: 'Not found' });
    res.json(resume);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/resumes/:id/versions/:versionId/restore', protect, async (req, res) => {
  try {
    await connectDB();
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Not found' });
    if (resume.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const version = resume.versions.find(v => v.versionId === req.params.versionId);
    if (!version) return res.status(404).json({ message: 'Version not found' });
    const s = version.data;
    resume.versions.push({ versionId: Math.random().toString(36).substring(2, 9), comment: 'Before restore', timestamp: new Date(), data: { title: resume.title, templateId: resume.templateId, personalInfo: resume.personalInfo, education: resume.education, experience: resume.experience, skills: resume.skills, projects: resume.projects, certifications: resume.certifications, achievements: resume.achievements, customSections: resume.customSections } });
    ['title', 'templateId', 'personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements', 'customSections'].forEach(f => { if (s[f]) resume[f] = s[f]; });
    const updated = await resume.save();
    res.json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// AI
const trackUsage = async (userId) => { if (userId) await User.findByIdAndUpdate(userId, { $inc: { aiTokensUsed: 1 } }).catch(() => {}); };

app.post('/api/ai/analyze-score', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('analyze-score', true); await trackUsage(req.user?._id); res.json(data); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/ats-check', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('ats-check', true); await trackUsage(req.user?._id); res.json(data); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/recommend-skills', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('recommend-skills', true); await trackUsage(req.user?._id); res.json(data); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/linkedin-headlines', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('linkedin-headlines', true); await trackUsage(req.user?._id); res.json(data); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/interview-prep', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('interview-prep', true); await trackUsage(req.user?._id); res.json(data); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/generate-from-profiles', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('generate-from-profiles', true); await trackUsage(req.user?._id); res.json(data); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/summary', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('professional summary', false); await trackUsage(req.user?._id); res.json({ summary: data }); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/objective', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('career objective', false); await trackUsage(req.user?._id); res.json({ objective: data }); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/improve-content', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('editor', false); await trackUsage(req.user?._id); res.json({ improvedText: data }); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/ai/cover-letter', protect, async (req, res) => {
  try { await connectDB(); const data = getMockAI('cover letter', false); await trackUsage(req.user?._id); res.json({ coverLetter: data }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// JOBS
app.get('/api/jobs', protect, async (req, res) => {
  try { await connectDB(); const jobs = await Job.find({ userId: req.user._id }).populate('resumeId', 'title').sort({ createdAt: -1 }); res.json(jobs); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/jobs', protect, async (req, res) => {
  try { await connectDB(); const job = await Job.create({ userId: req.user._id, ...req.body }); res.status(201).json(job); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/jobs/:id', protect, async (req, res) => {
  try { await connectDB(); const job = await Job.findById(req.params.id); if (!job) return res.status(404).json({ message: 'Not found' }); if (job.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' }); Object.assign(job, req.body); const updated = await job.save(); res.json(updated); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/jobs/:id', protect, async (req, res) => {
  try { await connectDB(); const job = await Job.findById(req.params.id); if (!job) return res.status(404).json({ message: 'Not found' }); if (job.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' }); await job.deleteOne(); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// ADMIN
app.get('/api/admin/metrics', protect, admin, async (req, res) => {
  try { await connectDB(); const users = await User.countDocuments({}); const resumes = await Resume.countDocuments({}); const jobs = await Job.countDocuments({}); const tokenResult = await User.aggregate([{ $group: { _id: null, total: { $sum: '$aiTokensUsed' } } }]); res.json({ counts: { users, resumes, jobs, aiRequests: tokenResult[0]?.total || 0 }, recentResumes: await Resume.find({}).select('title templateId resumeScore createdAt').populate('userId', 'name email').sort({ createdAt: -1 }).limit(5), recentUsers: await User.find({}).select('name email role aiTokensUsed createdAt').sort({ createdAt: -1 }).limit(10) }); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.get('/api/admin/users', protect, admin, async (req, res) => {
  try { await connectDB(); const users = await User.find({}).select('-password').sort({ createdAt: -1 }); res.json(users); } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/admin/users/:id', protect, admin, async (req, res) => {
  try { await connectDB(); const user = await User.findById(req.params.id); if (!user) return res.status(404).json({ message: 'Not found' }); await Resume.deleteMany({ userId: user._id }); await Job.deleteMany({ userId: user._id }); await user.deleteOne(); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ message: e.message }); }
});

// CATCH-ALL for SPA
app.get('*', (req, res) => { res.status(404).json({ message: 'Not found' }); });

module.exports = app;
