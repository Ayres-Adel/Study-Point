import express from 'express';
import {
  getProfile,
  login,
  logoutUser,
  registerUser,
  updateOnboarding,
  upgradePlan
} from '../Controllers/userControllers.js';
import {verifyToken} from '../middleware/tokenMiddleware.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', login);
router.post('/logout', verifyToken, logoutUser);
router.post('/profile', verifyToken, getProfile);
router.post('/onboarding', verifyToken, updateOnboarding);
router.post('/plan', verifyToken, upgradePlan);
export default router;