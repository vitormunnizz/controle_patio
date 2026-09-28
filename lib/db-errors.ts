export function isUniqueConstraintViolation(error: unknown): boolean {
  const visitados = new Set<unknown>();
  let atual = error;

  while (atual && typeof atual === "object" && !visitados.has(atual)) {
    visitados.add(atual);
    const erroBanco = atual as { code?: unknown; cause?: unknown };
    if (erroBanco.code === "23505") return true;
    atual = erroBanco.cause;
  }

  return false;
}
