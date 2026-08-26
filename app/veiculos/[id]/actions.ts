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

  // Limpa o cache para as mudanças aparecerem no Kanban e na Ficha
  revalidatePath("/");
  revalidatePath(`/veiculos/${id}`);
  
  // Redireciona para a tela principal
  redirect("/");
}

// SALVAR O LINK DA FOTO (Chamada após o upload no Supabase)
export async function salvarFotoNoBanco(veiculoId: number, url: string) {
  await db.insert(fotos).values({
    veiculo_id: veiculoId,
    url: url,
  });

  // Atualiza as telas para a foto nova aparecer na hora
  revalidatePath(`/veiculos/${veiculoId}`);
  revalidatePath("/");
}

// DELETAR FOTO
export async function deletarFoto(fotoId: number, veiculoId: number) {
  await db.delete(fotos).where(eq(fotos.id, fotoId));
  
  // Atualiza a galeria após excluir
  revalidatePath(`/veiculos/${veiculoId}`);
  revalidatePath("/");
}