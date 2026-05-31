import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  institution: { type: String, default: '' },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' }
});

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  keyAchievements: [{ type: String }]
});

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, default: 3, min: 1, max: 5 }, // 1-5 rating
  category: { type: String, default: '' } // e.g., 'Frontend', 'Languages'
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  technologies: [{ type: String }],
  role: { type: String, default: '' }
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  issuer: { type: String, default: '' },
  date: { type: String, default: '' },
  url: { type: String, default: '' }
});

const AchievementSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  date: { type: String, default: '' }
});

const CustomItemSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  date: { type: String, default: '' },
  description: { type: String, default: '' }
});

const CustomSectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, required: true },
  items: [CustomItemSchema]
});

const ResumeVersionSchema = new mongoose.Schema({
  versionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  comment: { type: String, default: 'Auto-saved version' },
  data: { type: Object, required: true }
});

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Resume'
  },
  templateId: {
    type: String,
    default: 'ats-modern'
  },
  personalInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    title: { type: String, default: '' }, // e.g., 'Senior Frontend Engineer'
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    photo: { type: String, default: '' } // Base64 or image URL
  },
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [SkillSchema],
  projects: [ProjectSchema],
  certifications: [CertificationSchema],
  achievements: [AchievementSchema],
  customSections: [CustomSectionSchema],
  resumeScore: {
    type: Number,
    default: 0
  },
  atsScore: {
    type: Number,
    default: 0
  },
  aiSuggestions: [{ type: String }],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareSlug: {
    type: String,
    unique: true,
    sparse: true
  },
  versions: [ResumeVersionSchema]
}, {
  timestamps: true
});

const Resume = mongoose.model('Resume', ResumeSchema);
export default Resume;
