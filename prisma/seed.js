const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('Clearing existing records...');
  await prisma.fact_atendimentos.deleteMany();

  console.log('Seeding fake data (matching real PostgreSQL structure)...');

  const origins = ['google', 'facebook', 'instagram', 'site', 'indicação', 'outros'];
  // Realistic distribution for sub-intents (currículo is less frequent than medical specialties)
  const subIntentsPool = [
    ...Array(30).fill('gineco_dermato'),
    ...Array(30).fill('otorrino_oftalmo'),
    ...Array(30).fill('endodontia'),
    ...Array(10).fill('currículo')
  ];
  
  const times = ['Equipe Médica', 'Recepção', 'RH'];
  const canais = ['WhatsApp', 'WhatsApp', 'WhatsApp', 'WhatsApp', 'Site']; // WhatsApp heavily weighted

  // 1000 records
  const atendimentos = Array.from({ length: 1000 }).map((_, index) => {
    // Generate dates: mostly in the last 150 days (to cover Jan to Jun)
    const today = new Date('2026-06-01T23:59:59'); // Base date for presentation
    const startDate = new Date('2026-01-01T00:00:00');
    const createdAt = getRandomDate(startDate, today);
    
    // Simulate resolution time (mostly between 5 to 30 mins)
    const resolveTimeMs = Math.floor(Math.random() * 25 * 60 * 1000) + (5 * 60 * 1000);
    const resolvedAt = new Date(createdAt.getTime() + resolveTimeMs);
    const firstResponseAt = new Date(createdAt.getTime() + (Math.random() * 5 * 60 * 1000));

    const sub_intent = subIntentsPool[Math.floor(Math.random() * subIntentsPool.length)];
    const intent_principal = sub_intent === 'currículo' ? 'Trabalhe Conosco' : (Math.random() > 0.5 ? 'Agendamento' : 'Dúvida');
    const time_responsavel = sub_intent === 'currículo' ? 'RH' : (Math.random() > 0.4 ? 'Equipe Médica' : 'Recepção');
    const status = Math.random() > 0.1 ? 'closed' : 'open';

    return {
      conversation_id: 10000 + index,
      contato_nome: `Paciente ${index}`,
      contato_fone: `+55119${Math.floor(10000000 + Math.random() * 90000000)}`,
      canal: canais[Math.floor(Math.random() * canais.length)],
      origem: origins[Math.floor(Math.random() * origins.length)],
      intent_principal,
      sub_intent,
      time_responsavel: status === 'closed' ? time_responsavel : (Math.random() > 0.5 ? time_responsavel : null),
      status_conversa: status,
      data_inicio: createdAt,
      data_primeira_resposta_humana: firstResponseAt,
      data_fechamento: status === 'closed' ? resolvedAt : null,
      espera_segundos: Math.floor(Math.random() * 300),
      atendimento_segundos: status === 'closed' ? Math.floor(resolveTimeMs / 1000) : 0,
      total_mensagens: Math.floor(Math.random() * 20) + 2,
      atualizado_em: status === 'closed' ? resolvedAt : createdAt
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
