import { relations } from "drizzle-orm";
import { status, veiculos, fotos } from "./schema";

export const statusRelations = relations(status, ({ many }) => ({
  veiculos: many(veiculos),
}));

export const veiculosRelations = relations(veiculos, ({ one, many }) => ({
  status: one(status, {
    fields: [veiculos.status_id],
    references: [status.id],
  }),
  fotos: many(fotos),
}));

export const fotosRelations = relations(fotos, ({ one }) => ({
  veiculo: one(veiculos, {
    fields: [fotos.veiculo_id],
    references: [veiculos.id],
  }),
}));