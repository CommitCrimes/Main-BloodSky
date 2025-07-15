import { Hono } from 'hono';
import { drones } from '../schemas/drone';
import { db } from '../utils/db';
import { eq } from 'drizzle-orm';
import { DroneUpdate, DroneMission, DroneWaypoint } from '../types/drone.types';
import { droneControlService } from '../services/drone-control.service';
import { droneSyncService } from '../services/drone-sync.service';
import { deliveries } from '../schemas/delivery';
import { hospitals } from '../schemas/hospital';
import { donationCenters } from '../schemas/donation_center';

export const droneRouter = new Hono();

// GET all drones
droneRouter.get('/', async (c) => {
  const data = await db.select().from(drones);
  return c.json(data);
});

// GET /drones/status - Get all drones status
droneRouter.get('/status', async (c) => {
  const status = await droneSyncService.getDronesStatus();
  return c.json(status);
});

// GET /drones/history - Get drones history with deliveries
droneRouter.get('/history', async (c) => {
  try {
    const dronesHistory = await db
      .select({
        droneId: drones.droneId,
        droneName: drones.droneName,
        droneBattery: drones.droneBattery,
        droneStatus: drones.droneStatus,
        missionStatus: drones.missionStatus,
        flightMode: drones.flightMode,
        isArmed: drones.isArmed,
        createdAt: drones.createdAt,
        lastSyncAt: drones.lastSyncAt,
        // Delivery info
        deliveryId: deliveries.deliveryId,
        deliveryStatus: deliveries.deliveryStatus,
        deliveryUrgent: deliveries.deliveryUrgent,
        dteDelivery: deliveries.dteDelivery,
        dteValidation: deliveries.dteValidation,
        // Hospital info
        hospitalName: hospitals.hospitalName,
        hospitalCity: hospitals.hospitalCity,
        // Center info
        centerCity: donationCenters.centerCity,
      })
      .from(drones)
      .leftJoin(deliveries, eq(drones.droneId, deliveries.droneId))
      .leftJoin(hospitals, eq(deliveries.hospitalId, hospitals.hospitalId))
      .leftJoin(donationCenters, eq(drones.centerId, donationCenters.centerId))
      .orderBy(drones.droneId, deliveries.dteDelivery);

    return c.json(dronesHistory);
  } catch (error) {
    console.error('Error fetching drones history:', error);
    return c.json({ error: 'Failed to fetch drones history' }, 500);
  }
});

// GET by center ID
droneRouter.get('/center/:centerId', async (c) => {
  const centerId = Number(c.req.param('centerId'));
  if (isNaN(centerId)) return c.text('Invalid center ID', 400);
  const data = await db.select().from(drones).where(eq(drones.centerId, centerId));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// GET /drones/:id/flight_info - Get real-time flight info
droneRouter.get('/:id/flight_info', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  
  const result = await droneControlService.getFlightInfo(id);
  
  if (result.error) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json(result.data);
});

// POST /drones/:id/sync - Force sync drone
droneRouter.post('/:id/sync', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  
  const success = await droneSyncService.forceSyncDrone(id);
  
  if (!success) {
    return c.json({ error: 'Failed to sync drone' }, 400);
  }
  
  return c.json({ message: 'Drone synced successfully' });
});

// GET by drone ID
droneRouter.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  const data = await db.select().from(drones).where(eq(drones.droneId, id));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// POST create drone
droneRouter.post('/', async (c) => {
  const body = await c.req.json();
  await db.insert(drones).values(body);
  return c.text('Created', 201);
});

// PUT update drone
droneRouter.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  const body: DroneUpdate = await c.req.json();
  
  // Add updated timestamp and convert decimal fields to strings
  const updateData: any = {
    ...body,
    updatedAt: new Date()
  };
  
  // Convert decimal fields to strings if present
  if (updateData.droneCurrentLat !== undefined) updateData.droneCurrentLat = String(updateData.droneCurrentLat);
  if (updateData.droneCurrentLong !== undefined) updateData.droneCurrentLong = String(updateData.droneCurrentLong);
  if (updateData.altitudeM !== undefined) updateData.altitudeM = String(updateData.altitudeM);
  if (updateData.horizontalSpeedMS !== undefined) updateData.horizontalSpeedMS = String(updateData.horizontalSpeedMS);
  if (updateData.verticalSpeedMS !== undefined) updateData.verticalSpeedMS = String(updateData.verticalSpeedMS);
  if (updateData.headingDeg !== undefined) updateData.headingDeg = String(updateData.headingDeg);
  
  await db.update(drones).set(updateData).where(eq(drones.droneId, id));
  return c.text('Updated');
});

// DELETE drone
droneRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  await db.delete(drones).where(eq(drones.droneId, id));
  return c.text('Deleted');
});

// === DRONE CONTROL ENDPOINTS ===

// POST /drones/:id/mission/create - Create a mission
droneRouter.post('/:id/mission/create', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  
  const mission: DroneMission = await c.req.json();
  const result = await droneControlService.createMission(id, mission);
  
  if (result.error) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json(result);
});

// POST /drones/:id/mission/start - Start mission
droneRouter.post('/:id/mission/start', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  
  const result = await droneControlService.startMission(id);
  
  if (result.error) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json(result);
});

// POST /drones/:id/return-home - Return to home
droneRouter.post('/:id/return-home', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  
  const result = await droneControlService.returnToHome(id);
  
  if (result.error) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json(result);
});

// POST /drones/:id/mission/modify - Modify mission
droneRouter.post('/:id/mission/modify', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  
  const { filename, seq, updates } = await c.req.json();
  const result = await droneControlService.modifyMission(id, filename, seq, updates);
  
  if (result.error) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json(result);
});

// POST /drones/:id/delivery-mission - Create delivery mission
droneRouter.post('/:id/delivery-mission', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  
  const { pickupLat, pickupLon, deliveryLat, deliveryLon, altitude } = await c.req.json();
  
  if (!pickupLat || !pickupLon || !deliveryLat || !deliveryLon) {
    return c.json({ error: 'Missing required coordinates' }, 400);
  }
  
  const result = await droneControlService.createDeliveryMission(
    id, pickupLat, pickupLon, deliveryLat, deliveryLon, altitude
  );
  
  if (result.error) {
    return c.json({ error: result.error }, 400);
  }
  
  return c.json(result);
});

