"use client";

import { useEffect, useState } from "react";

export function AvisoChecklistSalvo() {
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setVisivel(false), 5000);
    return () => window.clearTimeout(temporizador);
  }, []);

  if (!visivel) return null;

  return (
    <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
      Checklist salvo.
    </p>
  );
}
