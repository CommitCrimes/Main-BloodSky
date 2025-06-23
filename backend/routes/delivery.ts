/*
Table DELIVERY {
  delivery_id varchar [primary key]
  drone_id varchar [ref: > DRONE.drone_id]
  blood_id varchar [ref: - BLOOD.blood_id]
  hospital_id varchar [ref: > HOSPITAL.hospital_id]
  center_id varchar [ref: > DONATIONCENTER.center_id]
  dte_delivery timestamp
  dte_validation timestamp
  delivery_status text
  delivery_urgent binary
}
*/

import { Router } from 'express';
import { db } from '../db';
import { delivery } from '../schema/delivery';

export const deliveryRouter = Router();

// GET all
deliveryRouter.get('/', async (_req, res) => {
  const result = await db.select().from(delivery);
  res.json(result);
});

// GET by ID
deliveryRouter.get('/:id', async (req, res) => {
  const result = await db.select().from(delivery).where(delivery.delivery_id.eq(req.params.id));
  if (result.length === 0) return res.status(404).send('Not found');
  res.json(result[0]);
});

// GET by drone ID
deliveryRouter.get('/drone/:droneId', async (req, res) => {
  const result = await db.select().from(delivery).where(delivery.drone_id.eq(req.params.droneId));
  if (result.length === 0) return res.status(404).send('Not found');
  res.json(result);
});

// GET by blood ID
deliveryRouter.get('/blood/:bloodId', async (req, res) => {
  const result = await db.select().from(delivery).where(delivery.blood_id.eq(req.params.bloodId));
  if (result.length === 0) return res.status(404).send('Not found');
  res.json(result);
});

// GET by hospital ID
deliveryRouter.get('/hospital/:hospitalId', async (req, res) => {
  const result = await db.select().from(delivery).where(delivery.hospital_id.eq(req.params.hospitalId));
  if (result.length === 0) return res.status(404).send('Not found');
  res.json(result);
});

// GET by center ID
deliveryRouter.get('/center/:centerId', async (req, res) => {
  const result = await db.select().from(delivery).where(delivery.center_id.eq(req.params.centerId));
  if (result.length === 0) return res.status(404).send('Not found');
  res.json(result);
});

// POST create
deliveryRouter.post('/', async (req, res) => {
  await db.insert(delivery).values(req.body);
  res.status(201).send('Created');
});

// PUT update
deliveryRouter.put('/:id', async (req, res) => {
  await db.update(delivery)
    .set(req.body)
    .where(delivery.delivery_id.eq(req.params.id));
  res.send('Updated');
});

// DELETE
deliveryRouter.delete('/:id', async (req, res) => {
  await db.delete(delivery).where(delivery.delivery_id.eq(req.params.id));
  res.send('Deleted');
});
