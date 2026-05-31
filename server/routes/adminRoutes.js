import express from 'express';
import {
  getAdminMetrics,
  getAllUsers,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(admin); // Restrict whole route group to admin role

router.get('/metrics', getAdminMetrics);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;
