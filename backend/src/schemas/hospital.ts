import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';

export const hospitals = pgTable('HOSPITAL', {
  hospitalId: varchar('hospital_id').primaryKey(),
  hospitalName: varchar('hospital_name'),
  hospitalCity: varchar('hospital_city'),
  hospitalPostal: integer('hospital_postal'),
  hospitalAdress: varchar('hospital_adress'),
  hospitalLatitude: integer('hospital_latitude'),
  hospitalLongitude: integer('hospital_longtitude'),
});