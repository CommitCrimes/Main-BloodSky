import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import { deliveries } from './delivery';

export const bloods = pgTable('blood', {
  bloodId: integer('blood_id').primaryKey(),
  bloodType: varchar('blood_type'),
  deliveryId: integer('delivery_id').references(() => deliveries.deliveryId),
});