import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller';

export const authRouter = new Hono();

// Routes d'authentification
authRouter.post('/register', ...authController.register);
authRouter.post('/login', ...authController.login);
authRouter.post('/invite', ...authController.inviteUser);
authRouter.post('/update-password', ...authController.updatePassword);
authRouter.post('/invite-admin', ...authController.inviteAdmin);