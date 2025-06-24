import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';

export const donationCenters = pgTable('DONATIONCENTER', {
  centerId: varchar('center_id').primaryKey(),
  centerCity: varchar('center_city'),
  centerPostal: integer('center_postal'),
  centerAdress: varchar('center_adress'),
  centerLatitude: integer('center_latitude'),
  centerLongitude: integer('center_longitude'),
});