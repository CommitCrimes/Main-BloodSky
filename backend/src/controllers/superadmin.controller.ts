import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users, userDonationCenter, userHospital, userDronists, userSupportCenters, deliveries, drones, hospitals, donationCenters, deliveryParticipations, notifications, bloods } from '../schemas';
import { eq, desc, sql } from 'drizzle-orm';

// =============== GESTION DES ADMINS ===============

export const getAllAdmins = async (c: Context) => {
  try {
    // recup des admin d'un centre de donation
    const donationAdmins = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate,
        telNumber: users.telNumber,
        entityType: sql<string>`'donation_center'`,
        entityId: userDonationCenter.centerId,
        entityName: donationCenters.centerCity,
        admin: userDonationCenter.admin,
        info: userDonationCenter.info,
      })
      .from(users)
      .innerJoin(userDonationCenter, eq(users.userId, userDonationCenter.userId))
      .innerJoin(donationCenters, eq(userDonationCenter.centerId, donationCenters.centerId));

    // recup des admin d'un hopital
    const hospitalAdmins = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate,
        telNumber: users.telNumber,
        entityType: sql<string>`'hospital'`,
        entityId: userHospital.hospitalId,
        entityName: hospitals.hospitalName,
        admin: userHospital.admin,
        info: userHospital.info,
      })
      .from(users)
      .innerJoin(userHospital, eq(users.userId, userHospital.userId))
      .innerJoin(hospitals, eq(userHospital.hospitalId, hospitals.hospitalId));

    // Combiner les résultats
    const allAdmins = [...donationAdmins, ...hospitalAdmins];

    return c.json({
      admins: allAdmins,
      total: allAdmins.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des admins:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des admins' });
  }
};

export const getAdminById = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    
    if (isNaN(userId)) {
      throw new HTTPException(400, { message: 'ID utilisateur invalide' });
    }

    // Chercher l'utilisateur de base
    const user = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    
    if (user.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
    }

    const foundUser = user[0];

    // Chercher dans les centres de donation
    const donationCenter = await db
      .select({
        entityType: sql<string>`'donation_center'`,
        entityId: userDonationCenter.centerId,
        entityName: donationCenters.centerCity,
        admin: userDonationCenter.admin,
        info: userDonationCenter.info,
      })
      .from(userDonationCenter)
      .innerJoin(donationCenters, eq(userDonationCenter.centerId, donationCenters.centerId))
      .where(eq(userDonationCenter.userId, userId))
      .limit(1);

    // Chercher dans les hôpitaux
    const hospital = await db
      .select({
        entityType: sql<string>`'hospital'`,
        entityId: userHospital.hospitalId,
        entityName: hospitals.hospitalName,
        admin: userHospital.admin,
        info: userHospital.info,
      })
      .from(userHospital)
      .innerJoin(hospitals, eq(userHospital.hospitalId, hospitals.hospitalId))
      .where(eq(userHospital.userId, userId))
      .limit(1);

    const entity = donationCenter.length > 0 ? donationCenter[0] : hospital.length > 0 ? hospital[0] : null;

    if (!entity) {
      throw new HTTPException(404, { message: 'Admin non trouvé dans les entités' });
    }

    return c.json({
      ...foundUser,
      ...entity,
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la récupération de l\'admin:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération de l\'admin' });
  }
};

