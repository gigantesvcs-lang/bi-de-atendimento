const { Client } = require('pg');
async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'usuarios'");
  console.log(res.rows);
  await client.end();
}
main().catch(console.error);
