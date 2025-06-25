import { Hono } from 'hono';
import { deliveries } from '../schemas/delivery';
import { db } from '../utils/db';
import { eq } from 'drizzle-orm';

export const deliveryRouter = new Hono();

// GET all deliveries
deliveryRouter.get('/', async (c) => {
  const data = await db.select().from(deliveries);
  return c.json(data);
});

// GET by delivery ID
deliveryRouter.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  const data = await db.select().from(deliveries).where(eq(deliveries.deliveryId, id));
  if (data.length === 0) return c.notFound();
  return c.json(data[0]);
});

// GET by drone ID
deliveryRouter.get('/drone/:droneId', async (c) => {
  const droneId = Number(c.req.param('droneId'));
  if (isNaN(droneId)) return c.text('Invalid drone ID', 400);
  const data = await db.select().from(deliveries).where(eq(deliveries.droneId, droneId));
  if (data.length === 0) return c.notFound();
  return c.json(data);
});

// POST create delivery
deliveryRouter.post('/', async (c) => {
  const body = await c.req.json();
  await db.insert(deliveries).values(body);
  return c.text('Created', 201);
});

// PUT update delivery
deliveryRouter.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  const body = await c.req.json();
  await db.update(deliveries).set(body).where(eq(deliveries.deliveryId, id));
  return c.text('Updated');
});

// DELETE delivery
deliveryRouter.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.text('Invalid ID', 400);
  await db.delete(deliveries).where(eq(deliveries.deliveryId, id));
  return c.text('Deleted');
});
