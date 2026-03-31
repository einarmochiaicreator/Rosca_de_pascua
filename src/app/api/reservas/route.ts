import Database from "better-sqlite3";
import path from "path";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  // Simple auth — set ADMIN_KEY in .env.local
  const adminKey = process.env.ADMIN_KEY || "gustazo2026";
  if (key !== adminKey) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = new Database(path.join(process.cwd(), "rosca.db"));
  const rows = db.prepare("SELECT * FROM reservations ORDER BY created_at DESC").all();
  db.close();

  const format = url.searchParams.get("format");

  if (format === "xlsx") {
    const data = (rows as Array<Record<string, unknown>>).map((r) => ({
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
    const csvRows = (rows as Array<Record<string, unknown>>).map((r) =>
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
