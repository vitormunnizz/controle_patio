import { InferSelectModel } from 'drizzle-orm';
import * as schema from '@/db/schema';

export type DbStatus = InferSelectModel<typeof schema.status>;
export type DbVeiculo = InferSelectModel<typeof schema.veiculos>;
export type DbFoto = InferSelectModel<typeof schema.fotos>;

// Tipo para a foto que o navegador recebe (Data convertida em String)
export interface FotoSerializada extends Omit<DbFoto, 'created_at'> {
  created_at: string | null;
}

export interface VeiculoCanvas extends Omit<DbVeiculo, 'data_entrada' | 'data_prevista_entrega' | 'created_at' | 'updated_at'> {
  data_entrada: string;
  data_prevista_entrega: string | null;
  fotos: FotoSerializada[];
}

export interface ColunaCanvas extends DbStatus {
  veiculos: VeiculoCanvas[];
}

export interface VeiculoTabela {
  id: number;
  placa: string;
  modelo: string;
  cliente: string;
  status_id: number;
  data_entrada: string;
  status: {
    id: number;
    nome: string;
    ordem: number;
  };
}