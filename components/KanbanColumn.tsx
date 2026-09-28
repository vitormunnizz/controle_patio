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
    <div 
      ref={setNodeRef} 
      className={cn(
        "w-[84vw] max-w-[340px] shrink-0 snap-start min-w-0 flex flex-col rounded-xl border border-white/90 bg-white/70 p-1.5 shadow-[0_3px_12px_rgba(15,23,42,0.035)] transition-all duration-200 sm:w-auto sm:max-w-none sm:shrink sm:bg-white/50",
        isOver ? "bg-blue-50 ring-2 ring-jc-blue/25 ring-dashed" : ""
      )}
    >
      <div className={cn(
        "flex items-center justify-between gap-1.5 rounded-lg border px-1.5 py-1.5 mb-1.5 shadow-sm",
        style.bg, style.border
      )}>
        <span className={cn("min-w-0 flex-1 whitespace-normal text-[8px] font-extrabold uppercase leading-tight tracking-tight pr-1", style.text)}>
          {coluna.nome}
        </span>
        <span className="bg-white/90 px-1.5 rounded-full text-[8px] font-bold text-slate-600 shrink-0">
          {coluna.veiculos.length}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 min-h-10">
        {children}
      </div>
    </div>
  );
}
