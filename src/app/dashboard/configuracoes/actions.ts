"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getUsers() {
  return await prisma.usuarios.findMany({
    select: { id: true, nome: true, email: true, criado_em: true },
    orderBy: { criado_em: 'desc' }
  });
}

export async function createUser(data: FormData) {
  const nome = data.get('nome') as string;
  const email = data.get('email') as string;
  const password = data.get('password') as string;

  if (!nome || !email || !password) return;

  const exists = await prisma.usuarios.findUnique({ where: { email } });
  if (exists) return;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.usuarios.create({
    data: {
      nome,
      email,
      senha_hash: hashedPassword
    }
  });

  revalidatePath("/dashboard/configuracoes");
}

export async function deleteUser(id: string) {
  await prisma.usuarios.delete({
    where: { id }
  });
  
  revalidatePath("/dashboard/configuracoes");
}

export async function getAiConfig() {
  const config = await prisma.configuracoes.findUnique({
    where: { id: "global" }
  });
  return config || { ai_provider: "google", ai_api_key: "", ai_model: "gemini-1.5-flash" };
}

export async function saveAiConfig(data: FormData) {
  const ai_provider = data.get("ai_provider") as string;
  const ai_api_key = data.get("ai_api_key") as string;
  const ai_model = data.get("ai_model") as string;

  await prisma.configuracoes.upsert({
    where: { id: "global" },
    update: { ai_provider, ai_api_key, ai_model, atualizado_em: new Date() },
    create: { id: "global", ai_provider, ai_api_key, ai_model }
  });

  revalidatePath("/dashboard/configuracoes");
}
