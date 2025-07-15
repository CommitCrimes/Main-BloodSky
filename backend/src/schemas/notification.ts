import { pgTable, varchar, timestamp, text, boolean, integer, serial } from 'drizzle-orm/pg-core';
import { users } from './user';
import { hospitals } from './hospital';
import { donationCenters } from './donation_center';
import { deliveries } from './delivery';

export const notifications = pgTable('notification', {
  notificationId: serial('notification_id').primaryKey(),
  userId: integer('user_id').references(() => users.userId),
  hospitalId: integer('hospital_id').references(() => hospitals.hospitalId),
  centerId: integer('center_id').references(() => donationCenters.centerId),
  type: varchar('type', { length: 50 }).notNull(), // 'delivery_request', 'delivery_status', 'stock_alert', etc.
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
  isRead: boolean('is_read').default(false),
  deliveryId: integer('delivery_id'),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;