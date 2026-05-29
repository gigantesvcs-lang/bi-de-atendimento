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
