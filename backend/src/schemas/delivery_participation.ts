import { pgTable, primaryKey, integer } from 'drizzle-orm/pg-core';
import { deliveries } from './delivery';
import { users } from './user';

export const deliveryParticipations = pgTable('delivery_participation', {
  deliveryId: integer('delivery_id').references(() => deliveries.deliveryId),
  userId: integer('user_id').references(() => users.userId),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.deliveryId, table.userId] }),
  };
});