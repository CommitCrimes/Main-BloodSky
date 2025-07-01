import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../utils/auth';
import {
  verifyHospitalAdmin,
  getHospitalUsers,
  inviteHospitalUser,
  updateHospitalUser,
  deleteHospitalUser
} from '../controllers/hospital-admin.controller';

export const hospitalAdminRouter = new Hono();

const inviteUserSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  userFirstname: z.string().min(2),
  telNumber: z.number().optional(),
  info: z.string().optional(),
});

const updateUserSchema = z.object({
  userName: z.string().min(2).optional(),
  userFirstname: z.string().min(2).optional(),
  telNumber: z.number().optional(),
  userStatus: z.enum(['active', 'suspended', 'pending']).optional(),
  info: z.string().optional(),
});

hospitalAdminRouter.use('*', authMiddleware);

hospitalAdminRouter.use('/:hospitalId/*', verifyHospitalAdmin);

// GET /hospital-admin/:hospitalId/users - Recuperation des users d'un hôpital
hospitalAdminRouter.get('/:hospitalId/users', getHospitalUsers);

// POST /hospital-admin/:hospitalId/users - Inviter un nouvel utilisateur
hospitalAdminRouter.post(
  '/:hospitalId/users',
  zValidator('json', inviteUserSchema),
  inviteHospitalUser
);

// PUT /hospital-admin/:hospitalId/users/:userId - MAJ d'un utilisateur
hospitalAdminRouter.put(
  '/:hospitalId/users/:userId',
  zValidator('json', updateUserSchema),
  updateHospitalUser
);

hospitalAdminRouter.delete('/:hospitalId/users/:userId', deleteHospitalUser);