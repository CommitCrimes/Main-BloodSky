import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users, userDonationCenter } from '../schemas';
import { eq, and } from 'drizzle-orm';
import { sendInvitationEmail, generateToken, generateTempPassword } from '../services/email.service';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';

const inviteDonationCenterUserSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  userFirstname: z.string().min(2),
  telNumber: z.number().optional(),
  info: z.string().optional(),
});

const updateDonationCenterUserSchema = z.object({
  userName: z.string().min(2).optional(),
  userFirstname: z.string().min(2).optional(),
  telNumber: z.number().optional(),
  userStatus: z.enum(['active', 'suspended', 'pending']).optional(),
  info: z.string().optional(),
});

export const verifyDonationCenterAdmin = async (c: Context, next: Function) => {
  try {
    const donationCenterId = Number(c.req.param('donationCenterId'));
    const user = c.get('user');
    const userId = Number(user.userId);
    
    if (!donationCenterId || !userId) {
      throw new HTTPException(400, { message: 'ID centre de donation et utilisateur requis' });
    }
    
    const adminCheck = await db
      .select()
      .from(userDonationCenter)
      .where(
        and(
          eq(userDonationCenter.userId, userId),
          eq(userDonationCenter.centerId, donationCenterId),
          eq(userDonationCenter.admin, true)
        )
      )
      .limit(1);
    
    if (adminCheck.length === 0) {
      throw new HTTPException(403, { message: 'Accès refusé - Admin centre de donation requis' });
    }
    
    c.set('donationCenterId', donationCenterId);
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Erreur de vérification des permissions' });
  }
};

export const getDonationCenterUsers = async (c: Context) => {
  try {
    const donationCenterId = c.get('donationCenterId');
    
    const donationCenterUsers = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        telNumber: users.telNumber,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate,
        info: userDonationCenter.info,
        admin: userDonationCenter.admin
      })
      .from(users)
      .innerJoin(userDonationCenter, eq(users.userId, userDonationCenter.userId))
      .where(
        and(
          eq(userDonationCenter.centerId, donationCenterId),
          eq(userDonationCenter.admin, false) // Seulement les utilisateurs lambda
        )
      );
    
    return c.json({
      users: donationCenterUsers,
      total: donationCenterUsers.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw new HTTPException(500, { message: 'Erreur serveur' });
  }
};

// Inviter un utilisateur dans le centre de donation
export const inviteDonationCenterUser = async (c: Context) => {
  try {
    const donationCenterId = c.get('donationCenterId');
    const data = await c.req.json();
    
    const validatedData = inviteDonationCenterUserSchema.parse(data);
    const { email, userName, userFirstname, telNumber, info } = validatedData;
    
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      throw new HTTPException(409, { message: 'Un utilisateur avec cet email existe déjà' });
    }
    
    //token
    const token = generateToken();
    const tempPassword = generateTempPassword();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    
    // Créer l'utilisateur
    const [newUser] = await db.insert(users).values({
      email,
      password: await bcrypt.hash(tempPassword, 10),
      userName,
      userFirstname,
      telNumber,
      userStatus: 'pending',
      tempPasswordToken: token,
      tempPasswordExpires: expiresAt,
      urlUsed: false,
    }).returning();
    
    // Assigner au centre de donation comme utilisateur lambda
    await db.insert(userDonationCenter).values({
      userId: newUser.userId,
      centerId: donationCenterId,
      admin: false,
      info: info || '',
    });
    
    await sendInvitationEmail(email, token, tempPassword, userName);
    
    return c.json({ 
      message: 'Invitation envoyée avec succès',
      userId: newUser.userId,
      email,
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: 'Données invalides: ' + error.errors.map(e => e.message).join(', ') });
    }
    console.error('Erreur d\'invitation utilisateur:', error);
    throw new HTTPException(500, { message: 'Échec de l\'envoi de l\'invitation' });
  }
};

// Mettre à jour un utilisateur du centre de donation
export const updateDonationCenterUser = async (c: Context) => {
  try {
    const donationCenterId = c.get('donationCenterId');
    const userId = Number(c.req.param('userId'));
    const data = await c.req.json();
    
    const validatedData = updateDonationCenterUserSchema.parse(data);
    
    const userCheck = await db
      .select()
      .from(userDonationCenter)
      .where(
        and(
          eq(userDonationCenter.userId, userId),
          eq(userDonationCenter.centerId, donationCenterId),
          eq(userDonationCenter.admin, false)
        )
      )
      .limit(1);
    
    if (userCheck.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé dans ce centre de donation' });
    }
    
    const userUpdateData: any = {};
    if (validatedData.userName) userUpdateData.userName = validatedData.userName;
    if (validatedData.userFirstname) userUpdateData.userFirstname = validatedData.userFirstname;
    if (validatedData.telNumber !== undefined) userUpdateData.telNumber = validatedData.telNumber;
    if (validatedData.userStatus) userUpdateData.userStatus = validatedData.userStatus;
    
    if (Object.keys(userUpdateData).length > 0) {
      await db.update(users)
        .set(userUpdateData)
        .where(eq(users.userId, userId));
    }
    
    if (validatedData.info !== undefined) {
      await db.update(userDonationCenter)
        .set({ info: validatedData.info })
        .where(
          and(
            eq(userDonationCenter.userId, userId),
            eq(userDonationCenter.centerId, donationCenterId)
          )
        );
    }
    
    return c.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: 'Données invalides: ' + error.errors.map(e => e.message).join(', ') });
    }
    console.error('Erreur de mise à jour utilisateur:', error);
    throw new HTTPException(500, { message: 'Erreur serveur' });
  }
};

// Supprimer un utilisateur du centre de donation
export const deleteDonationCenterUser = async (c: Context) => {
  try {
    const donationCenterId = c.get('donationCenterId');
    const userId = Number(c.req.param('userId'));
    
    // Vérifier que l'utilisateur appartient à ce centre de donation et n'est pas admin
    const userCheck = await db
      .select()
      .from(userDonationCenter)
      .where(
        and(
          eq(userDonationCenter.userId, userId),
          eq(userDonationCenter.centerId, donationCenterId),
          eq(userDonationCenter.admin, false)
        )
      )
      .limit(1);
    
    if (userCheck.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé dans ce centre de donation' });
    }
    
    // Supprimer d'abord la relation centre de donation
    await db.delete(userDonationCenter)
      .where(
        and(
          eq(userDonationCenter.userId, userId),
          eq(userDonationCenter.centerId, donationCenterId)
        )
      );
    
    // Verif des relations
    const otherRelations = await db
      .select()
      .from(userDonationCenter)
      .where(eq(userDonationCenter.userId, userId))
      .limit(1);
    
    // Si pas d'autres relations, supprimer l'utilisateur complètement
    if (otherRelations.length === 0) {
      await db.delete(users).where(eq(users.userId, userId));
    }
    
    return c.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur de suppression utilisateur:', error);
    throw new HTTPException(500, { message: 'Erreur serveur' });
  }
};