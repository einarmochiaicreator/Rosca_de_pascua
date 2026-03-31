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

  const sheetsWebhookUrl = process.env.SHEETS_WEBHOOK_URL;
  if (sheetsWebhookUrl) {
    const params = new URLSearchParams({ nombre, apellido, cumpleanos, celular, email });
    fetch(`${sheetsWebhookUrl}?${params.toString()}`, { method: "GET" }).catch(() => {});
  }

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, cumpleanos, celular, email }),
    }).catch(() => {});
  }

  const n8nSmsWebhookUrl = process.env.N8N_SMS_WEBHOOK_URL;
  if (n8nSmsWebhookUrl) {
    fetch(n8nSmsWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, cumpleanos, celular, email }),
    }).catch(() => {});
  }

  return Response.json({ id: result.id });
}
