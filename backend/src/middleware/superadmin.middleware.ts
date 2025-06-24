import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyToken } from '../utils/auth';
import { db } from '../utils/db';
import { users } from '../schemas';
import { eq } from 'drizzle-orm';

const SUPER_ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL || 'admin@bloodsky.fr',
];

export const superAdminAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      throw new HTTPException(401, { message: 'Token d\'authentification manquant' });
    }
    const token = authHeader.replace('Bearer ', ''); 
    if (!token) {
      throw new HTTPException(401, { message: 'Format de token invalide' });
    }
    const payload = await verifyToken(token);
    
    if (!payload || !payload.email) {
      throw new HTTPException(401, { message: 'Token invalide' });
    }

    if (!SUPER_ADMIN_EMAILS.includes(payload.email)) {
      throw new HTTPException(403, { 
        message: 'Accès refusé: privilèges super administrateur requis' 
      });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (user.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
    }

    const foundUser = user[0];

    if (foundUser.userStatus !== 'active') {
      throw new HTTPException(403, { message: 'Compte utilisateur inactif' });
    }
    c.set('user', {
      userId: foundUser.userId,
      email: foundUser.email,
      userName: foundUser.userName,
      userFirstname: foundUser.userFirstname,
      isSuperAdmin: true,
    });

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur middleware super admin:', error);
    throw new HTTPException(500, { message: 'Erreur d\'authentification' });
  }
};

export const logSuperAdminAction = async (c: Context, next: Next) => {
  const user = c.get('user');
  const method = c.req.method;
  const path = c.req.path;
  const timestamp = new Date().toISOString();

  console.log(`🔐 [SUPER ADMIN] ${timestamp} - ${user?.email} - ${method} ${path}`);

  await next();
};