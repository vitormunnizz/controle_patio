"use client";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, TouchSensor, closestCorners } from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { atualizarStatusVeiculo } from "@/app/actions";
import { useState, useId } from "react"; 
import { ColunaCanvas, VeiculoCanvas } from "@/types/kanban";

export default function KanbanBoard({ initialData }: { initialData: ColunaCanvas[] }) {
  const dndId = useId();
  const [data, setData] = useState<ColunaCanvas[]>(initialData);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const veiculoId = active.data.current?.veiculoId as number;
    const novoStatusId = over.data.current?.statusId as number;

    if (veiculoId && novoStatusId) {
      const clonedData: ColunaCanvas[] = JSON.parse(JSON.stringify(data));
      let veiculoParaMover: VeiculoCanvas | undefined;
      clonedData.forEach(col => {
        const idx = col.veiculos.findIndex(v => v.id === veiculoId);
        if (idx !== -1) veiculoParaMover = col.veiculos.splice(idx, 1)[0];
      });
      if (veiculoParaMover) {
        const colDestino = clonedData.find(c => c.id === novoStatusId);
        if (colDestino) {
          veiculoParaMover.status_id = novoStatusId;
          colDestino.veiculos.push(veiculoParaMover);
          setData(clonedData);
        }
      }
      await atualizarStatusVeiculo(veiculoId, novoStatusId);
    }
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      {/* Força 7 colunas em telas médias/grandes e remove barras de rolagem lateral */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-1 w-full overflow-hidden">
        {data.map((coluna: ColunaCanvas) => (
          <KanbanColumn key={coluna.id} coluna={coluna}>
            {coluna.veiculos.map((veiculo: VeiculoCanvas) => (
              <KanbanCard key={veiculo.id} veiculo={veiculo} />
            ))}
          </KanbanColumn>
        ))}
      </div>
    </DndContext>
  );
}