export const updateAdmin = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const { userName, userFirstname, telNumber, userStatus, admin, info } = await c.req.json();
    
    if (isNaN(userId)) {
      throw new HTTPException(400, { message: 'ID utilisateur invalide' });
    }
    const existingUser = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    
    if (existingUser.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
    }

    const updatedFields: any = {};
    if (userName !== undefined) updatedFields.userName = userName;
    if (userFirstname !== undefined) updatedFields.userFirstname = userFirstname;
    if (telNumber !== undefined) updatedFields.telNumber = telNumber;
    if (userStatus !== undefined) updatedFields.userStatus = userStatus;

    if (Object.keys(updatedFields).length > 0) {
      await db.update(users).set(updatedFields).where(eq(users.userId, userId));
    }

    if (admin !== undefined || info !== undefined) {
      const entityFields: any = {};
      if (admin !== undefined) entityFields.admin = admin;
      if (info !== undefined) entityFields.info = info;

      const donationUpdate = await db.update(userDonationCenter)
        .set(entityFields)
        .where(eq(userDonationCenter.userId, userId));

      if (donationUpdate.rowCount === 0) {
        await db.update(userHospital)
          .set(entityFields)
          .where(eq(userHospital.userId, userId));
      }
    }

    return c.json({ message: 'Admin mis à jour avec succès' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la mise à jour de l\'admin:', error);
    throw new HTTPException(500, { message: 'Échec de la mise à jour de l\'admin' });
  }
};

export const deleteAdmin = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    
    if (isNaN(userId)) {
      throw new HTTPException(400, { message: 'ID utilisateur invalide' });
    }

    const existingUser = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    if (existingUser.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
    }

    // Supprimer les assos d'entité (cascade)
    await db.delete(userDonationCenter).where(eq(userDonationCenter.userId, userId));
    await db.delete(userHospital).where(eq(userHospital.userId, userId));
    await db.delete(userDronists).where(eq(userDronists.userId, userId));
    await db.delete(userSupportCenters).where(eq(userSupportCenters.userId, userId));
    await db.delete(deliveryParticipations).where(eq(deliveryParticipations.userId, userId));

    await db.delete(users).where(eq(users.userId, userId));

    return c.json({ message: 'Admin supprimé avec succès' });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la suppression de l\'admin:', error);
    throw new HTTPException(500, { message: 'Échec de la suppression de l\'admin' });
  }
};

// =============== GESTION DES ENTITÉS ===============

export const getAllUsers = async (c: Context) => {
  try {
    const allUsersWithRoles = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate,
        telNumber: users.telNumber,
        hospitalId: userHospital.hospitalId,
        hospitalAdmin: userHospital.admin,
        hospitalInfo: userHospital.info,
        hospitalName: hospitals.hospitalName,
        centerId: userDonationCenter.centerId,
        centerAdmin: userDonationCenter.admin,
        centerInfo: userDonationCenter.info,
        centerCity: donationCenters.centerCity,
        dronistId: userDronists.userId,
      })
      .from(users)
      .leftJoin(userHospital, eq(users.userId, userHospital.userId))
      .leftJoin(hospitals, eq(userHospital.hospitalId, hospitals.hospitalId))
      .leftJoin(userDonationCenter, eq(users.userId, userDonationCenter.userId))
      .leftJoin(donationCenters, eq(userDonationCenter.centerId, donationCenters.centerId))
      .leftJoin(userDronists, eq(users.userId, userDronists.userId))
      .orderBy(desc(users.dteCreate));

    const superAdminEmails = ['super.admin@bloodsky.com', 'admin@bloodsky.com'];
    
    const enrichedUsers = allUsersWithRoles
      .filter(user => user.email !== 'admin@bloodsky.fr') // Masquer le super admin
      .map(user => {
      let roleType = 'user';
      let role = null;

      if (superAdminEmails.includes(user.email)) {
        roleType = 'super_admin';
        role = { type: 'super_admin', admin: true };
      } else if (user.dronistId) {
        roleType = 'dronist';
        role = {
          type: 'dronist',
          admin: false
        };
      } else if (user.hospitalId && user.hospitalAdmin) {
        roleType = 'hospital_admin';
        role = {
          type: 'hospital_admin',
          hospitalId: user.hospitalId,
          admin: user.hospitalAdmin,
          info: user.hospitalInfo
        };
      } else if (user.centerId && user.centerAdmin) {
        roleType = 'donation_center_admin';
        role = {
          type: 'donation_center_admin',
          centerId: user.centerId,
          admin: user.centerAdmin,
          info: user.centerInfo
        };
      } else if (user.hospitalId || user.centerId) {
        roleType = user.hospitalId ? 'hospital_user' : 'center_user';
        role = {
          type: roleType,
          hospitalId: user.hospitalId,
          centerId: user.centerId,
          admin: false
        };
      }

      return {
        userId: user.userId,
        email: user.email,
        userName: user.userName,
        userFirstname: user.userFirstname,
        userStatus: user.userStatus,
        dteCreate: user.dteCreate,
        telNumber: user.telNumber,
        role: role,
        hospitalName: user.hospitalName,
        centerName: user.centerCity
      };
    });

    return c.json({
      users: enrichedUsers,
      total: enrichedUsers.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des utilisateurs' });
  }
};

