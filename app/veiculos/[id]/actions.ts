"use server";

import { db } from "@/db";
import { veiculos, fotos, status as statusTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// --- AUXILIAR: SALVAR ARQUIVO LOCALMENTE ---
async function salvarArquivoLocal(buffer: Buffer, nomeArquivo: string): Promise<string> {
  const pastaUploads = path.join(process.cwd(), "public", "uploads");
  await mkdir(pastaUploads, { recursive: true });

  const caminhoCompleto = path.join(pastaUploads, nomeArquivo);
  await writeFile(caminhoCompleto, buffer);

  return `/uploads/${nomeArquivo}`;
}

// --- AUXILIAR: EXCLUIR ARQUIVO LOCALMENTE ---
async function deletarArquivoLocal(urlRelativa: string) {
  if (!urlRelativa) return;
  
  // Extrai o nome do arquivo da URL (ex: /uploads/foto.jpg -> foto.jpg)
  const nomeArquivo = path.basename(urlRelativa);
  const caminhoArquivo = path.join(process.cwd(), "public", "uploads", nomeArquivo);

  if (existsSync(caminhoArquivo)) {
    try {
      await unlink(caminhoArquivo);
    } catch (error) {
      console.warn(`Aviso: Não foi possível remover o arquivo local ${caminhoArquivo}:`, error);
    }
  }
}

// --- AÇÃO: ATUALIZAR VEÍCULO ---
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

// --- AÇÃO: SALVAR FOTO LOCALMENTE + GRAVAR NO BANCO ---
export async function salvarFotoDrive(veiculoId: number, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("Arquivo não encontrado no envio");

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const extensao = path.extname(file.name) || ".webp";
    const nomeArquivo = `VEICULO_${veiculoId}_${Date.now()}${extensao}`;

    // 1. Salva a foto na pasta public/uploads
    const publicUrl = await salvarArquivoLocal(buffer, nomeArquivo);

    // 2. Salva a URL local (/uploads/VEICULO_...) no banco de dados
    await db.insert(fotos).values({
      veiculo_id: veiculoId,
      url: publicUrl,
    });

    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath("/");
  } catch (error) {
    console.error("Erro no upload local:", error);
    throw new Error("Falha ao salvar a imagem localmente.");
  }
}

// --- AÇÃO: DELETAR FOTO LOCAL E DO BANCO ---
export async function deletarFotoDrive(fotoId: number, veiculoId: number, url: string) {
  // 1. Apaga o arquivo físico da pasta public/uploads
  await deletarArquivoLocal(url);

  // 2. Remove o registro do Banco Local
  await db.delete(fotos).where(eq(fotos.id, fotoId));

  revalidatePath(`/veiculos/${veiculoId}`);
  revalidatePath("/");
}

// --- AÇÃO: EXCLUIR VEÍCULO COMPLETO E SUAS FOTOS ---
export async function excluirVeiculo(id: number) {
  try {
    // 1. Consulta fotos vinculadas no banco local
    const fotosVeiculo = await db.query.fotos.findMany({
      where: eq(fotos.veiculo_id, id),
    });

    // 2. Apaga os arquivos físicos locais de cada foto
    for (const foto of fotosVeiculo) {
      if (foto.url) {
        await deletarArquivoLocal(foto.url);
      }
    }

    // 3. Limpa dependências e veículo do banco local
    await db.delete(fotos).where(eq(fotos.veiculo_id, id));
    await db.delete(veiculos).where(eq(veiculos.id, id));

    revalidatePath("/");
  } catch (error) {
    console.error("Erro detalhado na exclusão do veículo:", error);
    throw new Error("Erro no processo de exclusão.");
  }

  redirect("/");
}

// --- AÇÃO: BACKUP DO BANCO PARA ARQUIVO CSV LOCAL ---
export async function backupDadosParaDrive() {
  try {
    const dados = await db
      .select()
      .from(veiculos)
      .innerJoin(statusTable, eq(veiculos.status_id, statusTable.id))
      .orderBy(asc(veiculos.id));

    const cabecalho = "ID;Placa;Modelo;Cliente;Entrada;Status\n";
    const linhas = dados
      .map(
        ({ veiculos: v, status: s }) =>
          `${v.id};${v.placa};${v.modelo};${v.cliente};${v.data_entrada};${s.nome}`
      )
      .join("\n");

    const buffer = Buffer.from(cabecalho + linhas, "utf-8");
    const nomeArquivo = `BACKUP_JC_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`;

    const urlRelativa = await salvarArquivoLocal(buffer, nomeArquivo);

    return { success: true, path: urlRelativa };
  } catch (error) {
    console.error("Erro no backup local:", error);
    throw new Error("Falha ao gerar planilha de backup.");
  }
}