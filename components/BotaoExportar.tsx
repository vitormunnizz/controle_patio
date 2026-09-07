"use client";
import { FileSpreadsheet, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { backupDadosParaDrive } from "@/app/actions";

export function BotaoExportar() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleBackup = async () => {
    setStatus("loading");
    try {
      await backupDadosParaDrive();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch { // Removido o (e) aqui
      alert("Erro ao salvar planilha no Drive.");
      setStatus("idle");
    }
  };

  return (
    <button onClick={handleBackup} disabled={status !== "idle"} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50">
      {status === "loading" ? <Loader2 size={12} className="animate-spin" /> : status === "success" ? <CheckCircle2 size={12} className="text-jc-yellow" /> : <FileSpreadsheet size={12} className="text-jc-yellow" />}
      {status === "loading" ? "Enviando..." : status === "success" ? "Backup OK" : "Gerar Planilha Drive"}
    </button>
  );
}