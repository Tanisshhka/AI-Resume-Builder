import Job from '../models/Job.js';

// @desc    Get all jobs for logged in user
// @route   GET /api/jobs
// @access  Private
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id })
      .populate('resumeId', 'title')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new job to track
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res) => {
  const { companyName, jobTitle, status, url, notes, appliedDate, resumeId, salary } = req.body;

  try {
    const job = await Job.create({
      userId: req.user._id,
      companyName,
      jobTitle,
      status: status || 'bookmarked',
      url,
      notes,
      appliedDate: status === 'applied' ? (appliedDate || new Date()) : appliedDate,
      resumeId: resumeId || null,
      salary
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a tracked job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job tracking record not found' });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { companyName, jobTitle, status, url, notes, appliedDate, resumeId, salary } = req.body;

    if (companyName !== undefined) job.companyName = companyName;
    if (jobTitle !== undefined) job.jobTitle = jobTitle;
    if (status !== undefined) {
      job.status = status;
      // Auto-set appliedDate if transitioning to 'applied' and it is not already set
      if (status === 'applied' && !job.appliedDate) {
        job.appliedDate = appliedDate || new Date();
      }
    }
    if (url !== undefined) job.url = url;
    if (notes !== undefined) job.notes = notes;
    if (appliedDate !== undefined) job.appliedDate = appliedDate;
    if (resumeId !== undefined) job.resumeId = resumeId || null;
    if (salary !== undefined) job.salary = salary;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a tracked job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job tracking record not found' });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.deleteOne();
    res.json({ message: 'Job tracking record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
