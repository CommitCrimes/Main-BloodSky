import { pgTable, integer, boolean, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './user';
import { donationCenters } from './donation_center';

export const userDonationCenters = pgTable('user_donation_center', {
  userId: varchar('user_id').references(() => users.userId),
  centerId: integer('center_id').references(() => donationCenters.centerId),
  admin: boolean('admin'),
  info: varchar('info'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});