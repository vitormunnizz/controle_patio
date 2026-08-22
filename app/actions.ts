"use server";
import { db } from "@/db";
import { veiculos as veiculosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function criarVeiculo(formData: FormData) {
  await db.insert(veiculosTable).values({
    placa: formData.get("placa") as string,
    modelo: formData.get("modelo") as string,
    cliente: formData.get("cliente") as string,
    status_id: Number(formData.get("status_id")),
    data_entrada: formData.get("data_entrada") as string,
    data_prevista_entrega: (formData.get("data_prevista_entrega") as string) || null,
    observacoes: formData.get("observacoes") as string,
  });
  revalidatePath("/");
  redirect("/");
}

export async function atualizarVeiculo(id: number, formData: FormData) {
  await db.update(veiculosTable).set({
    placa: formData.get("placa") as string,
    modelo: formData.get("modelo") as string,
    cliente: formData.get("cliente") as string,
    status_id: Number(formData.get("status_id")),
    data_entrada: formData.get("data_entrada") as string,
    data_prevista_entrega: (formData.get("data_prevista_entrega") as string) || null,
    observacoes: formData.get("observacoes") as string,
  }).where(eq(veiculosTable.id, id));

  revalidatePath("/");
  revalidatePath(`/veiculos/${id}`);
  redirect("/");
}

export async function atualizarStatusVeiculo(veiculoId: number, novoStatusId: number) {
  await db.update(veiculosTable)
    .set({ status_id: novoStatusId })
    .where(eq(veiculosTable.id, veiculoId));
  revalidatePath("/");
}