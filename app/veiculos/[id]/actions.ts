"use server";

import { db } from "@/db";
import { veiculos as veiculosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function atualizarVeiculo(id: number, formData: FormData) {
  const placa = formData.get("placa") as string;
  const modelo = formData.get("modelo") as string;
  const cliente = formData.get("cliente") as string;
  const status_id = Number(formData.get("status_id"));
  const data_entrada = formData.get("data_entrada") as string;
  const data_prevista_entrega = (formData.get("data_prevista_entrega") as string) || null;
  const observacoes = formData.get("observacoes") as string;

  await db.update(veiculosTable).set({
    placa,
    modelo,
    cliente,
    status_id,
    data_entrada,
    data_prevista_entrega,
    observacoes
  }).where(eq(veiculosTable.id, id));

  // Limpa o cache para que os dados novos apareçam no Dashboard
  revalidatePath("/");
  revalidatePath(`/veiculos/${id}`);
  
  // Redireciona para o Dashboard
  redirect("/");
}