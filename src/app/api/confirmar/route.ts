import { markAsPaid } from "@/lib/db";

export async function POST(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return Response.json({ error: "ID requerido" }, { status: 400 });
  }

  await markAsPaid(String(id), "pending-mp");

  return Response.json({ ok: true });
}
