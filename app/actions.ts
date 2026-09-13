"use server";

import { db } from "@/db";
import { veiculos as veiculosTable, status as statusTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Função auxiliar para salvar o arquivo localmente em public/uploads
async function salvarArquivoLocal(buffer: Buffer, nomeArquivo: string): Promise<string> {
  const pastaUploads = path.join(process.cwd(), "public", "uploads");
  
  // Garante que a pasta public/uploads existe
  await mkdir(pastaUploads, { recursive: true });

  const caminhoCompleto = path.join(pastaUploads, nomeArquivo);
  await writeFile(caminhoCompleto, buffer);

  // Retorna a URL relativa do arquivo local
  return `/uploads/${nomeArquivo}`;
}

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

export async function atualizarStatusVeiculo(veiculoId: number, novoStatusId: number) {
  await db.update(veiculosTable)
    .set({ status_id: novoStatusId })
    .where(eq(veiculosTable.id, veiculoId));

  revalidatePath("/");
}

// Backup salvo localmente na pasta public/uploads
export async function backupDadosParaDrive() {
  try {
    const dados = await db
      .select()
      .from(veiculosTable)
      .innerJoin(statusTable, eq(veiculosTable.status_id, statusTable.id));

    const cabecalho = "Placa;Modelo;Cliente;Entrada;Status\n";
    const linhas = dados
      .map(({ veiculos: v, status: s }) => `${v.placa};${v.modelo};${v.cliente};${v.data_entrada};${s.nome}`)
      .join("\n");

    const buffer = Buffer.from(cabecalho + linhas, "utf-8");
    const nomeArquivo = `BACKUP_JC_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`;

    // Salva o arquivo .csv localmente
    const urlRelativa = await salvarArquivoLocal(buffer, nomeArquivo);

    return { success: true, path: urlRelativa };
  } catch (error) {
    console.error("Erro ao realizar backup local:", error);
    throw new Error("Falha ao salvar o arquivo de backup localmente.");
  }
}