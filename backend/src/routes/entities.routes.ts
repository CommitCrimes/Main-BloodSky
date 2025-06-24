import { Hono } from 'hono';
import { entitiesController } from '../controllers/entities.controller';

export const entitiesRouter = new Hono();

// Routes pour les entités
entitiesRouter.get('/donation-centers', entitiesController.getDonationCenters);
entitiesRouter.get('/hospitals', entitiesController.getHospitals);