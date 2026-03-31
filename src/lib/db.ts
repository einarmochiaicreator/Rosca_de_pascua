import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "rosca.db");
const TOTAL_STOCK = 30;

function getDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      cumpleanos TEXT NOT NULL,
      celular TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      paid INTEGER DEFAULT 0,
      mp_payment_id TEXT
    )
  `);

  return db;
}

export function getStock() {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as sold FROM reservations WHERE paid = 1").get() as { sold: number };
  db.close();
  return {
    total: TOTAL_STOCK,
    sold: row.sold,
    available: TOTAL_STOCK - row.sold,
  };
}

export function createReservation(data: {
  nombre: string;
  apellido: string;
  cumpleanos: string;
  celular: string;
  email: string;
}) {
  const db = getDb();
  const stock = db.prepare("SELECT COUNT(*) as sold FROM reservations WHERE paid = 1").get() as { sold: number };

  if (stock.sold >= TOTAL_STOCK) {
    db.close();
    return { error: "No quedan roscas disponibles" };
  }

  const result = db.prepare(
    "INSERT INTO reservations (nombre, apellido, cumpleanos, celular, email) VALUES (?, ?, ?, ?, ?)"
  ).run(data.nombre, data.apellido, data.cumpleanos, data.celular, data.email);

  db.close();
  return { id: result.lastInsertRowid };
}

export function markAsPaid(id: number, mpPaymentId: string) {
  const db = getDb();
  db.prepare("UPDATE reservations SET paid = 1, mp_payment_id = ? WHERE id = ?").run(mpPaymentId, id);
  db.close();
}

export function getReservation(id: number) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id);
  db.close();
  return row;
}
