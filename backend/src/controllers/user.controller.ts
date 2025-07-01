import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users, userDonationCenter, userHospital } from '../schemas';
import { eq } from 'drizzle-orm';

export const getUserRole = async (c: Context) => {
  try {
    const userId = Number(c.req.query('userId'));
    const email = c.req.query('email');
    
    if (!userId && !email) {
      throw new HTTPException(400, { message: 'userId ou email requis' });
    }
    
    if (email === 'admin@bloodsky.fr') {
      return c.json({
        type: 'super_admin'
      });
    }
    
    let userIdToCheck = userId;
    
    if (!userId && email) {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) {
        throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
      }
      userIdToCheck = user[0].userId;
    }
    
    // Verif dans user_hospital
    const hospitalRole = await db
      .select()
      .from(userHospital)
      .where(eq(userHospital.userId, userIdToCheck))
      .limit(1);
      
    if (hospitalRole.length > 0) {
      return c.json({
        type: 'hospital_admin',
        hospitalId: hospitalRole[0].hospitalId,
        admin: hospitalRole[0].admin,
        info: hospitalRole[0].info
      });
    }
    
    // Verif dans user_donation_center
    const donationCenterRole = await db
      .select()
      .from(userDonationCenter)
      .where(eq(userDonationCenter.userId, userIdToCheck))
      .limit(1);
      
    if (donationCenterRole.length > 0) {
      return c.json({
        type: 'donation_center_admin',
        centerId: donationCenterRole[0].centerId,
        admin: donationCenterRole[0].admin,
        info: donationCenterRole[0].info
      });
    }
    
    // Si aucun rôle spécifique trouvé, utilisateur lambda
    return c.json({
      type: 'user'
    });
    
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la récupération du rôle utilisateur:', error);
    throw new HTTPException(500, { message: 'Erreur serveur' });
  }
};