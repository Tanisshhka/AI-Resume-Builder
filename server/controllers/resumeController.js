import Resume from '../models/Resume.js';

// Helper to generate a URL slug
const generateSlug = (name) => {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${cleanName}-${randomStr}`;
};

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req, res) => {
  try {
    const { title, templateId } = req.body;

    const resume = await Resume.create({
      userId: req.user._id,
      title: title || 'My AI Resume',
      templateId: templateId || 'ats-modern',
      personalInfo: {
        fullName: req.user.name,
        email: req.user.email,
        phone: '',
        location: '',
        title: '',
        website: '',
        linkedin: req.user.socialLinks?.linkedin || '',
        github: req.user.socialLinks?.github || '',
        photo: ''
      },
      education: [],
      experience: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: [],
      customSections: []
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resumes of logged in user
// @route   GET /api/resumes
// @access  Private
export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('title templateId resumeScore atsScore updatedAt isPublic shareSlug')
      .sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check ownership
    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this resume' });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a resume (Auto-save)
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this resume' });
    }

    const {
      title,
      templateId,
      personalInfo,
      education,
      experience,
      skills,
      projects,
      certifications,
      achievements,
      customSections,
      resumeScore,
      atsScore,
      aiSuggestions,
      saveAsVersion,
      versionComment
    } = req.body;

    // Optional: save version history snapshot before modifying
    if (saveAsVersion) {
      const versionId = Math.random().toString(36).substring(2, 9);
      resume.versions.push({
        versionId,
        comment: versionComment || 'Manual save',
        timestamp: new Date(),
        data: {
          title: resume.title,
          templateId: resume.templateId,
          personalInfo: resume.personalInfo,
          education: resume.education,
          experience: resume.experience,
          skills: resume.skills,
          projects: resume.projects,
          certifications: resume.certifications,
          achievements: resume.achievements,
          customSections: resume.customSections,
          resumeScore: resume.resumeScore,
          atsScore: resume.atsScore
        }
      });

      // Keep only last 15 versions to save space
      if (resume.versions.length > 15) {
        resume.versions.shift();
      }
    }

    // Apply updates
    if (title !== undefined) resume.title = title;
    if (templateId !== undefined) resume.templateId = templateId;
    if (personalInfo !== undefined) resume.personalInfo = personalInfo;
    if (education !== undefined) resume.education = education;
    if (experience !== undefined) resume.experience = experience;
    if (skills !== undefined) resume.skills = skills;
    if (projects !== undefined) resume.projects = projects;
    if (certifications !== undefined) resume.certifications = certifications;
    if (achievements !== undefined) resume.achievements = achievements;
    if (customSections !== undefined) resume.customSections = customSections;
    if (resumeScore !== undefined) resume.resumeScore = resumeScore;
    if (atsScore !== undefined) resume.atsScore = atsScore;
    if (aiSuggestions !== undefined) resume.aiSuggestions = aiSuggestions;

    const updatedResume = await resume.save();
    res.json(updatedResume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this resume' });
    }

    await resume.deleteOne();
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle resume visibility (Public Link sharing)
// @route   POST /api/resumes/:id/share
// @access  Private
export const toggleResumePublic = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    resume.isPublic = req.body.isPublic;

    if (resume.isPublic && !resume.shareSlug) {
      const name = resume.personalInfo?.fullName || req.user.name;
      resume.shareSlug = generateSlug(name);
    } else if (!resume.isPublic) {
      // Keep or discard the slug
    }

    const updatedResume = await resume.save();
    res.json({
      isPublic: updatedResume.isPublic,
      shareSlug: updatedResume.shareSlug,
      url: `/share/${updatedResume.shareSlug}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public resume by slug
// @route   GET /api/resumes/share/:slug
// @access  Public
export const getResumeBySlug = async (req, res) => {
  try {
    const resume = await Resume.findOne({ shareSlug: req.params.slug, isPublic: true })
      .populate('userId', 'name email bio socialLinks');

    if (!resume) {
      return res.status(404).json({ message: 'Public resume not found' });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore a version snapshot
// @route   POST /api/resumes/:id/versions/:versionId/restore
// @access  Private
export const restoreResumeVersion = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const version = resume.versions.find(v => v.versionId === req.params.versionId);

    if (!version) {
      return res.status(404).json({ message: 'Version snapshot not found' });
    }

    // Apply snapshot back
    const snapshot = version.data;
    resume.title = snapshot.title || resume.title;
    resume.templateId = snapshot.templateId || resume.templateId;
    resume.personalInfo = snapshot.personalInfo || resume.personalInfo;
    resume.education = snapshot.education || resume.education;
    resume.experience = snapshot.experience || resume.experience;
    resume.skills = snapshot.skills || resume.skills;
    resume.projects = snapshot.projects || resume.projects;
    resume.certifications = snapshot.certifications || resume.certifications;
    resume.achievements = snapshot.achievements || resume.achievements;
    resume.customSections = snapshot.customSections || resume.customSections;
    resume.resumeScore = snapshot.resumeScore || resume.resumeScore;
    resume.atsScore = snapshot.atsScore || resume.atsScore;

    // Save as a new version automatically before restoring so they don't lose the current state
    const autoVerId = Math.random().toString(36).substring(2, 9);
    resume.versions.push({
      versionId: autoVerId,
      comment: `State before restoring ${version.comment}`,
      timestamp: new Date(),
      data: {
        title: resume.title,
        templateId: resume.templateId,
        personalInfo: resume.personalInfo,
        education: resume.education,
        experience: resume.experience,
        skills: resume.skills,
        projects: resume.projects,
        certifications: resume.certifications,
        achievements: resume.achievements,
        customSections: resume.customSections,
        resumeScore: resume.resumeScore,
        atsScore: resume.atsScore
      }
    });

    const restoredResume = await resume.save();
    res.json(restoredResume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
