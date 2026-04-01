"use client";

import Link from "next/link";

export default function ListaGraciasPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center bg-cream">
      <div className="max-w-lg">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gold mb-4">
          ¡Te anotamos!
        </h1>
        <p className="text-xl text-chocolate-light mb-8 leading-relaxed">
          Cuando lancemos el próximo producto en edición limitada, vas a ser de los primeros en enterarte.
        </p>

        <div className="bg-white border-2 border-gold/20 rounded-2xl p-8 mb-8 text-left space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">📧</span>
            <p className="text-chocolate-light">
              Te vamos a contactar por <strong className="text-chocolate">email y celular</strong> cuando haya novedades.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-gold text-xl">⚡</span>
            <p className="text-chocolate-light">
              Las ediciones limitadas se agotan rápido — al estar anotado,{" "}
              <strong className="text-chocolate">tenés ventaja</strong> para reservar antes que el resto.
            </p>
          </div>
        </div>

        <p className="text-chocolate-light/60 text-sm mb-8">
          ¿Tenés alguna duda? Escribinos por Instagram.
        </p>

        <Link
          href="/"
          className="inline-block mt-2 text-gold hover:text-gold-light text-sm"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
