"use client";

import { useState } from "react";
import Link from "next/link";

export default function DatosPage() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cumpleanos: "",
    celular: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allFilled = Object.values(form).every((v) => v.trim() !== "");

  const validate = (): string => {
    const nameRegex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]{2,}$/;
    if (!nameRegex.test(form.nombre.trim())) return "El nombre solo puede contener letras";
    if (!nameRegex.test(form.apellido.trim())) return "El apellido solo puede contener letras";

    const digits = form.celular.replace(/\D/g, "");
    if (digits.length < 10) return "El celular debe tener al menos 10 dígitos";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(form.email)) return "El email no es válido";

    if (!form.cumpleanos.trim()) return "Ingresá tu fecha de nacimiento";
    const dateMatch = form.cumpleanos.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!dateMatch) return "Ingresá la fecha como DD/MM/AAAA";
    const year = parseInt(dateMatch[3]);
    const currentYear = new Date().getFullYear();
    if (year > currentYear) return "La fecha de nacimiento no puede ser futura";
    if (year < 1900 || currentYear - year > 120) return "La fecha de nacimiento no es válida";

    return "";
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleCumpleanosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = raw;
    if (raw.length > 4) formatted = raw.slice(0, 2) + "/" + raw.slice(2, 4) + "/" + raw.slice(4);
    else if (raw.length > 2) formatted = raw.slice(0, 2) + "/" + raw.slice(2);
    setForm((prev) => ({ ...prev, cumpleanos: formatted }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!allFilled || loading) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al procesar la reserva");
        setLoading(false);
        return;
      }

      window.location.href = `/gracias?id=${data.id}`;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  };

  const fields = [
    { key: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre", max: undefined },
    { key: "apellido", label: "Apellido", type: "text", placeholder: "Tu apellido", max: undefined },
    { key: "cumpleanos", label: "Fecha de nacimiento", type: "text", placeholder: "DD/MM/AAAA", max: undefined },
    { key: "celular", label: "Celular (con código de área)", type: "tel", placeholder: "351 1234567", max: undefined },
    { key: "email", label: "Email", type: "email", placeholder: "tu@email.com", max: undefined },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-cream">
      <div className="max-w-lg w-full">
        <Link href="/reservar" className="text-gold hover:text-gold-light text-sm mb-8 inline-block">
          ← Volver
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-chocolate mb-2">
          Tus datos
        </h1>
        <p className="text-chocolate-light mb-10">
          Completá tus datos para reservar tu rosca de pascua.
        </p>

        <div className="space-y-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-chocolate-light mb-2">
                {f.label} <span className="text-red">*</span>
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={f.key === "cumpleanos" ? handleCumpleanosChange : (e) => handleChange(f.key, e.target.value)}
                inputMode={f.key === "cumpleanos" ? "numeric" : undefined}
                max={f.max}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-cream-dark text-chocolate placeholder-chocolate-light/40 focus:border-gold focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red/10 border border-red/30 rounded-xl text-red text-center">
            {error}
          </div>
        )}

        <button
          disabled={!allFilled || loading}
          onClick={handleSubmit}
          style={allFilled && !loading ? { background: "#2e7d32" } : {}}
          className={`w-full mt-8 py-4 rounded-full text-xl font-bold transition-all duration-300 ${
            allFilled && !loading
              ? "text-white hover:scale-[1.02] shadow-lg cursor-pointer"
              : "bg-cream-dark text-chocolate-light/40 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </span>
          ) : (
            "Siguiente →"
          )}
        </button>
      </div>
    </main>
  );
}
