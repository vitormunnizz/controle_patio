"use server";

import { db } from "@/db";
import { veiculos, fotos, status as statusTable } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { google } from "googleapis";
import { Readable } from "stream";

// 1. Configuração de Segurança e Autenticação do Google Drive
const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL || "";
const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// --- AÇÃO: ATUALIZAR VEÍCULO (NO BANCO LOCAL) ---
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

// --- AÇÃO: SALVAR FOTO NO DRIVE + GRAVAR REFERÊNCIA NO BANCO LOCAL ---
export async function salvarFotoDrive(veiculoId: number, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("Arquivo não encontrado no envio");

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // 1. Upload do arquivo físico para o Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: `VEICULO_${veiculoId}_${Date.now()}.webp`,
        parents: [folderId],
      },
      media: {
        mimeType: file.type || "image/webp",
        body: Readable.from(buffer),
      },
      fields: "id",
    });

    const fileId = response.data.id;
    if (!fileId) throw new Error("Erro ao gerar ID no Drive");

    // 2. Torna o arquivo publicamente visível para exibição em <img>
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // 3. Salva a URL formatada no banco de dados local
    const publicUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

    await db.insert(fotos).values({
      veiculo_id: veiculoId,
      url: publicUrl,
    });

    revalidatePath(`/veiculos/${veiculoId}`);
    revalidatePath("/");
  } catch (error) {
    console.error("Erro no upload Drive:", error);
    throw new Error("Falha ao salvar no Google Drive.");
  }
}

// --- AÇÃO: DELETAR FOTO DO DRIVE E DO BANCO LOCAL ---
export async function deletarFotoDrive(fotoId: number, veiculoId: number, url: string) {
  const fileIdMatch = url.match(/id=([^&]+)/);
  const fileId = fileIdMatch ? fileIdMatch[1] : null;

  if (fileId) {
    try {
      await drive.files.delete({ fileId });
    } catch {
      console.warn("Arquivo já removido do Drive ou inexistente.");
    }
  }

  // Remove do Banco Local
  await db.delete(fotos).where(eq(fotos.id, fotoId));
  revalidatePath(`/veiculos/${veiculoId}`);
  revalidatePath("/");
}

// --- AÇÃO: EXCLUIR VEÍCULO COMPLETO ---
export async function excluirVeiculo(id: number) {
  try {
    // 1. Consulta fotos vinculadas no banco local
    const fotosVeiculo = await db.query.fotos.findMany({
      where: eq(fotos.veiculo_id, id),
    });

    // 2. Remove fotos do Google Drive
    for (const foto of fotosVeiculo) {
      if (!foto.url) continue;

      const fileIdMatch = foto.url.match(/id=([^&]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;

      if (fileId) {
        try {
          await drive.files.delete({ fileId });
        } catch (driveError) {
          console.warn(`Aviso: Erro ao apagar foto ID ${fileId} do Drive:`, driveError);
        }
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

// --- AÇÃO: BACKUP DO BANCO LOCAL PARA O DRIVE ---
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

    await drive.files.create({
      requestBody: {
        name: `BACKUP_JC_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`,
        parents: [folderId],
      },
      media: {
        mimeType: "text/csv",
        body: Readable.from(buffer),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro no backup:", error);
    throw new Error("Falha ao gerar planilha no Drive.");
  }
}