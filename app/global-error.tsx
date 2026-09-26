"use client";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif" }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1>Algo não saiu como esperado</h1>
            <p>Não conseguimos abrir o sistema agora. Tente novamente em instantes.</p>
            <button onClick={retry} style={{ marginTop: 16, padding: "12px 20px", cursor: "pointer" }}>
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
