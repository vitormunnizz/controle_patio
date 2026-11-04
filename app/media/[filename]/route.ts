import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (!/^VEICULO_\d+_\d+\.webp$/.test(filename)) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  try {
    const image = await getStore("vehicle-photos").get(filename, { type: "arrayBuffer" });
    if (!image) return new NextResponse("Não encontrado", { status: 404 });

    return new NextResponse(image, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Falha ao carregar foto do veículo:", error);
    return new NextResponse("Não foi possível carregar a foto", { status: 503 });
  }
}
