import { pgTable, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core';
import { drones } from './drone';
import { hospitals } from './hospital';
import { donationCenters } from './donation_center';

export const deliveries = pgTable('DELIVERY', {
  deliveryId: varchar('delivery_id').primaryKey(),
  droneId: varchar('drone_id').references(() => drones.droneId),
  bloodId: varchar('blood_id'),
  hospitalId: varchar('hospital_id').references(() => hospitals.hospitalId),
  centerId: varchar('center_id').references(() => donationCenters.centerId),
  dteDelivery: timestamp('dte_delivery'),
  dteValidation: timestamp('dte_validation'),
  deliveryStatus: text('delivery_status'),
  deliveryUrgent: boolean('delivery_urgent'),
});