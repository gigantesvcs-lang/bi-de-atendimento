import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.CHATWOOT_DATABASE_URL,
});

export async function queryChatwoot<T>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
