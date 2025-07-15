import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('Tentative de connexion à:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('error', (err) => {
  console.error('Erreur de pool PostgreSQL inattendue:', err);
});

export const db = drizzle(pool);