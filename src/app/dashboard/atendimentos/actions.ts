"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAtendimentosList() {
  const atendimentos = await prisma.fact_atendimentos.findMany({
    orderBy: { data_inicio: 'desc' },
    take: 100 // Limiting to 100 for now
  });

  return atendimentos;
}
