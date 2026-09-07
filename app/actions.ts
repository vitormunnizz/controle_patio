"use server";

import { db } from "@/db";
import { veiculos as veiculosTable, status as statusTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { google } from "googleapis";
import { Readable } from "stream";

// Configuração central do Google Drive (instância privada, sem 'export')
const authDrive = new google.auth.JWT({
  email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
  key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth: authDrive });

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

    await drive.files.create({
      requestBody: {
        name: `BACKUP_JC_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
      },
      media: {
        mimeType: "text/csv",
        body: Readable.from(buffer),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao realizar backup para o Google Drive:", error);
    throw new Error("Falha ao salvar o arquivo de backup no Google Drive.");
  }
}