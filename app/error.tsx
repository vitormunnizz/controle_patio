"use client";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-black">Algo não saiu como esperado</h1>
        <p className="mt-2 text-sm text-slate-600">
          Não conseguimos abrir esta página agora. Tente novamente em instantes.
        </p>
        <button
          onClick={retry}
          className="mt-6 rounded-xl bg-jc-navy px-5 py-3 text-sm font-bold text-white"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
