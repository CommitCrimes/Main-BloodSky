import { Context } from 'hono';
import { ZodSchema } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users } from '../schemas';
import { eq } from 'drizzle-orm';
import { signToken } from '../utils/auth';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

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
    
    const userId = uuidv4();
    
    // Créer un nouvel utilisateur avec le mot de passe haché
    await db.insert(users).values({
      userId,
      email,
      password: hashedPassword,
      userName,
      userFirstname,
      telNumber,
      userStatus: 'active',
    });
    
    const token = await signToken({ userId, email });
    
    return c.json({ 
      message: 'Utilisateur enregistré avec succès',
      token,
      user: {
        userId,
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
};