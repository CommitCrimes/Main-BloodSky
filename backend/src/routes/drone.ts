import { Hono } from 'hono';
import { drones } from '../schemas/drone';
import { db } from '../utils/db';
import { eq } from 'drizzle-orm';

export const droneRouter = new Hono();

// GET all drones
droneRouter.get('/', async (c) => {
  const data = await db.select().from(drones);
  return c.json(data);
});

// GET by drone ID
droneRouter.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  const data = await db.select().from(drones).where(eq(drones.droneId, id));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// GET by center ID
droneRouter.get('/center/:centerId', async (c) => {
  const centerId = Number(c.req.param('centerId'));
  if (isNaN(centerId)) return c.text('Invalid center ID', 400);
  const data = await db.select().from(drones).where(eq(drones.centerId, centerId));
  if (data.length === 0) return c.notFound();
  return c.json(data);
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
  const body = await c.req.json();
  await db.update(drones).set(body).where(eq(drones.droneId, id));
  return c.text('Updated');
});

// DELETE drone
droneRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  await db.delete(drones).where(eq(drones.droneId, id));
  return c.text('Deleted');
});