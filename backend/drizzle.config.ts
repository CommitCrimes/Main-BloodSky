import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

dotenv.config();

const config = parse(process.env.DATABASE_URL as string);

export default defineConfig({
  schema: './src/schemas/*',
  dialect: 'postgresql',
  dbCredentials: {
    host: config.host ?? 'localhost',
    port: config.port ? Number(config.port) : 5432,
    user: config.user ?? 'postgres',
    password: config.password ?? '',
    database: config.database ?? 'postgres',
    ssl: true,
  },
  verbose: true,
  strict: true,
});