// =============== HISTORIQUES ET STATISTIQUES ===============

export const getDeliveryHistory = async (c: Context) => {
  try {
    const { entityType, entityId, userId, status, limit = 50, offset = 0 } = c.req.query();

    const whereConditions: string[] = [];

    if (entityType === 'hospital' && entityId) {
      whereConditions.push(`d.hospital_id = ${parseInt(entityId)}`);
    } else if (entityType === 'donation_center' && entityId) {
      whereConditions.push(`d.center_id = ${parseInt(entityId)}`);
    }

    if (status) {
      whereConditions.push(`d.delivery_status = '${status.replace(/'/g, "''")}'`);
    }

    if (userId) {
      whereConditions.push(`dp.user_id = ${parseInt(userId)}`);
    }

    // Construire la requête SQL
    let sqlQuery = `
      SELECT 
        d.delivery_id as "deliveryId",
        d.drone_id as "droneId",
        dr.drone_name as "droneName",
        d.blood_id as "bloodId",
        b.blood_type as "bloodType",
        d.hospital_id as "hospitalId",
        h.hospital_name as "hospitalName",
        d.center_id as "centerId",
        dc.center_city as "centerCity",
        d.dte_delivery as "dteDelivery",
        d.dte_validation as "dteValidation",
        d.delivery_status as "deliveryStatus",
        d.delivery_urgent as "deliveryUrgent"
      FROM delivery d
        LEFT JOIN drone dr ON d.drone_id = dr.drone_id
        LEFT JOIN blood b ON d.delivery_id = b.delivery_id
        LEFT JOIN hospital h ON d.hospital_id = h.hospital_id
        LEFT JOIN donationcenter dc ON d.center_id = dc.center_id
    `;

    if (userId) {
      sqlQuery += ` INNER JOIN delivery_participation dp ON d.delivery_id = dp.delivery_id`;
    }

    if (whereConditions.length > 0) {
      sqlQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    sqlQuery += ` ORDER BY d.dte_delivery DESC LIMIT ${parseInt(limit.toString())} OFFSET ${parseInt(offset.toString())}`;

    const history = await db.execute(sql.raw(sqlQuery));

    return c.json({
      deliveries: history.rows,
      total: history.rows.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération de l\'historique' });
  }
};

export const getStatistics = async (c: Context) => {
  try {
    // Stats generales
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalHospitals = await db.select({ count: sql<number>`count(*)` }).from(hospitals);
    const totalCenters = await db.select({ count: sql<number>`count(*)` }).from(donationCenters);
    const totalDeliveries = await db.select({ count: sql<number>`count(*)` }).from(deliveries);
    const totalDrones = await db.select({ count: sql<number>`count(*)` }).from(drones);

    // Stats par statut
    const deliveriesByStatus = await db
      .select({
        status: deliveries.deliveryStatus,
        count: sql<number>`count(*)`,
      })
      .from(deliveries)
      .groupBy(deliveries.deliveryStatus);

    // Livraisons urgentes
    const urgentDeliveries = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliveries)
      .where(eq(deliveries.deliveryUrgent, true));

    return c.json({
      overview: {
        totalUsers: totalUsers[0]?.count || 0,
        totalHospitals: totalHospitals[0]?.count || 0,
        totalCenters: totalCenters[0]?.count || 0,
        totalDeliveries: totalDeliveries[0]?.count || 0,
        totalDrones: totalDrones[0]?.count || 0,
        urgentDeliveries: urgentDeliveries[0]?.count || 0,
      },
      deliveriesByStatus,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des statistiques' });
  }
};

// =============== GESTION DES HÔPITAUX ===============

export const getAllHospitals = async (c: Context) => {
  try {
    const allHospitals = await db
      .select()
      .from(hospitals)
      .orderBy(hospitals.hospitalName);

    console.log('🏥 Hospitals data returned:', JSON.stringify(allHospitals, null, 2));
    return c.json(allHospitals);
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des hôpitaux' });
  }
};

export const getHospitalById = async (c: Context) => {
  try {
    const hospitalId = parseInt(c.req.param('id'));
    
    if (isNaN(hospitalId)) {
      throw new HTTPException(400, { message: 'ID hôpital invalide' });
    }

    const hospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.hospitalId, hospitalId))
      .limit(1);

    if (hospital.length === 0) {
      throw new HTTPException(404, { message: 'Hôpital non trouvé' });
    }

    return c.json(hospital[0]);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la récupération de l\'hôpital:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération de l\'hôpital' });
  }
};

