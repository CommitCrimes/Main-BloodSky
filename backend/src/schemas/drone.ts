import { pgTable, varchar, integer, text, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';
import { donationCenters } from './donation_center';

export const drones = pgTable('drone', {
  droneId: integer('drone_id').primaryKey(),
  droneName: varchar('drone_name'),
  centerId: integer('center_id').references(() => donationCenters.centerId),
  droneStatus: varchar('drone_status'),
  droneImage: varchar('drone_image'),
});