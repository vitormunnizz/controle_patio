"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export function AssinaturaVeiculo({ emitidoEm }: { emitidoEm: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const [assinada, setAssinada] = useState(false);

  function ponto(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
    };
  }

  function iniciarAssinatura(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const posicao = ponto(event);
    const contexto = canvas?.getContext("2d");
    if (!canvas || !contexto || !posicao) return;

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    contexto.beginPath();
    contexto.moveTo(posicao.x, posicao.y);
    contexto.strokeStyle = "#12315b";
    contexto.lineWidth = 5;
    contexto.lineCap = "round";
    contexto.lineJoin = "round";
    desenhando.current = true;
  }

  function continuarAssinatura(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!desenhando.current) return;
    const posicao = ponto(event);
    const contexto = canvasRef.current?.getContext("2d");
    if (!contexto || !posicao) return;

    contexto.lineTo(posicao.x, posicao.y);
    contexto.stroke();
    setAssinada(true);
  }

  function encerrarAssinatura() {
    desenhando.current = false;
  }

  function limparAssinatura() {
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext("2d");
    if (!canvas || !contexto) return;

    contexto.clearRect(0, 0, canvas.width, canvas.height);
    setAssinada(false);
  }

  return (
    <footer className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div className="w-full">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[10px] font-extrabold uppercase tracking-wide text-jc-navy">Assinatura / conferência</h2>
          <button
            type="button"
            onClick={limparAssinatura}
            className="print-ui cursor-pointer rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Limpar assinatura
          </button>
        </div>
        <p className="print-ui mt-1 text-[10px] text-slate-500">Assine abaixo usando o mouse ou a tela de toque.</p>
        <div className="mt-2 w-full max-w-3xl rounded-xl border-2 border-blue-200 bg-blue-50 p-2 shadow-inner sm:p-3">
          <canvas
            ref={canvasRef}
            width={1200}
            height={400}
            aria-label="Área para assinatura do cliente"
            onPointerDown={iniciarAssinatura}
            onPointerMove={continuarAssinatura}
            onPointerUp={encerrarAssinatura}
            onPointerCancel={encerrarAssinatura}
            className="h-40 w-full touch-none cursor-crosshair rounded-lg border border-slate-300 bg-white shadow-sm sm:h-48"
          />
        </div>
        <div className="print-ui mt-1 flex w-full max-w-3xl items-center justify-between gap-3">
          <span role="status" className="text-[10px] text-slate-500">
            {assinada ? "Assinatura pronta para o PDF." : "A assinatura é opcional."}
          </span>
        </div>
      </div>
      <p className="text-[9px] text-slate-500">Emitido em {emitidoEm}</p>
    </footer>
  );
}