export const createHospital = async (c: Context) => {
  try {
    const {
      hospital_name,
      hospital_city,
      hospital_postal,
      hospital_adress,
      hospital_latitude,
      hospital_longitude
    } = await c.req.json();

    if (!hospital_name || !hospital_adress || !hospital_city || !hospital_postal) {
      throw new HTTPException(400, { 
        message: 'Nom, adresse, ville et code postal sont requis' 
      });
    }

    const newHospital = await db
      .insert(hospitals)
      .values({
        hospitalName: hospital_name,
        hospitalCity: hospital_city,
        hospitalPostal: hospital_postal,
        hospitalAdress: hospital_adress,
        hospitalLatitude: hospital_latitude || null,
        hospitalLongitude: hospital_longitude || null,
      })
      .returning();

    return c.json(newHospital[0], 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la création de l\'hôpital:', error);
    throw new HTTPException(500, { message: 'Échec de la création de l\'hôpital' });
  }
};

export const updateHospital = async (c: Context) => {
  try {
    const hospitalId = parseInt(c.req.param('id'));
    
    if (isNaN(hospitalId)) {
      throw new HTTPException(400, { message: 'ID hôpital invalide' });
    }

    const {
      hospital_name,
      hospital_city,
      hospital_postal,
      hospital_adress,
      hospital_latitude,
      hospital_longitude
    } = await c.req.json();

    const existingHospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.hospitalId, hospitalId))
      .limit(1);
    
    if (existingHospital.length === 0) {
      throw new HTTPException(404, { message: 'Hôpital non trouvé' });
    }

    const updatedFields: any = {};
    if (hospital_name !== undefined) updatedFields.hospitalName = hospital_name;
    if (hospital_city !== undefined) updatedFields.hospitalCity = hospital_city;
    if (hospital_postal !== undefined) updatedFields.hospitalPostal = hospital_postal;
    if (hospital_adress !== undefined) updatedFields.hospitalAdress = hospital_adress;
    if (hospital_latitude !== undefined) updatedFields.hospitalLatitude = hospital_latitude;
    if (hospital_longitude !== undefined) updatedFields.hospitalLongitude = hospital_longitude;

    const updatedHospital = await db
      .update(hospitals)
      .set(updatedFields)
      .where(eq(hospitals.hospitalId, hospitalId))
      .returning();

    return c.json(updatedHospital[0]);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la mise à jour de l\'hôpital:', error);
    throw new HTTPException(500, { message: 'Échec de la mise à jour de l\'hôpital' });
  }
};

