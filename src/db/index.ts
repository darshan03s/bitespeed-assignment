import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool);

export const checkDbConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed', error);
  }
};

export default db;
