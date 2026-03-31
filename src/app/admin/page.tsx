"use client";

import { useEffect, useState } from "react";

const ADMIN_KEY = "gustazo2026";

interface Reservation {
  id: number;
  nombre: string;
  apellido: string;
  cumpleanos: string;
  celular: string;
  email: string;
  created_at: string;
  paid: number;
}

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reservas?key=${ADMIN_KEY}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar reservas");
        return r.json();
      })
      .then((data) => {
        setReservations(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const downloadXlsx = () => {
    window.open(`/api/reservas?key=${ADMIN_KEY}&format=xlsx`, "_blank");
  };

  const paid = reservations.filter((r) => r.paid);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-chocolate-light text-lg animate-pulse">Cargando reservas...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-red text-lg">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 bg-cream">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gold">Reservas de Rosca</h1>
            <p className="text-chocolate-light">
              {paid.length} pagadas · {reservations.length - paid.length} pendientes · {30 - paid.length} disponibles
            </p>
          </div>
          <button
            onClick={downloadXlsx}
            className="px-6 py-2 bg-white text-gold border border-gold/30 rounded-lg hover:bg-cream-dark transition-all cursor-pointer"
          >
            Descargar Excel
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-cream-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-dark text-left text-chocolate-light">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Nombre</th>
                <th className="py-3 px-3">Celular</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Cumpleaños</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b border-cream-dark hover:bg-cream-dark/30">
                  <td className="py-3 px-3 text-chocolate-light">{r.id}</td>
                  <td className="py-3 px-3 text-chocolate font-medium">{r.nombre} {r.apellido}</td>
                  <td className="py-3 px-3 text-chocolate-light">{r.celular}</td>
                  <td className="py-3 px-3 text-chocolate-light">{r.email}</td>
                  <td className="py-3 px-3 text-chocolate-light">{r.cumpleanos}</td>
                  <td className="py-3 px-3 text-chocolate-light">{r.created_at}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.paid ? "Pagada" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-chocolate-light/60">
                    No hay reservas todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
