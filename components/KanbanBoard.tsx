"use client";
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  TouchSensor,
  closestCorners
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { atualizarStatusVeiculo } from "@/app/actions";
import { useState, useEffect } from "react";
import { KanbanColuna, KanbanVeiculo } from "@/types/kanban";

export default function KanbanBoard({ initialData }: { initialData: KanbanColuna[] }) {
  // 1. Forçamos a tipagem inicial com um cast
  const [data, setData] = useState<KanbanColuna[]>(initialData as KanbanColuna[]);

  // 2. CORREÇÃO DO ERRO: Usamos 'unknown' como ponte para o cast
  // Isso resolve o erro de "Type 'X' is not assignable to type 'KanbanColuna[]'"
  useEffect(() => {
    setData(initialData as unknown as KanbanColuna[]);
  }, [initialData]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;

    const veiculoId = active.data.current?.veiculoId as number;
    const novoStatusId = over.data.current?.statusId as number;

    if (veiculoId && novoStatusId) {
      // --- ATUALIZAÇÃO OTIMISTA (Move na tela na hora) ---
      // Criamos uma cópia profunda para não bugar o estado do React
      const clonedData: KanbanColuna[] = JSON.parse(JSON.stringify(data));
      let veiculoParaMover: KanbanVeiculo | undefined;

      // Remove o veículo da coluna atual
      clonedData.forEach(col => {
        const idx = col.veiculos.findIndex(v => v.id === veiculoId);
        if (idx !== -1) {
          veiculoParaMover = col.veiculos.splice(idx, 1)[0];
        }
      });

      // Se achamos o veículo, colocamos na nova coluna
      if (veiculoParaMover) {
        const colDestino = clonedData.find(c => c.id === novoStatusId);
        if (colDestino) {
          veiculoParaMover.status_id = novoStatusId;
          colDestino.veiculos.push(veiculoParaMover);
          setData(clonedData); // Atualiza o visual instantaneamente
        }
      }

      // --- SALVA NO BANCO (EM SEGUNDO PLANO) ---
      try {
        await atualizarStatusVeiculo(veiculoId, novoStatusId);
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        // O revalidatePath da Action vai resetar a tela se algo der errado
      }
    }
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {data.map((coluna) => (
          <KanbanColumn key={coluna.id} coluna={coluna}>
            {coluna.veiculos.map((veiculo) => (
              <KanbanCard key={veiculo.id} veiculo={veiculo} />
            ))}
          </KanbanColumn>
        ))}
      </div>
    </DndContext>
  );
}