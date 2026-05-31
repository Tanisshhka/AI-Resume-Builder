import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Experience {
  _id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  keyAchievements: string[];
}

export interface Skill {
  _id?: string;
  name: string;
  level: number;
  category: string;
}

export interface Project {
  _id?: string;
  name: string;
  description: string;
  url: string;
  githubUrl: string;
  technologies: string[];
  role: string;
}

export interface Certification {
  _id?: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Achievement {
  _id?: string;
  title: string;
  description: string;
  date: string;
}

export interface CustomItem {
  _id?: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

export interface CustomSection {
  _id?: string;
  sectionTitle: string;
  items: CustomItem[];
}

export interface ResumeVersion {
  versionId: string;
  timestamp: string;
  comment: string;
  data: any;
}

export interface ResumeData {
  _id?: string;
  title: string;
  templateId: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    website: string;
    linkedin: string;
    github: string;
    photo: string;
  };
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  customSections: CustomSection[];
  resumeScore: number;
  atsScore: number;
  aiSuggestions: string[];
  isPublic: boolean;
  shareSlug?: string;
  versions?: ResumeVersion[];
  updatedAt?: string;
}

interface ResumeState {
  myResumes: ResumeData[];
  currentResume: ResumeData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialResumeState: ResumeData = {
  title: 'My AI Resume',
  templateId: 'ats-modern',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    website: '',
    linkedin: '',
    github: '',
    photo: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  customSections: [],
  resumeScore: 0,
  atsScore: 0,
  aiSuggestions: [],
  isPublic: false,
};

const initialState: ResumeState = {
  myResumes: [],
  currentResume: null,
  loading: false,
  saving: false,
  error: null,
};

export const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setMyResumes: (state, action: PayloadAction<ResumeData[]>) => {
      state.myResumes = action.payload;
    },
    setCurrentResume: (state, action: PayloadAction<ResumeData | null>) => {
      state.currentResume = action.payload;
    },
    resetCurrentResume: (state) => {
      state.currentResume = { ...initialResumeState };
    },
    updateResumeTitle: (state, action: PayloadAction<string>) => {
      if (state.currentResume) {
        state.currentResume.title = action.payload;
      }
    },
    updateTemplateId: (state, action: PayloadAction<string>) => {
      if (state.currentResume) {
        state.currentResume.templateId = action.payload;
      }
    },
    updatePersonalInfo: (state, action: PayloadAction<Partial<ResumeData['personalInfo']>>) => {
      if (state.currentResume) {
        state.currentResume.personalInfo = {
          ...state.currentResume.personalInfo,
          ...action.payload,
        };
      }
    },
    // Education reducers
    addEducation: (state, action: PayloadAction<Education>) => {
      if (state.currentResume) {
        state.currentResume.education.push(action.payload);
      }
    },
    updateEducation: (state, action: PayloadAction<{ index: number; data: Education }>) => {
      if (state.currentResume && state.currentResume.education[action.payload.index]) {
        state.currentResume.education[action.payload.index] = action.payload.data;
      }
    },
    removeEducation: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.education.splice(action.payload, 1);
      }
    },
    reorderEducation: (state, action: PayloadAction<Education[]>) => {
      if (state.currentResume) {
        state.currentResume.education = action.payload;
      }
    },
    // Experience reducers
    addExperience: (state, action: PayloadAction<Experience>) => {
      if (state.currentResume) {
        state.currentResume.experience.push(action.payload);
      }
    },
    updateExperience: (state, action: PayloadAction<{ index: number; data: Experience }>) => {
      if (state.currentResume && state.currentResume.experience[action.payload.index]) {
        state.currentResume.experience[action.payload.index] = action.payload.data;
      }
    },
    removeExperience: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.experience.splice(action.payload, 1);
      }
    },
    reorderExperience: (state, action: PayloadAction<Experience[]>) => {
      if (state.currentResume) {
        state.currentResume.experience = action.payload;
      }
    },
    // Skills reducers
    addSkill: (state, action: PayloadAction<Skill>) => {
      if (state.currentResume) {
        state.currentResume.skills.push(action.payload);
      }
    },
    updateSkill: (state, action: PayloadAction<{ index: number; data: Skill }>) => {
      if (state.currentResume && state.currentResume.skills[action.payload.index]) {
        state.currentResume.skills[action.payload.index] = action.payload.data;
      }
    },
    removeSkill: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.skills.splice(action.payload, 1);
      }
    },
    reorderSkills: (state, action: PayloadAction<Skill[]>) => {
      if (state.currentResume) {
        state.currentResume.skills = action.payload;
      }
    },
    // Projects reducers
    addProject: (state, action: PayloadAction<Project>) => {
      if (state.currentResume) {
        state.currentResume.projects.push(action.payload);
      }
    },
    updateProject: (state, action: PayloadAction<{ index: number; data: Project }>) => {
      if (state.currentResume && state.currentResume.projects[action.payload.index]) {
        state.currentResume.projects[action.payload.index] = action.payload.data;
      }
    },
    removeProject: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.projects.splice(action.payload, 1);
      }
    },
    reorderProjects: (state, action: PayloadAction<Project[]>) => {
      if (state.currentResume) {
        state.currentResume.projects = action.payload;
      }
    },
    // Certifications reducers
    addCertification: (state, action: PayloadAction<Certification>) => {
      if (state.currentResume) {
        state.currentResume.certifications.push(action.payload);
      }
    },
    updateCertification: (state, action: PayloadAction<{ index: number; data: Certification }>) => {
      if (state.currentResume && state.currentResume.certifications[action.payload.index]) {
        state.currentResume.certifications[action.payload.index] = action.payload.data;
      }
    },
    removeCertification: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.certifications.splice(action.payload, 1);
      }
    },
    // Achievements reducers
    addAchievement: (state, action: PayloadAction<Achievement>) => {
      if (state.currentResume) {
        state.currentResume.achievements.push(action.payload);
      }
    },
    updateAchievement: (state, action: PayloadAction<{ index: number; data: Achievement }>) => {
      if (state.currentResume && state.currentResume.achievements[action.payload.index]) {
        state.currentResume.achievements[action.payload.index] = action.payload.data;
      }
    },
    removeAchievement: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.achievements.splice(action.payload, 1);
      }
    },
    // Custom sections
    addCustomSection: (state, action: PayloadAction<CustomSection>) => {
      if (state.currentResume) {
        state.currentResume.customSections.push(action.payload);
      }
    },
    updateCustomSection: (state, action: PayloadAction<{ index: number; data: CustomSection }>) => {
      if (state.currentResume && state.currentResume.customSections[action.payload.index]) {
        state.currentResume.customSections[action.payload.index] = action.payload.data;
      }
    },
    removeCustomSection: (state, action: PayloadAction<number>) => {
      if (state.currentResume) {
        state.currentResume.customSections.splice(action.payload, 1);
      }
    },
    // Score updates
    updateResumeScores: (state, action: PayloadAction<{ resumeScore?: number; atsScore?: number; aiSuggestions?: string[] }>) => {
      if (state.currentResume) {
        if (action.payload.resumeScore !== undefined) state.currentResume.resumeScore = action.payload.resumeScore;
        if (action.payload.atsScore !== undefined) state.currentResume.atsScore = action.payload.atsScore;
        if (action.payload.aiSuggestions !== undefined) state.currentResume.aiSuggestions = action.payload.aiSuggestions;
      }
    },
    setResumeSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
    },
    setResumeLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setResumeError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
});

export const {
  setMyResumes,
  setCurrentResume,
  resetCurrentResume,
  updateResumeTitle,
  updateTemplateId,
  updatePersonalInfo,
  addEducation,
  updateEducation,
  removeEducation,
  reorderEducation,
  addExperience,
  updateExperience,
  removeExperience,
  reorderExperience,
  addSkill,
  updateSkill,
  removeSkill,
  reorderSkills,
  addProject,
  updateProject,
  removeProject,
  reorderProjects,
  addCertification,
  updateCertification,
  removeCertification,
  addAchievement,
  updateAchievement,
  removeAchievement,
  addCustomSection,
  updateCustomSection,
  removeCustomSection,
  updateResumeScores,
  setResumeSaving,
  setResumeLoading,
  setResumeError,
} = resumeSlice.actions;

export default resumeSlice.reducer;
