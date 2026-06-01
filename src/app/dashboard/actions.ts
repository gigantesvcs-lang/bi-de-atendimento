"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDashboardMetrics(filterStartDate?: Date, filterEndDate?: Date) {
  const now = new Date();
  
  // Default to last 30 days if no filter provided
  const currentEnd = filterEndDate || now;
  const currentStart = filterStartDate || new Date(currentEnd.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  // Calculate previous period of equal length for comparison
  const duration = currentEnd.getTime() - currentStart.getTime();
  const prevEnd = new Date(currentStart.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);

  // 1. Total Atendimentos (Período Atual vs Anterior)
  const totalCurrent = await prisma.fact_atendimentos.count({
    where: { data_inicio: { gte: currentStart, lte: currentEnd } }
  });
  
  const totalPrev = await prisma.fact_atendimentos.count({
    where: { data_inicio: { gte: prevStart, lte: prevEnd } }
  });

  const totalGrowth = totalPrev === 0 ? 100 : ((totalCurrent - totalPrev) / totalPrev) * 100;

  // 2. Finalizados (Triagem concluída / Resolvidos)
  const successCurrent = await prisma.fact_atendimentos.count({
    where: { 
      data_inicio: { gte: currentStart, lte: currentEnd },
      time_responsavel: { not: null } 
    }
  });
  const successPrev = await prisma.fact_atendimentos.count({
    where: { 
      data_inicio: { gte: prevStart, lte: prevEnd },
      time_responsavel: { not: null } 
    }
  });
  const successGrowth = successPrev === 0 ? 100 : ((successCurrent - successPrev) / successPrev) * 100;

  // 3. Em Atendimento
  const ongoingCurrent = await prisma.fact_atendimentos.count({
    where: { 
      data_inicio: { gte: currentStart, lte: currentEnd },
      status_conversa: 'open',
      time_responsavel: { not: null }
    }
  });
  const ongoingPrev = await prisma.fact_atendimentos.count({
    where: { 
      data_inicio: { gte: prevStart, lte: prevEnd },
      status_conversa: 'open',
      time_responsavel: { not: null }
    }
  });
  const ongoingGrowth = ongoingPrev === 0 ? 100 : ((ongoingCurrent - ongoingPrev) / ongoingPrev) * 100;

  // 4. Aguardando (Sem time responsável ainda)
  const waitingCurrent = await prisma.fact_atendimentos.count({
    where: { 
      data_inicio: { gte: currentStart, lte: currentEnd },
      status_conversa: 'open',
      time_responsavel: null
    }
  });
  const waitingPrev = await prisma.fact_atendimentos.count({
    where: { 
      data_inicio: { gte: prevStart, lte: prevEnd },
      status_conversa: 'open',
      time_responsavel: null
    }
  });
  const waitingGrowth = waitingPrev === 0 ? 100 : ((waitingCurrent - waitingPrev) / waitingPrev) * 100;

  // 5. TMA Humano (Tempo Médio de Atendimento) - Minutos
  const getTma = async (start: Date, end: Date) => {
    const records = await prisma.fact_atendimentos.findMany({
      where: {
        data_inicio: { gte: start, lte: end },
        atendimento_segundos: { gt: 0 }
      },
      select: { atendimento_segundos: true }
    });

    if (records.length === 0) return 0;
    const totalSecs = records.reduce((acc, r) => acc + (r.atendimento_segundos || 0), 0);
    return totalSecs / records.length / 60; // Em minutos
  };

  const tmaCurrent = await getTma(currentStart, currentEnd);
  const tmaPrev = await getTma(prevStart, prevEnd);
  const tmaGrowth = tmaPrev === 0 ? 100 : ((tmaCurrent - tmaPrev) / tmaPrev) * 100;

  // 6. Gráfico: Atendimentos por origem
  const byOrigemData = await prisma.fact_atendimentos.groupBy({
    by: ['origem'],
    where: { data_inicio: { gte: currentStart, lte: currentEnd }, origem: { not: null } },
    _count: { id: true }
  });
  const chartOrigem = byOrigemData.map(d => ({ name: d.origem || 'Desconhecida', value: d._count.id }));

  // 7. Gráfico: Atendimentos por Status (Barras horizontais)
  const chartStatus = [
    { name: 'Finalizados', value: successCurrent },
    { name: 'Em Atendimento', value: ongoingCurrent },
    { name: 'Aguardando', value: waitingCurrent },
    { name: 'Abandonados', value: 0 } // Could calculate abandonment rate
  ];

  // 8. Gráfico: Especialidades (sub_intent) + Currículos
  const bySpecialtyData = await prisma.fact_atendimentos.groupBy({
    by: ['sub_intent'],
    where: { data_inicio: { gte: currentStart, lte: currentEnd }, sub_intent: { not: null } },
    _count: { id: true }
  });
  
  let chartSpecialty = bySpecialtyData.map(d => ({ name: d.sub_intent, value: d._count.id }));

  // Buscar currículos (baseado em intent_principal)
  const curriculosCount = await prisma.fact_atendimentos.count({
    where: { 
      data_inicio: { gte: currentStart, lte: currentEnd }, 
      intent_principal: { contains: 'urriculo' } 
    }
  });

  if (curriculosCount > 0) {
    chartSpecialty.push({ name: 'currículos', value: curriculosCount });
  }

  // Ordenar por valor (decrescente)
  chartSpecialty.sort((a, b) => b.value - a.value);
  
  // 9. Timeline de atendimentos (Últimos dias selecionados)
  // Simple grouping by date (ignoring time) - in SQL it's easier, but we'll do it in memory for sqlite compatibility
  const timelineRecords = await prisma.fact_atendimentos.findMany({
    where: { data_inicio: { gte: currentStart, lte: currentEnd } },
    select: { data_inicio: true }
  });
  
  const timelineMap = new Map<string, number>();
  timelineRecords.forEach(r => {
    if(!r.data_inicio) return;
    // Format DD/MM
    const dateStr = `${r.data_inicio.getDate().toString().padStart(2, '0')}/${(r.data_inicio.getMonth() + 1).toString().padStart(2, '0')}`;
    timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);
  });
  
  // Sort map by actual date
  const chartTimeline = Array.from(timelineMap.entries())
                             .map(([date, count]) => ({ date, count }))
                             .sort((a, b) => {
                               const [dayA, monthA] = a.date.split('/');
                               const [dayB, monthB] = b.date.split('/');
                               if (monthA !== monthB) return parseInt(monthA) - parseInt(monthB);
                               return parseInt(dayA) - parseInt(dayB);
                             });

  return {
    cards: {
      total: { value: totalCurrent, growth: totalGrowth },
      success: { value: successCurrent, growth: successGrowth },
      ongoing: { value: ongoingCurrent, growth: ongoingGrowth },
      waiting: { value: waitingCurrent, growth: waitingGrowth },
      tma: { value: tmaCurrent, growth: tmaGrowth }
    },
    charts: {
      origem: chartOrigem,
      status: chartStatus,
      specialty: chartSpecialty,
      timeline: chartTimeline
    }
  };
}
