import { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/utils/db';
import { userDonationCenter, userHospital, users, hospitals, donationCenters } from '@/schemas';

const updateProfileSchema = z.object({
  userName: z.string().min(1).max(255).optional(),
  userFirstname: z.string().min(1).max(255).optional(),
  telNumber: z.number().int().positive().optional(),
  info: z.string().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[0-9]).{8,}$/, 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre'),
  confirmPassword: z.string().min(1)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

const updateCoordinatesSchema = z.object({
  latitude: z.string().or(z.number()).transform(val => String(val)).refine(val => !isNaN(parseFloat(val)), {
    message: "La latitude doit être un nombre valide"
  }),
  longitude: z.string().or(z.number()).transform(val => String(val)).refine(val => !isNaN(parseFloat(val)), {
    message: "La longitude doit être un nombre valide"
  })
});

export interface UserRole {
  type: 'super_admin' | 'hospital_admin' | 'donation_center_admin' | 'user';
  hospitalId?: number;
  centerId?: number;
  hospitalName?: string;
  centerName?: string;
  hospitalLatitude?: string;
  hospitalLongitude?: string;
  centerLatitude?: string;
  centerLongitude?: string;
  admin?: boolean;
  info?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  userName: string;
  userFirstname: string;
  telNumber?: number;
  userStatus: string;
  role?: UserRole;
  dteCreate?: string;
}

async function getUserRole(userId: string, userEmail: string): Promise<UserRole | undefined> {
  const user = await db
    .select({ isSuperAdmin: users.isSuperAdmin })
    .from(users)
    .where(eq(users.userId, parseInt(userId)))
    .limit(1);

  if (user.length > 0 && user[0].isSuperAdmin) {
    return { type: 'super_admin' };
  }

  const hospitalRole = await db
    .select({
      hospitalId: userHospital.hospitalId,
      admin: userHospital.admin,
      info: userHospital.info,
      hospitalName: hospitals.hospitalName,
      hospitalLatitude: hospitals.hospitalLatitude,
      hospitalLongitude: hospitals.hospitalLongitude
    })
    .from(userHospital)
    .leftJoin(hospitals, eq(userHospital.hospitalId, hospitals.hospitalId))
    .where(eq(userHospital.userId, parseInt(userId)))
    .limit(1);

  if (hospitalRole.length > 0) {
    const role = hospitalRole[0];
    return {
      type: role.admin ? 'hospital_admin' : 'user',
      hospitalId: role.hospitalId ?? undefined,
      hospitalName: role.hospitalName ?? undefined,
      hospitalLatitude: role.hospitalLatitude ?? undefined,
      hospitalLongitude: role.hospitalLongitude ?? undefined,
      admin: role.admin ?? false,
      info: role.info ?? undefined
    };
  }

  const donationCenterRole = await db
    .select({
      centerId: userDonationCenter.centerId,
      admin: userDonationCenter.admin,
      info: userDonationCenter.info,
      centerName: donationCenters.centerCity,
      centerLatitude: donationCenters.centerLatitude,
      centerLongitude: donationCenters.centerLongitude
    })
    .from(userDonationCenter)
    .leftJoin(donationCenters, eq(userDonationCenter.centerId, donationCenters.centerId))
    .where(eq(userDonationCenter.userId, parseInt(userId)))
    .limit(1);

  if (donationCenterRole.length > 0) {
    const role = donationCenterRole[0];
    return {
      type: role.admin ? 'donation_center_admin' : 'user',
      centerId: role.centerId ?? undefined,
      centerName: role.centerName ?? undefined,
      centerLatitude: role.centerLatitude ?? undefined,
      centerLongitude: role.centerLongitude ?? undefined,
      admin: role.admin ?? false,
      info: role.info ?? undefined
    };
  }

  return undefined;
}

export const getMyProfile = async (c: Context) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) {
      return c.json({ message: 'Utilisateur non authentifié' }, 401);
    }

    const user = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        telNumber: users.telNumber,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate
      })
      .from(users)
      .where(eq(users.userId, parseInt(userId)))
      .limit(1);

    if (user.length === 0) {
      return c.json({ message: 'Utilisateur non trouvé' }, 404);
    }

    const userInfo = user[0];
    const role = await getUserRole(userId, userInfo.email);

    const profile: UserProfile = {
      userId: userInfo.userId.toString(),
      email: userInfo.email,
      userName: userInfo.userName || '',
      userFirstname: userInfo.userFirstname || '',
      telNumber: userInfo.telNumber ?? undefined,
      userStatus: userInfo.userStatus || 'active',
      role,
      dteCreate: userInfo.dteCreate?.toISOString()
    };

    return c.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    return c.json({ message: 'Erreur lors de la récupération du profil' }, 500);
  }
};

