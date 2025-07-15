import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '../utils/db';
import { donationCenters, hospitals } from '../schemas';

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
    throw new HTTPException(500, { message: 'Échec de la récupération des hôpitaux' });
  }
};

export const entitiesController = {
  getDonationCenters,
  getHospitals,
};