"use server";

import { db } from "@/db";
import { veiculos, fotos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function atualizarVeiculo(id: number, formData: FormData) {
  // ... (mantenha sua lógica de atualizar veículo aqui)
  await db.update(veiculos).set({
    placa: formData.get("placa") as string,
    modelo: formData.get("modelo") as string,
    cliente: formData.get("cliente") as string,
    status_id: Number(formData.get("status_id")),
    data_entrada: formData.get("data_entrada") as string,
    data_prevista_entrega: (formData.get("data_prevista_entrega") as string) || null,
    observacoes: formData.get("observacoes") as string,
  }).where(eq(veiculos.id, id));

  revalidatePath("/");
  revalidatePath(`/veiculos/${id}`);
  redirect("/");
}

// NOVA AÇÃO DE FOTO
export async function deletarFoto(fotoId: number, veiculoId: number) {
  await db.delete(fotos).where(eq(fotos.id, fotoId));
  revalidatePath(`/veiculos/${veiculoId}`);
}