import { pgTable, varchar, integer, decimal, serial } from 'drizzle-orm/pg-core';

export const hospitals = pgTable('hospital', {
  hospitalId: serial('hospital_id').primaryKey(),
  hospitalName: varchar('hospital_name'),
  hospitalCity: varchar('hospital_city'),
  hospitalPostal: integer('hospital_postal'),
  hospitalAdress: varchar('hospital_adress'),
  hospitalLatitude: decimal('hospital_latitude', { precision: 15, scale: 10 }),
  hospitalLongitude: decimal('hospital_longitude', { precision: 15, scale: 10 }),
});