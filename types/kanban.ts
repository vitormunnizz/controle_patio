import { InferSelectModel } from 'drizzle-orm';
import * as schema from '@/db/schema';

// Tipos básicos vindos do banco
export type DbStatus = InferSelectModel<typeof schema.status>;
export type DbVeiculo = InferSelectModel<typeof schema.veiculos>;
export type DbFoto = InferSelectModel<typeof schema.fotos>;

// Interface para o Veículo (Tratado para o Frontend)
export interface VeiculoCanvas extends Omit<DbVeiculo, 'data_entrada' | 'data_prevista_entrega' | 'created_at' | 'updated_at'> {
  data_entrada: string;
  data_prevista_entrega: string | null;
  fotos: DbFoto[];
}

// Interface para o Veículo na Tabela (Com o Status junto)
export interface VeiculoTabela extends Omit<DbVeiculo, 'data_entrada' | 'data_prevista_entrega' | 'created_at' | 'updated_at'> {
  data_entrada: string;
  status: DbStatus;
}

// Interface para a Coluna do Kanban
export interface ColunaCanvas extends DbStatus {
  veiculos: VeiculoCanvas[];
}