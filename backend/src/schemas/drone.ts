import { pgTable, varchar, integer, text } from 'drizzle-orm/pg-core';
import { donationCenters } from './donation_center';

export const drones = pgTable('DRONE', {
  droneId: varchar('drone_id').primaryKey(),
  droneName: varchar('drone_name'),
  centerId: varchar('center_id').references(() => donationCenters.centerId),
  droneStatus: text('drone_status'),
  droneCurrentLat: integer('drone_current_lat'),
  droneCurrentLong: integer('drone_current_long'),
  droneBattery: text('drone_battery'),
  droneImage: varchar('drone_image'),
});