export const deleteHospital = async (c: Context) => {
  try {
    const hospitalId = parseInt(c.req.param('id'));
    const { force } = c.req.query();
    
    if (isNaN(hospitalId)) {
      throw new HTTPException(400, { message: 'ID hôpital invalide' });
    }

    const existingHospital = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.hospitalId, hospitalId))
      .limit(1);
    
    if (existingHospital.length === 0) {
      throw new HTTPException(404, { message: 'Hôpital non trouvé' });
    }

    // Vérifier s'il y a des données associées
    const associatedDeliveries = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliveries)
      .where(eq(deliveries.hospitalId, hospitalId));

    const associatedUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(userHospital)
      .where(eq(userHospital.hospitalId, hospitalId));

    const totalAssociated = (associatedDeliveries[0]?.count || 0) + (associatedUsers[0]?.count || 0);

    if (totalAssociated > 0 && force !== 'true') {
      return c.json({
        message: `Impossible de supprimer l'hôpital. ${associatedDeliveries[0]?.count || 0} livraison(s) et ${associatedUsers[0]?.count || 0} utilisateur(s) y sont associé(s).`,
        canForce: true,
        deliveriesCount: associatedDeliveries[0]?.count || 0,
        usersCount: associatedUsers[0]?.count || 0
      }, 400);
    }

    // TOUJOURS dissocier les notifications (obligatoire pour éviter les contraintes)
    await db
      .update(notifications)
      .set({ hospitalId: null })
      .where(eq(notifications.hospitalId, hospitalId));

    // Si force=true, dissocier les livraisons aussi
    if (force === 'true') {
      // Dissocier les livraisons (hospitalId = null)
      await db
        .update(deliveries)
        .set({ hospitalId: null })
        .where(eq(deliveries.hospitalId, hospitalId));
    }

    // TOUJOURS supprimer les associations utilisateur-hôpital
    await db.delete(userHospital).where(eq(userHospital.hospitalId, hospitalId));

    // Supprimer l'hôpital
    await db.delete(hospitals).where(eq(hospitals.hospitalId, hospitalId));

    const forceMessage = force === 'true' && totalAssociated > 0 
      ? ` (${associatedDeliveries[0]?.count || 0} livraison(s) et ${associatedUsers[0]?.count || 0} utilisateur(s) dissocié(s))` 
      : '';

    return c.json({ message: `Hôpital supprimé avec succès${forceMessage}` });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la suppression de l\'hôpital:', error);
    throw new HTTPException(500, { message: 'Échec de la suppression de l\'hôpital' });
  }
};

// =============== GESTION DES CENTRES DE DON ===============

export const getAllCenters = async (c: Context) => {
  try {
    const allCenters = await db
      .select()
      .from(donationCenters)
      .orderBy(donationCenters.centerCity);

    console.log('🏢 Centers data returned:', JSON.stringify(allCenters, null, 2));
    return c.json(allCenters);
  } catch (error) {
    console.error('Erreur lors de la récupération des centres:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des centres' });
  }
};

export const getCenterById = async (c: Context) => {
  try {
    const centerId = parseInt(c.req.param('id'));
    
    if (isNaN(centerId)) {
      throw new HTTPException(400, { message: 'ID centre invalide' });
    }

    const center = await db
      .select()
      .from(donationCenters)
      .where(eq(donationCenters.centerId, centerId))
      .limit(1);

    if (center.length === 0) {
      throw new HTTPException(404, { message: 'Centre non trouvé' });
    }

    return c.json(center[0]);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la récupération du centre:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération du centre' });
  }
};