export const updateMyProfile = async (c: Context) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) {
      return c.json({ message: 'Utilisateur non authentifié' }, 401);
    }

    const body = await c.req.json();
    const validatedData = updateProfileSchema.parse(body);

    const currentUser = await db
      .select({
        email: users.email
      })
      .from(users)
      .where(eq(users.userId, parseInt(userId)))
      .limit(1);

    if (currentUser.length === 0) {
      return c.json({ message: 'Utilisateur non trouvé' }, 404);
    }

    const userEmail = currentUser[0].email;
    const role = await getUserRole(userId, userEmail);

    const updateData: any = {};
    if (validatedData.userName !== undefined) updateData.userName = validatedData.userName;
    if (validatedData.userFirstname !== undefined) updateData.userFirstname = validatedData.userFirstname;
    if (validatedData.telNumber !== undefined) updateData.telNumber = validatedData.telNumber;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.userId, parseInt(userId)));
    }

    if (validatedData.info !== undefined && role) {
      if (role.hospitalId) {
        await db
          .update(userHospital)
          .set({ info: validatedData.info })
          .where(eq(userHospital.userId, parseInt(userId)));
      } else if (role.centerId) {
        await db
          .update(userDonationCenter)
          .set({ info: validatedData.info })
          .where(eq(userDonationCenter.userId, parseInt(userId)));
      }
    }

    const updatedUser = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        telNumber: users.telNumber,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate
      })
      .from(users)
      .where(eq(users.userId, parseInt(userId)))
      .limit(1);

    const updatedRole = await getUserRole(userId, userEmail);

    const profile: UserProfile = {
      userId: updatedUser[0].userId.toString(),
      email: updatedUser[0].email,
      userName: updatedUser[0].userName || '',
      userFirstname: updatedUser[0].userFirstname || '',
      telNumber: updatedUser[0].telNumber ?? undefined,
      userStatus: updatedUser[0].userStatus || 'active',
      role: updatedRole,
      dteCreate: updatedUser[0].dteCreate?.toISOString()
    };

    return c.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        message: 'Données invalides', 
        errors: error.errors 
      }, 400);
    }
    
    console.error('Error updating profile:', error);
    return c.json({ message: 'Erreur lors de la mise à jour du profil' }, 500);
  }
};

export const getProfileById = async (c: Context) => {
  try {
    const targetUserId = c.req.param('userId');
    const currentUserId = c.get('user')?.userId;

    if (!currentUserId) {
      return c.json({ message: 'Utilisateur non authentifié' }, 401);
    }

    const currentUser = await db
      .select({
        email: users.email
      })
      .from(users)
      .where(eq(users.userId, parseInt(currentUserId)))
      .limit(1);

    if (currentUser.length === 0) {
      return c.json({ message: 'Utilisateur non trouvé' }, 404);
    }

    const currentUserRole = await getUserRole(currentUserId, currentUser[0].email);

    if (currentUserId !== targetUserId && !currentUserRole?.admin && currentUserRole?.type !== 'super_admin') {
      return c.json({ message: 'Accès refusé' }, 403);
    }

    const targetUser = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        telNumber: users.telNumber,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate
      })
      .from(users)
      .where(eq(users.userId, parseInt(targetUserId)))
      .limit(1);

    if (targetUser.length === 0) {
      return c.json({ message: 'Utilisateur non trouvé' }, 404);
    }

    const userInfo = targetUser[0];
    const role = await getUserRole(targetUserId, userInfo.email);

    const profile: UserProfile = {
      userId: userInfo.userId.toString(),
      email: userInfo.email,
      userName: userInfo.userName || '',
      userFirstname: userInfo.userFirstname || '',
      telNumber: userInfo.telNumber ?? undefined,
      userStatus: userInfo.userStatus || 'active',
      role,
      dteCreate: userInfo.dteCreate?.toISOString()
    };

    return c.json(profile);
  } catch (error) {
    console.error('Error getting profile by ID:', error);
    return c.json({ message: 'Erreur lors de la récupération du profil' }, 500);
  }
};

