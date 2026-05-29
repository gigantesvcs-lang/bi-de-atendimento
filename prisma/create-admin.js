const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.usuarios.upsert({
    where: { email: 'admin@gigante.com.br' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@gigante.com.br',
      senha_hash: hashedPassword,
    },
  });

  console.log('Admin user created/verified.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