export const createCenter = async (c: Context) => {
  try {
    const {
      center_city,
      center_postal,
      center_adress,
      center_latitude,
      center_longitude
    } = await c.req.json();

    if (!center_city || !center_adress || !center_postal) {
      throw new HTTPException(400, { 
        message: 'Nom, adresse et code postal sont requis' 
      });
    }

    const newCenter = await db
      .insert(donationCenters)
      .values({
        centerCity: center_city,
        centerPostal: center_postal,
        centerAdress: center_adress,
        centerLatitude: center_latitude || null,
        centerLongitude: center_longitude || null,
      })
      .returning();

    return c.json(newCenter[0], 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la création du centre:', error);
    throw new HTTPException(500, { message: 'Échec de la création du centre' });
  }
};

export const updateCenter = async (c: Context) => {
  try {
    const centerId = parseInt(c.req.param('id'));
    
    if (isNaN(centerId)) {
      throw new HTTPException(400, { message: 'ID centre invalide' });
    }

    const {
      center_city,
      center_postal,
      center_adress,
      center_latitude,
      center_longitude
    } = await c.req.json();

    const existingCenter = await db
      .select()
      .from(donationCenters)
      .where(eq(donationCenters.centerId, centerId))
      .limit(1);
    
    if (existingCenter.length === 0) {
      throw new HTTPException(404, { message: 'Centre non trouvé' });
    }

    const updatedFields: any = {};
    if (center_city !== undefined) updatedFields.centerCity = center_city;
    if (center_postal !== undefined) updatedFields.centerPostal = center_postal;
    if (center_adress !== undefined) updatedFields.centerAdress = center_adress;
    if (center_latitude !== undefined) updatedFields.centerLatitude = center_latitude;
    if (center_longitude !== undefined) updatedFields.centerLongitude = center_longitude;

    const updatedCenter = await db
      .update(donationCenters)
      .set(updatedFields)
      .where(eq(donationCenters.centerId, centerId))
      .returning();

    return c.json(updatedCenter[0]);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la mise à jour du centre:', error);
    throw new HTTPException(500, { message: 'Échec de la mise à jour du centre' });
  }
};

export const deleteCenter = async (c: Context) => {
  try {
    const centerId = parseInt(c.req.param('id'));
    const { force } = c.req.query();
    
    if (isNaN(centerId)) {
      throw new HTTPException(400, { message: 'ID centre invalide' });
    }

    const existingCenter = await db
      .select()
      .from(donationCenters)
      .where(eq(donationCenters.centerId, centerId))
      .limit(1);
    
    if (existingCenter.length === 0) {
      throw new HTTPException(404, { message: 'Centre non trouvé' });
    }

    // Vérifier s'il y a des livraisons associées
    const associatedDeliveries = await db
      .select({ count: sql<number>`count(*)` })
      .from(deliveries)
      .where(eq(deliveries.centerId, centerId));

    // Vérifier s'il y a des drones associés
    const associatedDrones = await db
      .select({ count: sql<number>`count(*)` })
      .from(drones)
      .where(eq(drones.centerId, centerId));

    // Vérifier s'il y a des utilisateurs associés
    const associatedUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(userDonationCenter)
      .where(eq(userDonationCenter.centerId, centerId));

    const totalRelated = (associatedDeliveries[0]?.count || 0) + (associatedDrones[0]?.count || 0) + (associatedUsers[0]?.count || 0);

    if (totalRelated > 0 && force !== 'true') {
      const details = [];
      if (associatedDeliveries[0]?.count > 0) {
        details.push(`${associatedDeliveries[0].count} livraison(s)`);
      }
      if (associatedDrones[0]?.count > 0) {
        details.push(`${associatedDrones[0].count} drone(s)`);
      }
      if (associatedUsers[0]?.count > 0) {
        details.push(`${associatedUsers[0].count} utilisateur(s)`);
      }
      
      return c.json({
        message: `Impossible de supprimer le centre. ${details.join(', ')} y sont associé(s).`,
        canForce: true,
        relatedCount: totalRelated,
        deliveries: associatedDeliveries[0]?.count || 0,
        drones: associatedDrones[0]?.count || 0,
        users: associatedUsers[0]?.count || 0
      }, 400);
    }

    // Si force=true, mettre à NULL les références
    if (force === 'true') {
      if (associatedDeliveries[0]?.count > 0) {
        await db
          .update(deliveries)
          .set({ centerId: null })
          .where(eq(deliveries.centerId, centerId));
      }
      
      if (associatedDrones[0]?.count > 0) {
        await db
          .update(drones)
          .set({ centerId: null })
          .where(eq(drones.centerId, centerId));
      }
    }

    // TOUJOURS dissocier les notifications (obligatoire pour éviter les contraintes)
    await db
      .update(notifications)
      .set({ centerId: null })
      .where(eq(notifications.centerId, centerId));

    // Supprimer les associations utilisateur-centre
    await db.delete(userDonationCenter).where(eq(userDonationCenter.centerId, centerId));

    // Supprimer le centre
    await db.delete(donationCenters).where(eq(donationCenters.centerId, centerId));

    let forceMessage = '';
    if (force === 'true' && totalRelated > 0) {
      const details = [];
      if (associatedDeliveries[0]?.count > 0) {
        details.push(`${associatedDeliveries[0].count} livraison(s)`);
      }
      if (associatedDrones[0]?.count > 0) {
        details.push(`${associatedDrones[0].count} drone(s)`);
      }
      if (associatedUsers[0]?.count > 0) {
        details.push(`${associatedUsers[0].count} utilisateur(s)`);
      }
      forceMessage = ` (${details.join(', ')} dissocié(s))`;
    }

    return c.json({ message: `Centre supprimé avec succès${forceMessage}` });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la suppression du centre:', error);
    throw new HTTPException(500, { message: 'Échec de la suppression du centre' });
  }
};

// =============== GESTION DES UTILISATEURS (UPDATE/DELETE) ===============

export const updateUser = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    
    if (isNaN(userId)) {
      throw new HTTPException(400, { message: 'ID utilisateur invalide' });
    }

    const {
      userFirstname,
      userName,
      email,
      userStatus,
      role
    } = await c.req.json();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (existingUser.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
    }

    const updatedUser = await db
      .update(users)
      .set({
        userFirstname: userFirstname || existingUser[0].userFirstname,
        userName: userName || existingUser[0].userName,
        email: email || existingUser[0].email,
        userStatus: userStatus || existingUser[0].userStatus,
      })
      .where(eq(users.userId, userId))
      .returning();

    return c.json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser[0]
    });

  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw new HTTPException(500, { message: 'Échec de la mise à jour de l\'utilisateur' });
  }
};

