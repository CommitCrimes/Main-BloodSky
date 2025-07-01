import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users, userHospital } from '../schemas';
import { eq, and } from 'drizzle-orm';
import { sendInvitationEmail, generateToken, generateTempPassword } from '../services/email.service';
import * as bcrypt from 'bcrypt';
import { z } from 'zod';

const inviteHospitalUserSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  userFirstname: z.string().min(2),
  telNumber: z.number().optional(),
  info: z.string().optional(),
});

const updateHospitalUserSchema = z.object({
  userName: z.string().min(2).optional(),
  userFirstname: z.string().min(2).optional(),
  telNumber: z.number().optional(),
  userStatus: z.enum(['active', 'suspended', 'pending']).optional(),
  info: z.string().optional(),
});

// Middleware pour vérifier que l'utilisateur est admin de l'hôpital
export const verifyHospitalAdmin = async (c: Context, next: Function) => {
  try {
    const hospitalId = Number(c.req.param('hospitalId'));
    const user = c.get('user'); // Depuis le middleware d'auth existant
    const userId = Number(user.userId);
    
    if (!hospitalId || !userId) {
      throw new HTTPException(400, { message: 'ID hôpital et utilisateur requis' });
    }
    
    // Vérifier que l'utilisateur est admin de cet hôpital
    const adminCheck = await db
      .select()
      .from(userHospital)
      .where(
        and(
          eq(userHospital.userId, userId),
          eq(userHospital.hospitalId, hospitalId),
          eq(userHospital.admin, true)
        )
      )
      .limit(1);
    
    if (adminCheck.length === 0) {
      throw new HTTPException(403, { message: 'Accès refusé - Admin hôpital requis' });
    }
    
    c.set('hospitalId', hospitalId);
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: 'Erreur de vérification des permissions' });
  }
};

// Obtenir tous les utilisateurs de l'hôpital (non-admin)
export const getHospitalUsers = async (c: Context) => {
  try {
    const hospitalId = c.get('hospitalId');
    
    const hospitalUsers = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        telNumber: users.telNumber,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate,
        info: userHospital.info,
        admin: userHospital.admin
      })
      .from(users)
      .innerJoin(userHospital, eq(users.userId, userHospital.userId))
      .where(
        and(
          eq(userHospital.hospitalId, hospitalId),
          eq(userHospital.admin, false) // Seulement les utilisateurs lambda
        )
      );
    
    return c.json({
      users: hospitalUsers,
      total: hospitalUsers.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw new HTTPException(500, { message: 'Erreur serveur' });
  }
};

// Inviter un utilisateur dans l'hôpital
export const inviteHospitalUser = async (c: Context) => {
  try {
    const hospitalId = c.get('hospitalId');
    const data = await c.req.json();
    
    const validatedData = inviteHospitalUserSchema.parse(data);
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
    
    // Assigner à l'hôpital comme utilisateur lamda
    await db.insert(userHospital).values({
      userId: newUser.userId,
      hospitalId: hospitalId,
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

// Mettre à jour un utilisateur de l'hôpital
export const updateHospitalUser = async (c: Context) => {
  try {
    const hospitalId = c.get('hospitalId');
    const userId = Number(c.req.param('userId'));
    const data = await c.req.json();
    
    const validatedData = updateHospitalUserSchema.parse(data);
    
    const userCheck = await db
      .select()
      .from(userHospital)
      .where(
        and(
          eq(userHospital.userId, userId),
          eq(userHospital.hospitalId, hospitalId),
          eq(userHospital.admin, false)
        )
      )
      .limit(1);
    
    if (userCheck.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé dans cet hôpital' });
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
      await db.update(userHospital)
        .set({ info: validatedData.info })
        .where(
          and(
            eq(userHospital.userId, userId),
            eq(userHospital.hospitalId, hospitalId)
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

// Supprimer un utilisateur de l'hôpital
export const deleteHospitalUser = async (c: Context) => {
  try {
    const hospitalId = c.get('hospitalId');
    const userId = Number(c.req.param('userId'));
    
    // Vérifier que l'utilisateur appartient à cet hôpital et n'est pas admin
    const userCheck = await db
      .select()
      .from(userHospital)
      .where(
        and(
          eq(userHospital.userId, userId),
          eq(userHospital.hospitalId, hospitalId),
          eq(userHospital.admin, false)
        )
      )
      .limit(1);
    
    if (userCheck.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé dans cet hôpital' });
    }
    
    // Supprimer d'abord la relation hôpital
    await db.delete(userHospital)
      .where(
        and(
          eq(userHospital.userId, userId),
          eq(userHospital.hospitalId, hospitalId)
        )
      );
    
    // Verif des relations
    const otherRelations = await db
      .select()
      .from(userHospital)
      .where(eq(userHospital.userId, userId))
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