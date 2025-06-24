import { pgTable, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userId: integer('user_id').primaryKey(),
  email: varchar('email').notNull(),
  password: varchar('password').notNull(),
  userName: varchar('user_name'),
  userFirstname: varchar('user_firstname'),
  dteCreate: timestamp('dte_create').defaultNow(),
  telNumber: integer('tel_number'),
  userStatus: text('user_status'), // suspended or active
});