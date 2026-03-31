"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const MP_LINK = "https://mpago.la/298b85F";

function GraciasContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center bg-cream">
      <div className="max-w-lg">
        <div className="text-7xl mb-6">🙌</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gold mb-4">
          ¡Ya casi es tuya!
        </h1>
        <p className="text-xl text-chocolate-light mb-8 leading-relaxed">
          Tu rosca está separada, pero necesitás completar el pago para confirmar la reserva.
        </p>

        <a
          href={MP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gold hover:bg-gold-light text-white font-black text-xl md:text-2xl px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-gold/20 mb-4"
        >
          Pagar con MercadoPago
        </a>

        <Link
          href={`/muchas-gracias?id=${id}`}
          className="block text-gold hover:text-gold-light font-bold text-lg mb-8 underline underline-offset-4"
        >
          Ya pagué ✓
        </Link>

        <div className="bg-white border-2 border-gold/20 rounded-2xl p-8 mb-8 text-left space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">📧</span>
            <p className="text-chocolate-light">
              Te estará llegando un <strong className="text-chocolate">email</strong> para recordarte el retiro.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">📅</span>
            <p className="text-chocolate-light">
              Se retiran <strong className="text-chocolate">este sábado 4 de abril de 12 a 14 hs</strong>, ¡RECIÉN HECHAS!
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
          ¿Tenés alguna duda? Escribinos por Instagram.
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

export default function GraciasPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-gold text-xl">Cargando...</p>
      </main>
    }>
      <GraciasContent />
    </Suspense>
  );
}