export const deleteUser = async (c: Context) => {
  try {
    const userId = parseInt(c.req.param('id'));
    
    if (isNaN(userId)) {
      throw new HTTPException(400, { message: 'ID utilisateur invalide' });
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (existingUser.length === 0) {
      throw new HTTPException(404, { message: 'Utilisateur non trouvé' });
    }
    if (existingUser[0].email === 'admin@bloodsky.fr') {
      throw new HTTPException(403, { message: 'Impossible de supprimer le super administrateur principal' });
    }
    // Supprimer les associations de rôles d'abord (ignorer les erreurs si les enregistrements n'existent pas)
    try {
      await db.delete(userHospital).where(eq(userHospital.userId, userId));
    } catch (e) {
      console.log('Aucun enregistrement userHospital à supprimer pour userId:', userId);
    }
    
    try {
      await db.delete(userDonationCenter).where(eq(userDonationCenter.userId, userId));
    } catch (e) {
      console.log('Aucun enregistrement userDonationCenter à supprimer pour userId:', userId);
    }
    
    try {
      await db.delete(userDronists).where(eq(userDronists.userId, userId));
    } catch (e) {
      console.log('Aucun enregistrement userDronists à supprimer pour userId:', userId);
    }

    // Supprimer l'utilisateur principal
    await db.delete(users).where(eq(users.userId, userId));

    return c.json({
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw new HTTPException(500, { message: 'Échec de la suppression de l\'utilisateur' });
  }
};

export const superAdminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAllUsers,
  updateUser,
  deleteUser,
  getDeliveryHistory,
  getStatistics,
  getAllHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getAllCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
};