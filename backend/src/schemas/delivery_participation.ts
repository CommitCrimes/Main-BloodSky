import { pgTable, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { deliveries } from './delivery';
import { users } from './user';

export const deliveryParticipations = pgTable('DELIVERY_PARTICIPATION', {
  deliveryId: varchar('delivery_id').references(() => deliveries.deliveryId),
  userId: varchar('user_id').references(() => users.userId),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.deliveryId, table.userId] }),
  };
});