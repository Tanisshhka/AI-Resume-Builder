import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Job from '../models/Job.js';

// @desc    Get dashboard metrics (admin only)
// @route   GET /api/admin/metrics
// @access  Private/Admin
export const getAdminMetrics = async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    const resumeCount = await Resume.countDocuments({});
    const jobCount = await Job.countDocuments({});
    
    // Sum all AI Tokens Used
    const tokenResult = await User.aggregate([
      { $group: { _id: null, totalTokens: { $sum: '$aiTokensUsed' } } }
    ]);
    const totalAiRequests = tokenResult[0]?.totalTokens || 0;

    // Recent Resumes Created
    const recentResumes = await Resume.find({})
      .select('title templateId resumeScore createdAt')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // User growth (grouped by month or simple count of last 6 months)
    const recentUsers = await User.find({})
      .select('name email role aiTokensUsed createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      counts: {
        users: userCount,
        resumes: resumeCount,
        jobs: jobCount,
        aiRequests: totalAiRequests
      },
      recentResumes,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users list (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Do not delete self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    // Delete associated resumes and jobs first
    await Resume.deleteMany({ userId: user._id });
    await Job.deleteMany({ userId: user._id });
    
    await user.deleteOne();
    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
