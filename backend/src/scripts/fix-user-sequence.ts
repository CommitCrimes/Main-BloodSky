import { db } from '../utils/db';
import { sql } from 'drizzle-orm';

async function fixUserSequence() {
  try {
    const result = await db.execute(sql`SELECT MAX(user_id) as max_id FROM users`);
    const maxId = result.rows[0]?.max_id || 0;
    
    await db.execute(sql`SELECT setval('users_user_id_seq', ${maxId}, true)`);
    
    const checkResult = await db.execute<{ next_val: number }>(sql`SELECT nextval('users_user_id_seq') as next_val`);
    const nextVal = checkResult.rows[0]?.next_val ?? 0;
    
    await db.execute(sql`SELECT setval('users_user_id_seq', ${nextVal - 1}, true)`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreurrrrrr:', error);
    process.exit(1);
  }
}

fixUserSequence();