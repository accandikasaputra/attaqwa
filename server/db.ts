import 'dotenv/config'; 
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please check your .env file",
  );
}

// Create MySQL connection pool
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

// Create drizzle instance with MySQL
export const db = drizzle(poolConnection, { schema, mode: 'default' });
