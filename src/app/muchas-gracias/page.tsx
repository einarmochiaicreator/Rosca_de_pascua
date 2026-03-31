"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";

function MuchasGraciasContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const confirmed = useRef(false);

  useEffect(() => {
    if (!id || confirmed.current) return;
    confirmed.current = true;
    fetch("/api/confirmar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id) }),
    }).catch(() => {});
  }, [id]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center bg-cream">
      <div className="max-w-lg">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gold mb-4">
          ¡Muchas gracias!
        </h1>
        <p className="text-xl text-chocolate-light mb-8 leading-relaxed">
          Tu rosca de pascua está confirmada. Nos vemos el sábado.
        </p>

        <div className="bg-white border-2 border-gold/20 rounded-2xl p-8 mb-8 text-left space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">✅</span>
            <p className="text-chocolate-light">
              Tu pago fue registrado. <strong className="text-chocolate">Tu rosca está asegurada.</strong>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">📅</span>
            <p className="text-chocolate-light">
              Retirala <strong className="text-chocolate">este sábado 4 de abril de 12 a 14 hs</strong>, ¡RECIÉN HECHAS!
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">📧</span>
            <p className="text-chocolate-light">
              Te vamos a escribir por <strong className="text-chocolate">email</strong> y{" "}
              <strong className="text-chocolate">WhatsApp</strong> para recordarte.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">⚠️</span>
            <p className="text-chocolate-light">
              Recordá: si no la retirás en el horario indicado, <strong className="text-red">la perdés</strong>.
            </p>
          </div>
        </div>

        <p className="text-chocolate-light/60 text-sm">
          ¿Tenés alguna duda? Escribinos por Instagram o WhatsApp.
        </p>

        <Link
          href="/"
          className="inline-block mt-8 text-gold hover:text-gold-light text-sm"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}

export default function MuchasGraciasPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-gold text-xl">Cargando...</p>
      </main>
    }>
      <MuchasGraciasContent />
    </Suspense>
  );
}
