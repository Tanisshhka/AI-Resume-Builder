const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// TRUST PROXY for Vercel
app.set('trust proxy', 1);

// CORS - allow everything
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============ MONGODB (cached for serverless warm starts) ============
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ============ SCHEMAS ============
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bio: { type: String, default: '' },
  socialLinks: { github: String, linkedin: String, twitter: String, website: String },
  aiTokensUsed: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function(pw) {
  return bcrypt.compare(pw, this.password);
};

const EducationSchema = new mongoose.Schema({ institution: String, degree: String, fieldOfStudy: String, startDate: String, endDate: String, current: Boolean, description: String });
const ExperienceSchema = new mongoose.Schema({ company: String, position: String, location: String, startDate: String, endDate: String, current: Boolean, description: String, keyAchievements: [String] });
const SkillSchema = new mongoose.Schema({ name: String, level: Number, category: String });
const ProjectSchema = new mongoose.Schema({ name: String, description: String, url: String, githubUrl: String, technologies: [String], role: String });
const CertSchema = new mongoose.Schema({ name: String, issuer: String, date: String, url: String });
const AchSchema = new mongoose.Schema({ title: String, description: String, date: String });
const CustomItemSchema = new mongoose.Schema({ title: String, subtitle: String, date: String, description: String });
const CustomSectionSchema = new mongoose.Schema({ sectionTitle: String, items: [CustomItemSchema] });
const VersionSchema = new mongoose.Schema({ versionId: String, timestamp: Date, comment: String, data: mongoose.Schema.Types.Mixed });

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Resume' },
  templateId: { type: String, default: 'ats-modern' },
  personalInfo: { fullName: String, email: String, phone: String, location: String, title: String, website: String, linkedin: String, github: String, photo: String },
  education: [EducationSchema], experience: [ExperienceSchema], skills: [SkillSchema], projects: [ProjectSchema],
  certifications: [CertSchema], achievements: [AchSchema], customSections: [CustomSectionSchema],
  resumeScore: { type: Number, default: 0 }, atsScore: { type: Number, default: 0 },
  aiSuggestions: [String], isPublic: { type: Boolean, default: false },
  shareSlug: { type: String, sparse: true }, versions: [VersionSchema]
}, { timestamps: true });

const JobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: String, jobTitle: String,
  status: { type: String, enum: ['bookmarked', 'applied', 'interviewing', 'offered', 'rejected'], default: 'bookmarked' },
  url: String, notes: String, appliedDate: Date, salary: String
}, { timestamps: true });

let User, Resume, Job;
try { User = mongoose.model('User'); } catch { User = mongoose.model('User', UserSchema); }
try { Resume = mongoose.model('Resume'); } catch { Resume = mongoose.model('Resume', ResumeSchema); }
try { Job = mongoose.model('Job'); } catch { Job = mongoose.model('Job', JobSchema); }

// ============ HELPERS ============
const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
const genSlug = (n) => `${(n || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}-${Math.random().toString(36).substring(2, 7)}`;

