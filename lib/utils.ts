import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusStyles: Record<string, { bg: string, border: string, text: string, dot: string }> = {
  "Recebido": { bg: "bg-blue-50", border: "border-blue-200", text: "text-[#0047BB]", dot: "bg-[#0047BB]" },
  "Aguardando orçamento": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  "Aguardando aprovação": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  "Aguardando peças": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500" },
  "Em manutenção": { bg: "bg-yellow-50", border: "border-[#FFD700]", text: "text-yellow-800", dot: "bg-[#FFD700]" },
  "Finalizado": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-500" },
  "Entregue": { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-900", dot: "bg-slate-900" },
};