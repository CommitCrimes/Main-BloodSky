import { pgTable, varchar, integer, serial } from 'drizzle-orm/pg-core';
import { deliveries } from './delivery';

export const bloods = pgTable('blood', {
  bloodId: serial('blood_id').primaryKey(),
  bloodType: varchar('blood_type'),
  deliveryId: integer('delivery_id').references(() => deliveries.deliveryId),
});