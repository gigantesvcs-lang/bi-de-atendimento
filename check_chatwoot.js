const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:DA61y8oOaGF1C1g4HXCC8zXAhHxvHdYQ@46.225.151.201:5432/chatwoot'
    }
  }
});
async function main() {
  const inboxes = await prisma.$queryRaw`SELECT id, name FROM inboxes;`;
  console.log('Inboxes:', inboxes);
  
  const teams = await prisma.$queryRaw`SELECT id, name FROM teams;`;
  console.log('Teams:', teams);
}
main().catch(console.error).finally(() => prisma.$disconnect());
