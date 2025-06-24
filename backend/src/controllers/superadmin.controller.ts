import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { users, userDonationCenter, userHospital, userDronists, userSupportCenters, deliveries, drones, hospitals, donationCenters, deliveryParticipations } from '../schemas';
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
    const allUsers = await db
      .select({
        userId: users.userId,
        email: users.email,
        userName: users.userName,
        userFirstname: users.userFirstname,
        userStatus: users.userStatus,
        dteCreate: users.dteCreate,
        telNumber: users.telNumber,
      })
      .from(users)
      .orderBy(desc(users.dteCreate));

    return c.json({
      users: allUsers,
      total: allUsers.length,
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
        LEFT JOIN blood b ON d.blood_id = b.blood_id
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

export const superAdminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  getAllUsers,
  getDeliveryHistory,
  getStatistics,
};