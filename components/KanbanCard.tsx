"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { VeiculoCanvas } from "@/types/kanban";

export function KanbanCard({ veiculo }: { veiculo: VeiculoCanvas }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `veiculo-${veiculo.id}`,
    data: { veiculoId: veiculo.id }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  // Trata a string 'YYYY-MM-DD' diretamente para evitar deslocamento de fuso no new Date()
  const formatarDataEntrada = (dataStr: string) => {
    if (!dataStr) return "";
    const [, mes, dia] = dataStr.split("T")[0].split("-");
    if (!dia || !mes) return dataStr;
    return `${dia}/${mes}`;
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div 
        className="bg-white p-2 rounded-lg shadow-[0_2px_8px_rgba(15,23,42,0.07)] border border-white border-l-2 border-l-blue-200 group hover:border-l-jc-blue hover:shadow-md transition-all"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              {...listeners}
              {...attributes}
              aria-label={`Mover veículo ${veiculo.placa}`}
              className="touch-none cursor-grab rounded p-0.5 text-slate-300 transition-colors hover:text-jc-blue active:cursor-grabbing"
            >
              <GripVertical size={14} />
            </button>
            <span className="truncate font-black text-sm text-slate-800 uppercase tracking-tighter leading-none">
              {veiculo.placa}
            </span>
          </div>
          
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => router.push(`/veiculos/${veiculo.id}`)}
            className="px-2 py-0.5 bg-blue-50 text-jc-blue rounded text-xs font-bold uppercase tracking-wide cursor-pointer hover:bg-jc-blue hover:text-white transition-colors"
          >
            Editar
          </button>
        </div>

        <div className="space-y-0.5 pointer-events-none mb-1.5">
          <p className="text-xs font-bold text-slate-700 uppercase truncate">
            {veiculo.modelo}
          </p>
          <p className="text-xs text-slate-500 font-medium truncate">
            {veiculo.cliente}
          </p>
        </div>

        <div className="pt-1 border-t border-slate-50 flex justify-between items-center pointer-events-none">
          <span className="text-xs font-semibold text-slate-500">
            {formatarDataEntrada(veiculo.data_entrada)}
          </span>
        </div>
      </div>
    </div>
  );
}
