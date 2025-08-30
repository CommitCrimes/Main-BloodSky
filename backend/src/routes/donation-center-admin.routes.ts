import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../utils/auth';
import {
  verifyDonationCenterAdmin,
  getDonationCenterUsers,
  inviteDonationCenterUser,
  updateDonationCenterUser,
  deleteDonationCenterUser
} from '../controllers/donation-center-admin.controller';

export const donationCenterAdminRouter = new Hono();

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

donationCenterAdminRouter.use('*', authMiddleware);

donationCenterAdminRouter.use('/:donationCenterId/*', verifyDonationCenterAdmin);

// GET /donation-center-admin/:donationCenterId/users - Recuperation des users d'un centre de donation
donationCenterAdminRouter.get('/:donationCenterId/users', getDonationCenterUsers);

// POST /donation-center-admin/:donationCenterId/users - Inviter un nouvel utilisateur
donationCenterAdminRouter.post(
  '/:donationCenterId/users',
  zValidator('json', inviteUserSchema),
  inviteDonationCenterUser
);

// PUT /donation-center-admin/:donationCenterId/users/:userId - MAJ d'un utilisateur
donationCenterAdminRouter.put(
  '/:donationCenterId/users/:userId',
  zValidator('json', updateUserSchema),
  updateDonationCenterUser
);

donationCenterAdminRouter.delete('/:donationCenterId/users/:userId', deleteDonationCenterUser);

