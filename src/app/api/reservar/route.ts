import { createReservation } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();

  const { nombre, apellido, cumpleanos, celular, email } = body;

  if (!nombre || !apellido || !cumpleanos || !celular || !email) {
    return Response.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
  }

  const result = await createReservation({ nombre, apellido, cumpleanos, celular, email });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 409 });
  }

  const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
  if (webhookUrl) {
    const params = new URLSearchParams({ nombre, apellido, cumpleanos, celular, email });
    fetch(`${webhookUrl}?${params.toString()}`, { method: "GET" }).catch(() => {});
  }

  return Response.json({ id: result.id });
}
