import { Hono } from 'hono';
import { getMyProfile, updateMyProfile, getProfileById, changePassword } from '../controllers/profile.controller';
import { authMiddleware } from '@/utils/auth';

const profileRouter = new Hono();

// Routes pour la gestion des profils
profileRouter.get('/me', authMiddleware, getMyProfile);
profileRouter.put('/me', authMiddleware, updateMyProfile);
profileRouter.put('/change-password', authMiddleware, changePassword);
profileRouter.get('/:userId', authMiddleware, getProfileById);

export { profileRouter };