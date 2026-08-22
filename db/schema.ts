import { pgTable, serial, varchar, integer, text, timestamp, date } from "drizzle-orm/pg-core";

export const status = pgTable("status", {
  id: serial("id").primaryKey().notNull(),
  nome: varchar("nome", { length: 50 }).notNull(),
  ordem: integer("ordem").notNull(),
});

export const veiculos = pgTable("veiculos", {
  id: serial("id").primaryKey().notNull(),
  placa: varchar("placa", { length: 10 }).notNull(),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  cliente: varchar("cliente", { length: 150 }).notNull(),
  data_entrada: date("data_entrada").notNull(),
  data_prevista_entrega: date("data_prevista_entrega"),
  status_id: integer("status_id").notNull().references(() => status.id),
  observacoes: text("observacoes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const fotos = pgTable("fotos", {
  id: serial("id").primaryKey().notNull(),
  veiculo_id: integer("veiculo_id").notNull().references(() => veiculos.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});