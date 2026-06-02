const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:DA61y8oOaGF1C1g4HXCC8zXAhHxvHdYQ@46.225.151.201:5432/chatwoot',
});

const USERS = [3, 4, 5, 6]; // Marcela, Guilherme, Esther, Henrique
const TEAMS = [1, 2, 3, 4, 5, 6]; // Comercial, Fin, RH, Lic, Ass, Compras

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function run() {
  const client = await pool.connect();
  try {
    console.log("Fetching contacts...");
    const contactsRes = await client.query('SELECT id FROM contacts LIMIT 50');
    if (contactsRes.rows.length === 0) {
      console.log("No contacts found. Please ensure there are contacts in the DB.");
      return;
    }
    const contactIds = contactsRes.rows.map(r => r.id);

    console.log("Seeding 300 conversations...");
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 300; i++) {
      const contactId = contactIds[randomInt(0, contactIds.length - 1)];
      const assigneeId = USERS[randomInt(0, USERS.length - 1)];
      const teamId = TEAMS[randomInt(0, TEAMS.length - 1)];
      
      // 85% chance of being closed (status = 1), 15% open (status = 0)
      const status = Math.random() > 0.15 ? 1 : 0;
      
      const createdAt = randomDate(sixtyDaysAgo, now);
      
      // first reply between 1 and 30 minutes after created
      const firstReplyAt = new Date(createdAt.getTime() + randomInt(1, 30) * 60000);
      
      // updated at (resolution time) between 10 mins and 3 hours after first reply
      const updatedAt = new Date(firstReplyAt.getTime() + randomInt(10, 180) * 60000);

      // If status is 0 (open), maybe it hasn't been replied to yet. Let's say 20% of open tickets have no reply yet.
      const hasReply = status === 1 || Math.random() > 0.2;
      const finalFirstReply = hasReply ? firstReplyAt : null;
      
      const insertQuery = `
        INSERT INTO conversations 
        (account_id, inbox_id, status, assignee_id, team_id, contact_id, created_at, updated_at, first_reply_created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      
      await client.query(insertQuery, [
        1, // account_id
        7, // inbox_id
        status, 
        assigneeId, 
        teamId, 
        contactId, 
        createdAt, 
        updatedAt, 
        finalFirstReply
      ]);
    }
    console.log("Successfully seeded 300 conversations!");
  } catch (error) {
    console.error("Error seeding DB:", error);
  } finally {
    client.release();
    pool.end();
  }
}

run();
