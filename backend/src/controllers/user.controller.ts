import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users, userDonationCenter, userHospital, userDronists } from '../schemas';
import { eq } from 'drizzle-orm';

export const getUserRole = async (c: Context) => {
  try {
    const userIdParam = c.req.query('userId');
    const email = c.req.query('email');

    if (!userIdParam && !email) {
      throw new HTTPException(400, { message: 'userId ou email requis' });
    }
    
    // Récupération de l'utilisateur pour vérifier un éventuel rôle super admin
    let userRecord;
    if (userIdParam) {
      const result = await db.select().from(users).where(eq(users.userId, Number(userIdParam))).limit(1);
      if (result.length === 0) {
        throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
      }
      userRecord = result[0];
    } else if (email) {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (result.length === 0) {
        throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
      }
      userRecord = result[0];
    }

    if (!userRecord) {
      // Ca devrait jamais arriver, mais Typescript est Typescript
      throw new HTTPException(500, { message: 'Erreur interne: utilisateur introuvable' });
    }

    const userIdToCheck = userRecord.userId;
    
    console.log(`DEBUG getUserRole - Checking roles for userId: ${userIdToCheck}, email: ${userRecord.email}`);
    
    // Verif dans user_hospital
    const hospitalRole = await db
      .select()
      .from(userHospital)
      .where(eq(userHospital.userId, userIdToCheck))
      .limit(1);
    
    console.log(`DEBUG getUserRole - Hospital role found:`, hospitalRole.length > 0 ? hospitalRole[0] : 'none');
      
    if (hospitalRole.length > 0) {
      const response = {
        type: hospitalRole[0].admin === true ? 'hospital_admin' : 'user',
        hospitalId: hospitalRole[0].hospitalId,
        admin: hospitalRole[0].admin,
        info: hospitalRole[0].info
      };
      console.log(`DEBUG getUserRole - Returning hospital role:`, response);
      return c.json(response);
    }
    
    // Verif dans user_donation_center
    const donationCenterRole = await db
      .select()
      .from(userDonationCenter)
      .where(eq(userDonationCenter.userId, userIdToCheck))
      .limit(1);
    
    console.log(`DEBUG getUserRole - Donation center role found:`, donationCenterRole.length > 0 ? donationCenterRole[0] : 'none');
      
    if (donationCenterRole.length > 0) {
      const response = {
        type: donationCenterRole[0].admin === true ? 'donation_center_admin' : 'user',
        centerId: donationCenterRole[0].centerId,
        admin: donationCenterRole[0].admin,
        info: donationCenterRole[0].info
      };
      console.log(`DEBUG getUserRole - Returning donation center role:`, response);
      return c.json(response);
    }
    
    // Verif dans user_dronist
    const dronistRole = await db
      .select()
      .from(userDronists)
      .where(eq(userDronists.userId, userIdToCheck))
      .limit(1);
      
    if (dronistRole.length > 0) {
      return c.json({
        type: 'dronist',
        info: dronistRole[0].info
      });
    }
    
    // Si aucun role trouvé, verif du super_admin
    if (userRecord?.isSuperAdmin) {
      return c.json({ type: 'super_admin' });
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