const protect = async (req, res, next) => {
  try {
    if (!req.headers.authorization?.startsWith('Bearer')) return res.status(401).json({ message: 'No token' });
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin only' });
};

const trackUsage = async (userId) => { try { await User.findByIdAndUpdate(userId, { $inc: { aiTokensUsed: 1 } }); } catch {} };

// ============ MOCK AI ============
const mockAI = (key) => {
  const data = {
    'score': { score: 78, formattingScore: 82, contentScore: 75, strengths: ['Solid technical skills', 'Good summary', 'Structured education'], improvements: ['Add metrics in experience', 'More project detail', 'Include GitHub links'], suggestions: ['Add "increased efficiency by 20%" style metrics', 'Add certification URLs', 'Improve heading hierarchy'] },
    'ats': { matchPercentage: 72, matchingKeywords: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'SQL'], missingKeywords: ['Redux Toolkit', 'System Design', 'Agile', 'CI/CD'], atsFormattingAlerts: ['Verify standard text flow', 'Avoid embedded graphics'], optimizationSuggestions: 'Add keywords: Redux Toolkit, Agile, Unit Testing to experience bullets.' },
    'skills': { recommendedSkills: ['GraphQL', 'Docker', 'Kubernetes', 'Jest', 'AWS', 'Next.js'] },
    'headlines': { headlines: ['Senior SWE | React & Node.js Specialist', 'TypeScript & Frontend Architect', 'Full Stack Developer | React • Node • Cloud', 'Software Engineer | Performance Expert', 'Full Stack Engineer | Scalable Web Apps'] },
    'interview': { technical: [{ question: 'How do you optimize React state management?', expectedPoints: ['Context performance', 'Redux memoization', 'State libraries'] }, { question: 'Explain the Node.js event loop.', expectedPoints: ['Call stack', 'Microtasks', 'Non-blocking I/O'] }], behavioral: [{ question: 'Describe a team disagreement resolution.', expectedPoints: ['Active listening', 'Facts evaluation', 'Compromise'] }] },
    'profiles': { personalInfo: { fullName: 'Alex Rivera', title: 'Senior Full Stack Engineer', email: 'alex@email.com', phone: '+1 (415) 555-0192', location: 'San Francisco, CA', website: 'https://alexrivera.dev', linkedin: '', github: '', photo: '' }, summary: 'Results-driven Full Stack Engineer with 5+ years building scalable web apps using React, TypeScript, and Node.js.', education: [{ institution: 'UC Berkeley', degree: 'B.S.', fieldOfStudy: 'Computer Science', startDate: '2016', endDate: '2020', current: false, description: 'Dean\'s List' }], experience: [{ company: 'Stripe', position: 'Senior Software Engineer', location: 'SF, CA', startDate: 'Jan 2023', endDate: 'Present', current: true, description: 'Lead frontend architecture.', keyAchievements: ['Reduced load time by 42%', 'Built analytics for 10K events/sec'] }, { company: 'Airbnb', position: 'Software Engineer', location: 'SF, CA', startDate: 'Jun 2021', endDate: 'Dec 2022', current: false, description: 'Core booking flow.', keyAchievements: ['Increased conversion by 18%', 'Migrated jQuery to React'] }], skills: [{ name: 'React', level: 5, category: 'Frontend' }, { name: 'TypeScript', level: 5, category: 'Languages' }, { name: 'Node.js', level: 4, category: 'Backend' }, { name: 'Python', level: 4, category: 'Languages' }, { name: 'PostgreSQL', level: 4, category: 'Databases' }, { name: 'AWS', level: 4, category: 'Cloud' }], projects: [{ name: 'DevFlow', description: 'Developer tool with 2.3K stars.', url: '', githubUrl: '', technologies: ['React', 'TypeScript'], role: 'Creator' }], certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023', url: '' }], achievements: [{ title: 'ReactConf 2023 Speaker', description: 'Presented scaling talk', date: '2023' }] }
  };
  return data[key] || {};
};

// ============ ROUTES ============

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// AUTH
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const isFirst = (await User.countDocuments({})) === 0;
    const user = await User.create({ name, email, password, role: isFirst ? 'admin' : 'user' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, socialLinks: user.socialLinks, token: genToken(user._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, socialLinks: user.socialLinks, token: genToken(user._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/auth/profile', protect, async (req, res) => {
  try { await connectDB(); const u = await User.findById(req.user._id); res.json({ _id: u._id, name: u.name, email: u.email, role: u.role, bio: u.bio, socialLinks: u.socialLinks, aiTokensUsed: u.aiTokensUsed }); } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/auth/profile', protect, async (req, res) => {
  try {
    await connectDB();
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    if (req.body.name) u.name = req.body.name;
    if (req.body.email) u.email = req.body.email;
    if (req.body.password) u.password = req.body.password;
    const up = await u.save();
    res.json({ _id: up._id, name: up.name, email: up.email, role: up.role, token: genToken(up._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// RESUMES
app.post('/api/resumes', protect, async (req, res) => {
  try {
    await connectDB();
    const r = await Resume.create({ userId: req.user._id, title: req.body.title || 'My AI Resume', templateId: req.body.templateId || 'ats-modern', personalInfo: { fullName: req.user.name, email: req.user.email, phone: '', location: '', title: '', website: '', linkedin: req.user.socialLinks?.linkedin || '', github: req.user.socialLinks?.github || '', photo: '' } });
    res.status(201).json(r);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/resumes', protect, async (req, res) => {
  try { await connectDB(); const r = await Resume.find({ userId: req.user._id }).select('title templateId resumeScore atsScore updatedAt isPublic shareSlug').sort({ updatedAt: -1 }); res.json(r); } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/resumes/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const r = await Resume.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    res.json(r);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/resumes/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const r = await Resume.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    ['title', 'templateId', 'personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements', 'customSections', 'resumeScore', 'atsScore', 'aiSuggestions'].forEach(f => { if (req.body[f] !== undefined) r[f] = req.body[f]; });
    if (req.body.saveAsVersion) { r.versions.push({ versionId: Math.random().toString(36).substring(2, 9), comment: req.body.versionComment || 'Save', timestamp: new Date(), data: { title: r.title, templateId: r.templateId, personalInfo: r.personalInfo, education: r.education, experience: r.experience, skills: r.skills, projects: r.projects, certifications: r.certifications, achievements: r.achievements, customSections: r.customSections } }); if (r.versions.length > 15) r.versions.shift(); }
    const up = await r.save();
    res.json(up);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/resumes/:id', protect, async (req, res) => {
  try {
    await connectDB();
    const r = await Resume.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await r.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/resumes/:id/share', protect, async (req, res) => {
  try {
    await connectDB();
    const r = await Resume.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    r.isPublic = req.body.isPublic;
    if (r.isPublic && !r.shareSlug) r.shareSlug = genSlug(r.personalInfo?.fullName);
    const up = await r.save();
    res.json({ isPublic: up.isPublic, shareSlug: up.shareSlug });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/resumes/share/:slug', async (req, res) => {
  try { await connectDB(); const r = await Resume.findOne({ shareSlug: req.params.slug, isPublic: true }); if (!r) return res.status(404).json({ message: 'Not found' }); res.json(r); } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/resumes/:id/versions/:vid/restore', protect, async (req, res) => {
  try {
    await connectDB();
    const r = await Resume.findById(req.params.id);
    if (!r || r.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const v = r.versions.find(x => x.versionId === req.params.vid);
    if (!v) return res.status(404).json({ message: 'Version not found' });
    r.versions.push({ versionId: Math.random().toString(36).substring(2, 9), comment: 'Before restore', timestamp: new Date(), data: { title: r.title, templateId: r.templateId, personalInfo: r.personalInfo, education: r.education, experience: r.experience, skills: r.skills, projects: r.projects, certifications: r.certifications, achievements: r.achievements, customSections: r.customSections } });
    ['title', 'templateId', 'personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements', 'customSections'].forEach(f => { if (v.data[f]) r[f] = v.data[f]; });
    const up = await r.save();
    res.json(up);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// AI
app.post('/api/ai/analyze-score', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json(mockAI('score')); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/ats-check', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json(mockAI('ats')); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/recommend-skills', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json(mockAI('skills')); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/linkedin-headlines', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json(mockAI('headlines')); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/interview-prep', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json(mockAI('interview')); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/generate-from-profiles', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json(mockAI('profiles')); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/summary', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json({ summary: 'Results-driven Professional with expertise in building scalable web solutions using modern JavaScript frameworks. Proven track record of architecting high-performance applications.' }); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/objective', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json({ objective: 'Seeking a challenging role to utilize advanced engineering skills and contribute to software innovation.' }); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/improve-content', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json({ improvedText: 'Spearheaded development of scalable web features, improving response times by 32% and enhancing user engagement.' }); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/ai/cover-letter', protect, async (req, res) => { try { await connectDB(); await trackUsage(req.user?._id); res.json({ coverLetter: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the position. With extensive experience in React, TypeScript, and Node.js, I am confident in my ability to make an immediate impact on your team.\n\nThroughout my career, I have optimized performance and collaborated with cross-functional teams to deliver premium user experiences.\n\nI look forward to discussing how my skills align with your goals.\n\nSincerely,\n[Your Name]' }); } catch (e) { res.status(500).json({ message: e.message }); } });

// JOBS
app.get('/api/jobs', protect, async (req, res) => { try { await connectDB(); const j = await Job.find({ userId: req.user._id }).sort({ createdAt: -1 }); res.json(j); } catch (e) { res.status(500).json({ message: e.message }); } });
app.post('/api/jobs', protect, async (req, res) => { try { await connectDB(); const j = await Job.create({ userId: req.user._id, ...req.body }); res.status(201).json(j); } catch (e) { res.status(500).json({ message: e.message }); } });
app.put('/api/jobs/:id', protect, async (req, res) => { try { await connectDB(); const j = await Job.findById(req.params.id); if (!j || j.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' }); Object.assign(j, req.body); const up = await j.save(); res.json(up); } catch (e) { res.status(500).json({ message: e.message }); } });
app.delete('/api/jobs/:id', protect, async (req, res) => { try { await connectDB(); const j = await Job.findById(req.params.id); if (!j || j.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' }); await j.deleteOne(); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ message: e.message }); } });

// ADMIN
app.get('/api/admin/metrics', protect, admin, async (req, res) => { try { await connectDB(); const u = await User.countDocuments({}); const r = await Resume.countDocuments({}); const j = await Job.countDocuments({}); res.json({ counts: { users: u, resumes: r, jobs: j, aiRequests: 0 }, recentResumes: [], recentUsers: [] }); } catch (e) { res.status(500).json({ message: e.message }); } });
app.get('/api/admin/users', protect, admin, async (req, res) => { try { await connectDB(); const u = await User.find({}).select('-password').sort({ createdAt: -1 }); res.json(u); } catch (e) { res.status(500).json({ message: e.message }); } });
app.delete('/api/admin/users/:id', protect, admin, async (req, res) => { try { await connectDB(); await User.findByIdAndDelete(req.params.id); await Resume.deleteMany({ userId: req.params.id }); await Job.deleteMany({ userId: req.params.id }); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ message: e.message }); } });

module.exports = app;
