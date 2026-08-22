"use client";
import { useDroppable } from "@dnd-kit/core";
import { cn, statusStyles } from "@/lib/utils";
import { ColunaCanvas } from "@/types/kanban";

interface KanbanColumnProps {
  coluna: ColunaCanvas;
  children: React.ReactNode;
}

export function KanbanColumn({ coluna, children }: KanbanColumnProps) {
  // Configuração do dnd-kit para receber itens
  const { setNodeRef, isOver } = useDroppable({
    id: `coluna-${coluna.id}`,
    data: { statusId: coluna.id }
  });

  // Puxamos as cores definidas no seu lib/utils.ts
  const style = statusStyles[coluna.nome] || statusStyles["Recebido"];

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "min-w-[300px] flex-1 flex flex-col p-2 rounded-2xl transition-all duration-200 min-h-[600px]",
        isOver ? "bg-blue-50/50 ring-2 ring-blue-200 ring-dashed" : "bg-transparent"
      )}
    >
      {/* Header da Coluna com as cores do Status */}
      <div className={cn(
        "flex justify-between items-center p-3.5 rounded-xl border-b-4 mb-4 shadow-sm",
        style.bg, style.border
      )}>
        <span className={cn("text-[11px] font-black uppercase tracking-[0.1em]", style.text)}>
          {coluna.nome}
        </span>
        <span className="bg-white/90 px-2.5 py-1 rounded-full text-[10px] font-black text-slate-500 shadow-sm border border-white/50">
          {coluna.veiculos.length}
        </span>
      </div>

      {/* Área onde os cards são listados */}
      <div className="flex flex-col gap-4">
        {children}
      </div>
      
      {/* Placeholder visual se a coluna estiver vazia */}
      {coluna.veiculos.length === 0 && !isOver && (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl min-h-[150px]">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
            Sem veículos
          </span>
        </div>
      )}
    </div>
  );
}