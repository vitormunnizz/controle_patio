// app/veiculos/novo/actions.ts
"use server";

import { db } from "@/db";
import { veiculos } from "@/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function criarVeiculo(formData: FormData) {
  const placa = formData.get("placa") as string;
  const modelo = formData.get("modelo") as string;
  const cliente = formData.get("cliente") as string;
  const data_entrada = formData.get("data_entrada") as string;
  
  // Novos campos
  const data_prevista_entrega = formData.get("data_prevista_entrega") as string || null;
  const status_id = Number(formData.get("status_id"));
  const observacoes = formData.get("observacoes") as string;

  await db.insert(veiculos).values({
    placa,
    modelo,
    cliente,
    data_entrada,
    data_prevista_entrega,
    status_id,
    observacoes,
  });

  // Limpa o cache da página principal para mostrar o novo veículo
  revalidatePath("/");
  redirect("/");
}