import { InferSelectModel } from 'drizzle-orm';
import * as schema from '@/db/schema';

export type DbStatus = InferSelectModel<typeof schema.status>;
export type DbVeiculo = InferSelectModel<typeof schema.veiculos>;
export type DbFoto = InferSelectModel<typeof schema.fotos>;

export interface VeiculoCanvas extends Omit<DbVeiculo, 'data_entrada' | 'data_prevista_entrega' | 'created_at' | 'updated_at'> {
  data_entrada: string;
  data_prevista_entrega: string | null;
  fotos: DbFoto[];
}

export interface VeiculoTabela extends Omit<DbVeiculo, 'data_entrada' | 'data_prevista_entrega' | 'created_at' | 'updated_at'> {
  data_entrada: string;
  status: DbStatus;
}

export interface ColunaCanvas extends DbStatus {
  veiculos: VeiculoCanvas[];
}