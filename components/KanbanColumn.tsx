"use client";
import { useDroppable } from "@dnd-kit/core";
import { cn, statusStyles } from "@/lib/utils";
import { ColunaCanvas } from "@/types/kanban";

export function KanbanColumn({ coluna, children }: { coluna: ColunaCanvas, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `coluna-${coluna.id}`,
    data: { statusId: coluna.id }
  });

  const style = statusStyles[coluna.nome] || statusStyles["Recebido"];

  return (
    // Reduzido para min-w-[200px]
    <div 
      ref={setNodeRef} 
      className={cn(
        "min-w-[200px] max-w-[220px] flex flex-col p-1 transition-all duration-200",
        isOver ? "bg-jc-blue/5 rounded-2xl ring-1 ring-jc-blue/20" : ""
      )}
    >
      <div className={cn(
        "flex justify-between items-center p-2 rounded-xl border-b-2 mb-2 shadow-sm",
        style.bg, style.border
      )}>
        <span className={cn("text-[8px] font-black uppercase tracking-tight truncate", style.text)}>
          {coluna.nome}
        </span>
        <span className="bg-white/90 px-1.5 py-0.5 rounded-full text-[9px] font-black text-slate-500 border border-white/50">
          {coluna.veiculos.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}