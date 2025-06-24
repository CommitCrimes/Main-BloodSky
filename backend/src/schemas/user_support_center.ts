import { pgTable, varchar, primaryKey, integer } from 'drizzle-orm/pg-core';
import { users } from './user';

export const userSupportCenters = pgTable('user_support_relationship_center', {
  userId: integer('user_id').references(() => users.userId),
  info: varchar('info'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});