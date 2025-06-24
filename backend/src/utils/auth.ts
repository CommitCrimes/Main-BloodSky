import { Context } from 'hono';
import { SignJWT, jwtVerify } from 'jose';
import { HTTPException } from 'hono/http-exception';

// Récupérer la clé secrète JWT depuis les variables d'environnement - s'assurer qu'elle est définie
const JWT_SECRET_KEY = process.env.JWT_SECRET;
if (!JWT_SECRET_KEY) {
  console.error('La variable d\'environnement JWT_SECRET n\'est pas définie !');
  process.exit(1);
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export type JWTPayload = {
  userId: string;
  email: string;
};

export type SignTokenPayload = {
  userId: number | string;
  email: string;
};

export const signToken = async (payload: SignTokenPayload): Promise<string> => {
  const jwtPayload: JWTPayload = {
    userId: payload.userId.toString(),
    email: payload.email,
  };
  
  return new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (err) {
    throw new HTTPException(401, { message: 'Token invalide ou expiré' });
  }
};

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Authentification requise' });
    }
    
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    // Définir les données utilisateur dans le contexte de la requête pour que les routes protégées puissent les utiliser
    c.set('user', payload);
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    // Convertir toute autre erreur en 401 non autorisé
    throw new HTTPException(401, { message: 'Échec de l\'authentification' });
  }
};