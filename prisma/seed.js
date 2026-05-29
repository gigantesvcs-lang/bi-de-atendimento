const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Seeding fake data (matching real PostgreSQL structure)...');

  const origins = ['google', 'facebook', 'instagram', 'site', 'indicacao'];
  const intents = ['Orcamento', 'Assistencia', 'Fornecedores', 'Curriculo'];
  const subIntents = ['gineco_dermato', 'otorrino_oftalmo', 'endodontia', 'outra'];
  const times = ['Time Comercial', 'Time Tecnico', 'Compras', 'RH'];
  const canais = ['WhatsApp', 'WhatsApp', 'WhatsApp', 'Telefone', 'E-mail']; // WhatsApp heavily weighted

  // 1000 records
  const atendimentos = Array.from({ length: 1000 }).map((_, index) => {
    // Generate dates: mostly in the last 30 days, some up to 60 days to test M/M comparisons
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60);
    const createdAt = getRandomDate(startDate, today);
    
    // Simulate resolution time (mostly between 5 to 30 mins)
    const resolveTimeMs = Math.floor(Math.random() * 25 * 60 * 1000) + (5 * 60 * 1000);
    const resolvedAt = new Date(createdAt.getTime() + resolveTimeMs);
    const firstResponseAt = new Date(createdAt.getTime() + (Math.random() * 5 * 60 * 1000));

    return {
      conversation_id: 10000 + index,
      contato_nome: `Contato ${index}`,
      contato_fone: `+55119${Math.floor(10000000 + Math.random() * 90000000)}`,
      canal: canais[Math.floor(Math.random() * canais.length)],
      origem: origins[Math.floor(Math.random() * origins.length)],
      intent_principal: intents[Math.floor(Math.random() * intents.length)],
      sub_intent: subIntents[Math.floor(Math.random() * subIntents.length)],
      time_responsavel: times[Math.floor(Math.random() * times.length)],
      status_conversa: Math.random() > 0.1 ? 'resolved' : 'open',
      data_inicio: createdAt,
      data_primeira_resposta_humana: firstResponseAt,
      data_fechamento: resolvedAt,
      espera_segundos: Math.floor(Math.random() * 300),
      atendimento_segundos: Math.floor(resolveTimeMs / 1000),
      total_mensagens: Math.floor(Math.random() * 20) + 1,
      atualizado_em: resolvedAt
    };
  });

  await prisma.fact_atendimentos.createMany({
    data: atendimentos,
  });

  console.log(`Created ${atendimentos.length} atendimentos.`);

  // Create admin user
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
  console.log('Admin user created: admin@gigante.com.br / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
