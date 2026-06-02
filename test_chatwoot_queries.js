// no-op

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CHATWOOT_DATABASE_URL,
});

async function test() {
  const queries = [
    `SELECT id, name FROM teams ORDER BY name ASC;`,
    `SELECT COUNT(*) as count FROM conversations c WHERE c.status = 0 AND c.assignee_id IS NOT NULL;`,
    `SELECT AVG(EXTRACT(EPOCH FROM (c.first_reply_created_at - c.created_at)) / 60) as avg_minutes FROM conversations c WHERE c.first_reply_created_at IS NOT NULL;`,
    `SELECT COUNT(*) as count FROM conversations c WHERE c.status = 1;`,
    `SELECT AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) / 60) as avg_minutes FROM conversations c WHERE c.status = 1;`,
    `SELECT u.name, COUNT(c.id) as total FROM conversations c JOIN users u ON c.assignee_id = u.id WHERE c.status = 1 GROUP BY u.name ORDER BY total DESC;`,
    `SELECT u.name, COUNT(c.id) as total FROM conversations c JOIN users u ON c.assignee_id = u.id WHERE c.status = 0 GROUP BY u.name ORDER BY total DESC;`,
    `SELECT u.name, AVG(EXTRACT(EPOCH FROM (c.first_reply_created_at - c.created_at)) / 60) as avg_minutes FROM conversations c JOIN users u ON c.assignee_id = u.id WHERE c.first_reply_created_at IS NOT NULL GROUP BY u.name ORDER BY avg_minutes ASC;`
  ];

  for (let i = 0; i < queries.length; i++) {
    try {
      await pool.query(queries[i]);
      console.log(`Query ${i + 1} OK`);
    } catch (e) {
      console.error(`Query ${i + 1} FAILED:`, e.message);
    }
  }
  pool.end();
}

test();
