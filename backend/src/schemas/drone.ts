import { pgTable, varchar, integer, text, decimal, boolean, timestamp } from 'drizzle-orm/pg-core';
import { donationCenters } from './donation_center';

export const drones = pgTable('drone', {
  droneId: integer('drone_id').primaryKey(),
  droneName: varchar('drone_name'),
  centerId: integer('center_id').references(() => donationCenters.centerId),
  droneStatus: text('drone_status'),
  droneCurrentLat: decimal('drone_current_lat', { precision: 10, scale: 8 }),
  droneCurrentLong: decimal('drone_current_long', { precision: 11, scale: 8 }),
  droneBattery: text('drone_battery'),
  droneImage: varchar('drone_image'),
  droneApiUrl: varchar('drone_api_url'),
  droneApiId: integer('drone_api_id'),
  altitudeM: decimal('altitude_m', { precision: 8, scale: 2 }),
  horizontalSpeedMS: decimal('horizontal_speed_m_s', { precision: 6, scale: 2 }),
  verticalSpeedMS: decimal('vertical_speed_m_s', { precision: 6, scale: 2 }),
  headingDeg: decimal('heading_deg', { precision: 5, scale: 2 }),
  flightMode: varchar('flight_mode', { length: 50 }),
  isArmed: boolean('is_armed').default(false),
  missionStatus: varchar('mission_status', { length: 50 }),
  currentMissionId: integer('current_mission_id'),
  lastSyncAt: timestamp('last_sync_at'),
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});