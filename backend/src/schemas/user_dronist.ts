import { pgTable, varchar, primaryKey, integer } from 'drizzle-orm/pg-core';
import { users } from './user';

export const userDronists = pgTable('user_dronist', {
  userId: integer('user_id').references(() => users.userId),
  info: varchar('info'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId] }),
  };
});