export const changePassword = async (c: Context) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) {
      return c.json({ message: 'Utilisateur non authentifié' }, 401);
    }

    const body = await c.req.json();
    const validatedData = changePasswordSchema.parse(body);

    const currentUser = await db
      .select({
        password: users.password
      })
      .from(users)
      .where(eq(users.userId, parseInt(userId)))
      .limit(1);

    if (currentUser.length === 0) {
      return c.json({ message: 'Utilisateur non trouvé' }, 404);
    }

    const bcrypt = await import('bcrypt');
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, currentUser[0].password);
    
    if (!isCurrentPasswordValid) {
      return c.json({ message: 'Mot de passe actuel incorrect' }, 400);
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, saltRounds);

    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.userId, parseInt(userId)));

    return c.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        message: 'Données invalides', 
        errors: error.errors 
      }, 400);
    }
    
    console.error('Error changing password:', error);
    return c.json({ message: 'Erreur lors du changement de mot de passe' }, 500);
  }
};

export const updateHospitalCoordinates = async (c: Context) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) {
      return c.json({ message: 'Utilisateur non authentifié' }, 401);
    }

    const body = await c.req.json();
    const validatedData = updateCoordinatesSchema.parse(body);

    const user = await db
      .select({
        email: users.email
      })
      .from(users)
      .where(eq(users.userId, parseInt(userId)))
      .limit(1);

    if (user.length === 0) {
      return c.json({ message: 'Utilisateur non trouvé' }, 404);
    }

    const role = await getUserRole(userId, user[0].email);

    if (!role?.admin || role.type !== 'hospital_admin') {
      return c.json({ message: 'Accès refusé. Vous devez être administrateur d\'hôpital' }, 403);
    }

    if (!role.hospitalId) {
      return c.json({ message: 'Aucun hôpital associé' }, 400);
    }

    await db
      .update(hospitals)
      .set({ 
        hospitalLatitude: validatedData.latitude,
        hospitalLongitude: validatedData.longitude
      })
      .where(eq(hospitals.hospitalId, role.hospitalId));

    return c.json({ message: 'Coordonnées mises à jour avec succès' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        message: 'Données invalides', 
        errors: error.errors 
      }, 400);
    }
    
    console.error('Error updating hospital coordinates:', error);
    return c.json({ message: 'Erreur lors de la mise à jour des coordonnées' }, 500);
  }
};

export const updateCenterCoordinates = async (c: Context) => {
  try {
    const userId = c.get('user')?.userId;
    if (!userId) {
      return c.json({ message: 'Utilisateur non authentifié' }, 401);
    }

    const body = await c.req.json();
    const validatedData = updateCoordinatesSchema.parse(body);

    const user = await db
      .select({
        email: users.email
      })
      .from(users)
      .where(eq(users.userId, parseInt(userId)))
      .limit(1);

    if (user.length === 0) {
      return c.json({ message: 'Utilisateur non trouvé' }, 404);
    }

    const role = await getUserRole(userId, user[0].email);

    if (!role?.admin || role.type !== 'donation_center_admin') {
      return c.json({ message: 'Accès refusé. Vous devez être administrateur de centre de donation' }, 403);
    }

    if (!role.centerId) {
      return c.json({ message: 'Aucun centre de donation associé' }, 400);
    }

    await db
      .update(donationCenters)
      .set({ 
        centerLatitude: validatedData.latitude,
        centerLongitude: validatedData.longitude
      })
      .where(eq(donationCenters.centerId, role.centerId));

    return c.json({ message: 'Coordonnées mises à jour avec succès' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        message: 'Données invalides', 
        errors: error.errors 
      }, 400);
    }
    
    console.error('Error updating center coordinates:', error);
    return c.json({ message: 'Erreur lors de la mise à jour des coordonnées' }, 500);
  }
};