"use server";

import { db } from "@/db";
import { checklistTecnico, veiculos as veiculosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ITENS_VEICULO } from "@/lib/checklist-tecnico";
import { isUniqueConstraintViolation } from "@/lib/db-errors";

export async function atualizarStatusVeiculo(veiculoId: number, novoStatusId: number) {
  await db.update(veiculosTable)
    .set({ status_id: novoStatusId })
    .where(eq(veiculosTable.id, veiculoId));

  revalidatePath("/");
}

async function inserirVeiculo(formData: FormData) {
  const placa = String(formData.get("placa") ?? "").trim().toUpperCase();
  let veiculoId = 0;

  await db.transaction(async (tx) => {
    const [veiculo] = await tx.insert(veiculosTable).values({
      placa,
      modelo: formData.get("modelo") as string,
      cliente: formData.get("cliente") as string,
      status_id: Number(formData.get("status_id")),
      data_entrada: formData.get("data_entrada") as string,
      data_prevista_entrega: (formData.get("data_prevista_entrega") as string) || null,
      observacoes: formData.get("observacoes") as string,
    }).returning({ id: veiculosTable.id });

    await tx.insert(checklistTecnico).values({
      veiculo_id: veiculo.id,
      itens: Object.fromEntries(ITENS_VEICULO.map(({ id }) => [id, false])),
    });
    veiculoId = veiculo.id;
  });

  return veiculoId;
}

async function inserirVeiculoComTratamentoDeErro(formData: FormData) {
  try {
    return await inserirVeiculo(formData);
  } catch (error) {
    if (isUniqueConstraintViolation(error)) redirect("/veiculos/novo?erro=placa-existente");

    console.error("Falha ao cadastrar veículo:", error);
    redirect("/veiculos/novo?erro=salvar");
  }
}

export async function criarVeiculo(formData: FormData) {
  const veiculoId = await inserirVeiculoComTratamentoDeErro(formData);
  revalidatePath("/");
  redirect(`/veiculos/${veiculoId}`);
}

export async function criarVeiculoEChecklist(formData: FormData) {
  const veiculoId = await inserirVeiculoComTratamentoDeErro(formData);
  revalidatePath("/");
  redirect(`/veiculos/${veiculoId}/checklist`);
}
