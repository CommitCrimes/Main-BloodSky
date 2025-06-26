import { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users } from '../schemas';
import { eq } from 'drizzle-orm';
import { signToken } from '../utils/auth';
import * as bcrypt from 'bcrypt';
import { sendInvitationEmail, generateToken, generateTempPassword } from '../services/email.service';
import { userDonationCenter, userHospital } from '../schemas';

// Schémas de validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  userName: z.string().min(2),
  userFirstname: z.string().min(2),
  telNumber: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  userFirstname: z.string().min(2),
  telNumber: z.number().optional(),
});

const updatePasswordSchema = z.object({
  token: z.string(),
  tempPassword: z.string(),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const inviteAdminSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  userFirstname: z.string().min(2),
  telNumber: z.number().optional(),
  entityType: z.enum(['donation_center', 'hospital']),
  entityId: z.number(),
  admin: z.boolean(),
  info: z.string().optional(),
});

export const register = async (c: Context) => {
  try {
    const { email, password, userName, userFirstname, telNumber } = await c.req.json();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      throw new HTTPException(409, { message: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Hacher le mot de passe avec bcrypt (10 rounds est un bon équilibre entre sécurité et performance)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer un nouvel utilisateur avec le mot de passe haché (userId auto-généré)
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      userName,
      userFirstname,
      telNumber,
      userStatus: 'active',
    }).returning();
    
    const token = await signToken({ userId: newUser.userId, email });
    
    return c.json({ 
      message: 'Utilisateur enregistré avec succès',
      token,
      user: {
        userId: newUser.userId,
        email,
        userName,
        userFirstname,
      }
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur d\'inscription:', error);
    throw new HTTPException(500, { message: 'Échec de l\'inscription de l\'utilisateur' });
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    
    // Rechercher l'utilisateur par email
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      throw new HTTPException(401, { message: 'Email ou mot de passe invalide' });
    }
    
    const foundUser = user[0];
    
    // Vérifier le mot de passe avec bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: 'Email ou mot de passe invalide' });
    }
    
    // Vérifier si le compte utilisateur est actif
    if (foundUser.userStatus !== 'active') {
      throw new HTTPException(403, { message: 'Compte suspendu' });
    }
    
    const token = await signToken({ userId: foundUser.userId, email: foundUser.email });
    
    return c.json({
      message: 'Connexion réussie',
      token,
      user: {
        userId: foundUser.userId,
        email: foundUser.email,
        userName: foundUser.userName,
        userFirstname: foundUser.userFirstname,
      }
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur de connexion:', error);
    throw new HTTPException(500, { message: 'Échec de la connexion' });
  }
};

export const inviteUser = async (c: Context) => {
  try {
    const { email, userName, userFirstname, telNumber } = await c.req.json();    
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      throw new HTTPException(409, { message: 'Un utilisateur avec cet email existe déjà' });
    }
    
    const token = generateToken();
    const tempPassword = generateTempPassword();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    
    // Créer l'user avec token temporaire
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
    
    // Envoyer l'email d'invitation (simulationnnnn)
    console.log('📧 Simulation d\'envoi d\'email:');
    console.log(`À: ${email}`);
    console.log(`Token: ${token}`);
    console.log(`Mot de passe temporaire: ${tempPassword}`);
    
    return c.json({ 
      message: 'Invitation envoyée avec succès',
      userId: newUser.userId,
      email,
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur d\'invitation:', error);
    throw new HTTPException(500, { message: 'Échec de l\'envoi de l\'invitation' });
  }
};

export const updatePassword = async (c: Context) => {
  try {
    const { token, tempPassword, newPassword } = await c.req.json();
    
    // Rechercher l'utilisateur par token
    const user = await db.select().from(users)
      .where(eq(users.tempPasswordToken, token))
      .limit(1);
    
    if (user.length === 0) {
      throw new HTTPException(404, { message: 'Token invalide' });
    }
    
    const foundUser = user[0];
    
    if (!foundUser.tempPasswordExpires || foundUser.tempPasswordExpires < new Date()) {
      throw new HTTPException(410, { message: 'Le lien a expiré' });
    }
    if (foundUser.urlUsed) {
      throw new HTTPException(410, { message: 'Ce lien a déjà été utilisé' });
    }
    const isValidTempPassword = await bcrypt.compare(tempPassword, foundUser.password);
    if (!isValidTempPassword) {
      throw new HTTPException(401, { message: 'Mot de passe temporaire invalide' });
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await db.update(users)
      .set({
        password: hashedNewPassword,
        userStatus: 'active',
        urlUsed: true,
        tempPasswordToken: null,
        tempPasswordExpires: null,
      })
      .where(eq(users.userId, foundUser.userId));
    
    return c.json({ 
      message: 'Mot de passe mis à jour avec succès',
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur de mise à jour du mot de passe:', error);
    throw new HTTPException(500, { message: 'Échec de la mise à jour du mot de passe' });
  }
};

export const inviteAdmin = async (c: Context) => {
  try {
    const { email, userName, userFirstname, telNumber, entityType, entityId, admin, info } = await c.req.json();
    
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      throw new HTTPException(409, { message: 'Un utilisateur avec cet email existe déjà' });
    }
    
    const token = generateToken();
    const tempPassword = generateTempPassword();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    
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
    
    // Assigner le rôle selon le type d'entité
    if (entityType === 'donation_center') {
      await db.insert(userDonationCenter).values({
        userId: newUser.userId,
        centerId: entityId,
        admin,
        info: info || '',
      });
    } else if (entityType === 'hospital') {
      await db.insert(userHospital).values({
        userId: newUser.userId,
        hospitalId: entityId,
        admin,
        info: info || '',
      });
    }
    
    // Envoyer l'email d'invitation simulationnnnn
    const entityLabel = entityType === 'donation_center' ? 'centre de donation' : 'hôpital';
    console.log('📧 Simulation d\'envoi d\'email:');
    console.log(`À: ${email}`);
    console.log(`Token: ${token}`);
    console.log(`Mot de passe temporaire: ${tempPassword}`);
    
    return c.json({ 
      message: `Invitation envoyée avec succès pour devenir administrateur du ${entityLabel}`,
      userId: newUser.userId,
      email,
      entityType,
      entityId,
    }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur d\'invitation admin:', error);
    throw new HTTPException(500, { message: 'Échec de l\'envoi de l\'invitation admin' });
  }
};

// Contrôleur avec validateurs
export const authController = {
  register: [
    zValidator('json' as const, registerSchema),
    register
  ],
  login: [
    zValidator('json' as const, loginSchema),
    login
  ],
  inviteUser: [
    zValidator('json' as const, inviteUserSchema),
    inviteUser
  ],
  updatePassword: [
    zValidator('json' as const, updatePasswordSchema),
    updatePassword
  ],
  inviteAdmin: [
    zValidator('json' as const, inviteAdminSchema),
    inviteAdmin
  ],
};