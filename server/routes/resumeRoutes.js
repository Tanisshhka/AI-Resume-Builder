import express from 'express';
import {
  createResume,
  getMyResumes,
  getResumeById,
  updateResume,
  deleteResume,
  toggleResumePublic,
  getResumeBySlug,
  restoreResumeVersion,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public share route (Must place above general id parameters)
router.get('/share/:slug', getResumeBySlug);

// User protected routes
router.route('/')
  .get(protect, getMyResumes)
  .post(protect, createResume);

router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

router.post('/:id/share', protect, toggleResumePublic);
router.post('/:id/versions/:versionId/restore', protect, restoreResumeVersion);

export default router;
