import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // No desenvolvimento local a aplicação continua acessível sem configuração extra.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const username = process.env.SITE_USERNAME;
  const password = process.env.SITE_PASSWORD;

  // Falha fechada para impedir que os dados da oficina fiquem públicos por engano.
  if (!username || !password) {
    return new NextResponse("Acesso ainda não configurado. Defina SITE_USERNAME e SITE_PASSWORD na Netlify.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const authorization = request.headers.get("authorization") ?? "";
  let supplied = "";
  if (authorization.startsWith("Basic ")) {
    try {
      const binary = atob(authorization.slice(6));
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      supplied = new TextDecoder().decode(bytes);
    } catch {
      supplied = "";
    }
  }
  const separator = supplied.indexOf(":");
  const suppliedUsername = separator >= 0 ? supplied.slice(0, separator) : "";
  const suppliedPassword = separator >= 0 ? supplied.slice(separator + 1) : "";

  if (suppliedUsername !== username || suppliedPassword !== password) {
    return new NextResponse("Autenticação necessária", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="JC Pneus - Gestão", charset="UTF-8"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/media/:path*",
    "/uploads/:path*",
    "/((?!_next/static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
