import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

const BASE_ID = "appdSEBglIwFE2h0D";
const TABLE_ID = "tbl9UwkQStPKYH4J3";
const TABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

async function getAllReservations() {
  const records: Record<string, unknown>[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({
      "sort[0][field]": "Fecha reserva",
      "sort[0][direction]": "desc",
    });
    if (offset) params.set("offset", offset);

    const res = await fetch(`${TABLE_URL}?${params}`, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_TOKEN}` },
    });
    const data = await res.json();
    for (const r of data.records ?? []) {
      records.push({
        id: r.id,
        nombre: r.fields.Nombre,
        apellido: r.fields.Apellido,
        cumpleanos: r.fields["Fecha de nacimiento"],
        celular: r.fields.Celular,
        email: r.fields.Email,
        created_at: r.fields["Fecha reserva"],
        paid: r.fields.Pagado ? 1 : 0,
        mp_payment_id: r.fields["MP Payment ID"] ?? "",
      });
    }
    offset = data.offset;
  } while (offset);

  return records;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  const adminKey = process.env.ADMIN_KEY || "gustazo2026";
  if (key !== adminKey) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await getAllReservations();
  const format = url.searchParams.get("format");

  if (format === "xlsx") {
    const data = rows.map((r) => ({
      ID: r.id,
      Nombre: r.nombre,
      Apellido: r.apellido,
      Cumpleaños: r.cumpleanos,
      Celular: r.celular,
      Email: r.email,
      "Fecha de reserva": r.created_at,
      Pagado: r.paid ? "Sí" : "No",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reservas");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=reservas-rosca.xlsx",
      },
    });
  }

  if (format === "csv") {
    const header = "ID,Nombre,Apellido,Cumpleaños,Celular,Email,Fecha,Pagado";
    const csvRows = rows.map((r) =>
      `${r.id},"${r.nombre}","${r.apellido}","${r.cumpleanos}","${r.celular}","${r.email}","${r.created_at}",${r.paid ? "Sí" : "No"}`
    );
    const csv = [header, ...csvRows].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=reservas-rosca.csv",
      },
    });
  }

  return Response.json(rows);
}
