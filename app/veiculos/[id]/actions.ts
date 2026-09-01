"use server";

import { db } from "@/db";
import { veiculos, fotos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ATUALIZAÇÃO DOS DADOS DO VEÍCULO
export async function atualizarVeiculo(id: number, formData: FormData) {
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

export async function excluirVeiculo(id: number) {
  // 1. Deleta o veículo do banco (Fotos no banco somem pelo CASCADE)
  await db.delete(veiculos).where(eq(veiculos.id, id));
  
  // 2. Atualiza a lista da página inicial
  revalidatePath("/");
  
  // 3. Redireciona para o Dashboard principal
  redirect("/");
}

// SALVAR O LINK DA FOTO
export async function salvarFotoNoBanco(veiculoId: number, url: string) {
  await db.insert(fotos).values({
    veiculo_id: veiculoId,
    url: url,
  });
  revalidatePath(`/veiculos/${veiculoId}`);
  revalidatePath("/");
}

// DELETAR FOTO
export async function deletarFoto(fotoId: number, veiculoId: number) {
  await db.delete(fotos).where(eq(fotos.id, fotoId));
  revalidatePath(`/veiculos/${veiculoId}`);
  revalidatePath("/");
}