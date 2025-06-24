import { pgTable, integer, boolean, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user';
import { hospitals } from './hospital';

export const userHospitals = pgTable('user_hospital', {
  userId: varchar('user_id').references(() => users.userId),
  hospitalId: integer('hospital_id').references(() => hospitals.hospitalId),
  admin: boolean('admin'),
  info: varchar('info'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});