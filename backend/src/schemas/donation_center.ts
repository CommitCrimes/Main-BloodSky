import { pgTable, varchar, integer, decimal } from 'drizzle-orm/pg-core';

export const donationCenters = pgTable('donationcenter', {
  centerId: integer('center_id').primaryKey(),
  centerCity: varchar('center_city'),
  centerPostal: integer('center_postal'),
  centerAdress: varchar('center_adress'),
  centerLatitude: decimal('center_latitude', { precision: 15, scale: 10 }),
  centerLongitude: decimal('center_longitude', { precision: 15, scale: 10 }),
});