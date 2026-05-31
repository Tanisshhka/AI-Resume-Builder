import express from 'express';
import {
  generateSummary,
  generateObjective,
  recommendSkills,
  analyzeScore,
  checkAtsCompatibility,
  improveContent,
  generateLinkedInHeadlines,
  generateCoverLetter,
  generateInterviewQuestions,
  generateFromProfiles,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all AI helper endpoints

router.post('/summary', generateSummary);
router.post('/objective', generateObjective);
router.post('/recommend-skills', recommendSkills);
router.post('/analyze-score', analyzeScore);
router.post('/ats-check', checkAtsCompatibility);
router.post('/improve-content', improveContent);
router.post('/linkedin-headlines', generateLinkedInHeadlines);
router.post('/cover-letter', generateCoverLetter);
router.post('/interview-prep', generateInterviewQuestions);
router.post('/generate-from-profiles', generateFromProfiles);

export default router;
