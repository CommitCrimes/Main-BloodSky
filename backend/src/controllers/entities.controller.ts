import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { donationCenters, hospitals, userHospital , userDonationCenter , deliveries , users} from '../schemas';
import { eq } from 'drizzle-orm';

//-----------------------------------------Location-----------------------------------------
export const getDonationCenters = async (c: Context) => {
  try {
    const centers = await db.select().from(donationCenters);
    return c.json(centers);
  } catch (error) {
    console.error('Erreur lors de la récupération des centres de donation:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des centres de donation' });
  }
};

export const getHospitals = async (c: Context) => {
  try {
    const hospitalsData = await db.select().from(hospitals);
    return c.json(hospitalsData);
  } catch (error) {
    console.error('Erreur lors de la récupération des hôpitaux:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des hôpitaux'});
  }
};

//---------------------------------Users------------------------------------
export const getUsersHospital = async (c: Context) => {
  try {
    const usersHospitalData = await db.select().from(userHospital);
    return c.json(usersHospitalData);
  } catch (error) {
    console.error('Erreur lors de la récupération des users de hôpital:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des user de hôpital' });
  }
};

export const getUsersDonationCenter = async (c: Context) => {
  try {
    const usersDonationCenterData = await db.select({userDonationCenter: userDonationCenter,
    user: users} ).from(userDonationCenter).leftJoin(users, eq(userDonationCenter.userId, users.userId) );
    return c.json(usersDonationCenterData);
  } catch (error) {
    console.error('Erreur lors de la récupération des users du centre de donation:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des user du centre de donnation' });
  }
};

//---------------------------------Livraisons------------------------------------

export const getDelivery = async (c: Context) => {
  try {
    const deliveryData = await db.select().from(deliveries);
    return c.json(deliveryData);
  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des livraisons' });
  }
};
export const editDelivery = async (c: Context) => {
  try {
    const deliveryData = await db.update(users).set({}).where(eq(users.userId, ID));
    return c.json(deliveryData);
  } catch (error) {
    console.error('Erreur lors de la récupération des livraisons:', error);
    throw new HTTPException(500, { message: 'Échec de la récupération des livraisons' });
  }
};


export const entitiesController = {
  getDonationCenters,
  getHospitals,
  getUsersHospital,
  getUsersDonationCenter,
  getDelivery,
};