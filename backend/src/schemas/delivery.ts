import { pgTable, timestamp, text, boolean, integer, serial } from 'drizzle-orm/pg-core';
import { drones } from './drone';
import { hospitals } from './hospital';
import { donationCenters } from './donation_center';

export const deliveries = pgTable('delivery', {
  deliveryId: serial('delivery_id').primaryKey(),
  droneId: integer('drone_id').references(() => drones.droneId),
  bloodId: integer('blood_id'),
  hospitalId: integer('hospital_id').references(() => hospitals.hospitalId),
  centerId: integer('center_id').references(() => donationCenters.centerId),
  dteDelivery: timestamp('dte_delivery'),
  dteValidation: timestamp('dte_validation'),
  deliveryStatus: text('delivery_status'),
  deliveryUrgent: boolean('delivery_urgent'),
});