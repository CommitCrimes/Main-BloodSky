import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { deliveries } from './delivery';

export const bloods = pgTable('BLOOD', {
  bloodId: varchar('blood_id').primaryKey(),
  bloodType: varchar('blood_type'),
  deliveryId: varchar('delivery_id').references(() => deliveries.deliveryId),
});