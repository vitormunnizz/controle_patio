import { InferSelectModel } from 'drizzle-orm';
import * as schema from '@/db/schema';

// Tipos base do Drizzle
export type DbStatus = InferSelectModel<typeof schema.status>;
export type DbVeiculo = InferSelectModel<typeof schema.veiculos>;
export type DbFoto = InferSelectModel<typeof schema.fotos>;

// Tipo para o Veículo (Tratando as datas que viram string no cliente)
export interface KanbanVeiculo extends Omit<DbVeiculo, 'data_entrada' | 'data_prevista_entrega' | 'created_at' | 'updated_at'> {
  data_entrada: string;
  data_prevista_entrega?: string | null;
  fotos: DbFoto[];
}

// Tipo para a Coluna (Status + Veículos)
export interface KanbanColuna extends DbStatus {
  veiculos: KanbanVeiculo[];
}