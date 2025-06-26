import { pgTable, varchar, timestamp, integer, text, boolean, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userId: serial('user_id').primaryKey(),
  email: varchar('email').notNull(),
  password: varchar('password').notNull(),
  userName: varchar('user_name'),
  userFirstname: varchar('user_firstname'),
  dteCreate: timestamp('dte_create').defaultNow(),
<<<<<<< 4-créer-les-routes-crud-de-la-table-user
  telNumber: varchar('tel_number'),
  userStatus: text('user_status'), // suspended or active
=======
  telNumber: integer('tel_number'),
  userStatus: text('user_status'), // suspended, active, pending
  tempPasswordToken: varchar('temp_password_token'),
  tempPasswordExpires: timestamp('temp_password_expires'),
  urlUsed: boolean('url_used').default(false),
  resetPasswordToken: varchar('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
>>>>>>> All-crud
});