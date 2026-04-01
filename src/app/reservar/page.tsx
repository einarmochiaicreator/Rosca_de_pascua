"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const conditionsReserva = [
  {
    id: "pagar",
    text: "Voy a pagar hoy para reservar mi rosca",
  },
  {
    id: "retiro",
    text: "Entiendo que las roscas se entregan recién hechas este sábado 4 de abril de 12 a 14 hs y voy a ir a retirarla. De lo contrario, la pierdo.",
  },
];

const conditionsLista = [
  {
    id: "avisar",
    text: "Quiero que me avisen cuando Gustazo Gluten Free lance un nuevo producto en edición limitada.",
  },
];

function ReservarContent() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLista = searchParams.get("lista") === "true";

  const conditions = isLista ? conditionsLista : conditionsReserva;
  const allChecked = conditions.every((c) => checked[c.id]);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-cream">
      <div className="max-w-lg w-full">
        <Link href="/" className="text-gold hover:text-gold-light text-sm mb-8 inline-block">
          ← Volver
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-chocolate mb-2">
          {isLista ? "Anotate para la próxima edición" : "Antes de reservar"}
        </h1>
        <p className="text-chocolate-light mb-10">
          {isLista
            ? "Las roscas de esta edición ya se agotaron. Dejá tus datos y te avisamos cuando lancemos el próximo producto en edición limitada."
            : "Necesitamos que confirmes lo siguiente para continuar:"}
        </p>

        <div className="space-y-4 mb-10">
          {conditions.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              style={checked[c.id] ? { borderColor: "#2e7d32", background: "rgba(46,125,50,0.08)", color: "#1b5e20" } : {}}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                checked[c.id]
                  ? "text-chocolate"
                  : "border-cream-dark bg-white text-chocolate-light hover:border-green-700/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  style={checked[c.id] ? { borderColor: "#2e7d32", background: "#2e7d32" } : {}}
                  className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checked[c.id] ? "" : "border-chocolate-light/30"
                  }`}
                >
                  {checked[c.id] && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-lg leading-relaxed">{c.text}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          disabled={!allChecked}
          onClick={() => router.push(`/datos${isLista ? "?lista=true" : ""}`)}
          style={allChecked ? { background: isLista ? "#b45309" : "#2e7d32" } : {}}
          className={`w-full py-4 rounded-full text-xl font-bold transition-all duration-300 ${
            allChecked
              ? "text-white hover:scale-[1.02] shadow-lg cursor-pointer"
              : "bg-cream-dark text-chocolate-light/40 cursor-not-allowed"
          }`}
        >
          {allChecked ? "Continuar →" : "Aceptá las condiciones para continuar"}
        </button>
      </div>
    </main>
  );
}

export default function ReservarPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-gold text-xl">Cargando...</p>
      </main>
    }>
      <ReservarContent />
    </Suspense>
  );
}
