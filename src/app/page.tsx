"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.2) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}

function StockBar({ sold, total }: { sold: number; total: number }) {
  const available = total - sold;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <div ref={ref} className="w-full mx-auto">
      <div
        className={`grid grid-cols-6 md:grid-cols-10 gap-1 transition-opacity duration-700 ${inView ? "opacity-100" : "opacity-0"}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <Image
            key={i}
            src="/rosca33_nobg.png"
            alt="rosca"
            width={72}
            height={72}
            className="w-full h-auto object-contain transition-all duration-500"
            style={{ opacity: i >= sold ? 1 : 0.2, filter: i >= sold ? "none" : "grayscale(1)" }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs mt-3 text-chocolate-light">
        <span>{sold} reservadas</span>
        <span>{available} disponibles</span>
      </div>
      {available <= 5 && available > 0 && (
        <p className="text-red text-center mt-2 font-bold animate-pulse">
          ¡Últimas {available} unidades!
        </p>
      )}
      {available === 0 && (
        <p className="text-red text-center mt-2 font-bold">¡AGOTADAS!</p>
      )}
    </div>
  );
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setCount(current);
    }, 30);
    return () => clearInterval(interval);
  }, [inView, target]);

  return <span ref={ref}>{count}</span>;
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
    >
      {children}
    </section>
  );
}

/* ── Testimonial Carousel (scroll-hijack) ── */
function TestimonialCarousel({ items }: { items: string[] }) {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const locked = useRef(false);
  const cooldown = useRef(false);
  const touchStartY = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Scroll-hijack: when section is in view, capture wheel/touch to rotate items
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const advance = (dir: 1 | -1) => {
      if (cooldown.current) return;
      cooldown.current = true;
      setTimeout(() => { cooldown.current = false; }, 500);

      const cur = activeRef.current;
      const next = cur + dir;

      // If going past the last item or before the first, release scroll
      if (next >= items.length || next < 0) {
        locked.current = false;
        return;
      }

      setActive(next);
    };

    const onWheel = (e: WheelEvent) => {
      if (!locked.current) {
        // Check if section is centered enough to lock
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        const sectionCenter = rect.top + rect.height / 2;
        const screenCenter = viewH / 2;
        if (Math.abs(sectionCenter - screenCenter) < viewH * 0.4) {
          locked.current = true;
        } else {
          return;
        }
      }

      if (Math.abs(e.deltaY) > 5) {
        e.preventDefault();
        advance(e.deltaY > 0 ? 1 : -1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!locked.current) {
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        const sectionCenter = rect.top + rect.height / 2;
        const screenCenter = viewH / 2;
        if (Math.abs(sectionCenter - screenCenter) < viewH * 0.4) {
          locked.current = true;
        } else {
          return;
        }
      }

      const diff = touchStartY.current - e.touches[0].clientY;
      if (Math.abs(diff) > 30) {
        e.preventDefault();
        advance(diff > 0 ? 1 : -1);
        touchStartY.current = e.touches[0].clientY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className="relative h-[500px] flex items-center justify-center overflow-hidden"
    >
      {items.map((src, i) => {
        const offset = i - active;
        const absOffset = Math.abs(offset);
        const isActive = offset === 0;
        let adjustedOffset = offset;
        if (offset > items.length / 2) adjustedOffset = offset - items.length;
        if (offset < -items.length / 2) adjustedOffset = offset + items.length;
        const absAdj = Math.abs(adjustedOffset);

        return (
          <div
            key={i}
            onClick={() => setActive(i)}
            className="absolute cursor-pointer transition-all duration-500 ease-out"
            style={{
              transform: `translateY(${adjustedOffset * 80}px) scale(${isActive ? 1 : 0.7 - absAdj * 0.05})`,
              opacity: isActive ? 1 : Math.max(0.15, 0.4 - absAdj * 0.1),
              zIndex: isActive ? 10 : 5 - absOffset,
              filter: isActive ? "none" : "blur(1px)",
            }}
          >
            <div className={`rounded-2xl overflow-hidden shadow-xl transition-shadow duration-500 ${
              isActive ? "shadow-gold/30 ring-2 ring-gold/40" : ""
            }`} style={{ width: isActive ? "min(340px, 85vw)" : "min(260px, 65vw)" }}>
              <Image
                src={src}
                alt={`Testimonio ${i + 1}`}
                width={400}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>
        );
      })}

      {/* Navigation dots */}
      <div className="absolute bottom-2 flex gap-2 z-20">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === active ? "bg-gold scale-125" : "bg-chocolate-light/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CTAButton({ available }: { available: number }) {
  if (available > 0) {
    return (
      <div className="pt-4 text-center">
        <Link
          href="/reservar"
          className="inline-block text-white font-black text-xl md:text-2xl px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 shake-hover shadow-lg"
          style={{ background: "#2e7d32" }}
        >
          Quiero reservarla
        </Link>
        <p className="mt-4 text-chocolate-light/60 text-sm">
          Quedan {available} disponibles
        </p>
      </div>
    );
  }
  return (
    <div className="pt-4 text-center">
      <Link
        href="/reservar?lista=true"
        className="inline-block text-white font-black text-xl md:text-2xl px-12 py-5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
        style={{ background: "#b45309" }}
      >
        Avisame de futuras ediciones limitadas
      </Link>
      <p className="mt-4 text-chocolate-light/60 text-sm">
        Las roscas se agotaron, pero podés dejar tus datos y te avisamos.
      </p>
    </div>
  );
}

const PRICE_REAL = 12600;
const PRICE_FAKE = Math.round(PRICE_REAL * 1.5);

const testimonios = [
  "/testimonios/Brendan Cairney.png",
  "/testimonios/Maria Pia.png",
  "/testimonios/Elida Aguero.png",
  "/testimonios/Rodrigo Acosta.png",
  "/testimonios/Florencia Kolman.png",
  "/testimonios/Meel.png",
  "/testimonios/Carina Bracamonte.png",
];

export default function Home() {
  const [stock, setStock] = useState({ total: 30, sold: 0, available: 30 });

  useEffect(() => {
    fetch("/api/stock")
      .then((r) => r.json())
      .then(setStock)
      .catch(() => {});
  }, []);

  return (
    <main className="flex flex-col items-center bg-cream">
      {/* HERO */}
      <section className="w-full pt-10 pb-6 text-center px-6">
        <div className="max-w-md md:max-w-2xl mx-auto">
          <Image
            src="/logo-gustazo.png"
            alt="Gustazo Gluten Free"
            width={300}
            height={300}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-chocolate mb-2">
            Roscas de Pascuas
          </h1>
          <p className="text-lg md:text-xl text-chocolate-light mb-6">
            Edición limitada
          </p>

          {/* Stock counter */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 w-full mb-6 shadow-sm">
            <p className="text-2xl font-bold text-chocolate mb-2">
              Quedan <span className="text-gold"><AnimatedCounter target={stock.available} /></span> de {stock.total}
            </p>
            <StockBar sold={stock.sold} total={stock.total} />
          </div>

          <CTAButton available={stock.available} />

          {/* Arrow */}
          <div className="animate-bounce">
            <svg className="w-6 h-6 mx-auto text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Rosca image — liquid glass frame */}
          <div className="mt-6">
            <div
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(18px) saturate(1.6)",
                WebkitBackdropFilter: "blur(18px) saturate(1.6)",
                border: "1.5px solid rgba(255,255,255,0.45)",
                borderRadius: "2rem",
                boxShadow: "0 8px 40px rgba(180,145,46,0.13), 0 1.5px 0 rgba(255,255,255,0.6) inset",
                padding: "18px",
              }}
            >
              <Image
                src="/rosca2.png"
                alt="Rosca de Pascua Gustazo Gluten Free"
                width={800}
                height={800}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPCIÓN */}
      <Section className="py-16 px-6 max-w-md md:max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-chocolate">
          Una rosca que no vas a encontrar en ningún otro lado
        </h2>
        <div className="space-y-5 text-lg text-chocolate-light leading-relaxed text-left">
          <p>
            Masa brioche que cede apenas la tocás: suave, aireada, con ese perfume a vainilla, azahar y cascara de limón que llega antes de que la veas.
          </p>
          <p>
            Adentro, <strong className="text-chocolate">crema pastelera</strong>. Sedosa, cremosa en el punto justo,
            con ese sabor que te lleva directo a una receta hecha en casa.
          </p>
          <p>
            Arriba, <strong className="text-chocolate">dulce de leche repostero</strong> de primera calidad que no empalaga,
            profundo, con ese caramelo oscuro que se mezcla con la crema y te obliga a cerrar los ojos.
          </p>
          <p>
            Y después, la fiesta: <strong className="text-chocolate">cerezas al marraschino</strong> rojas como rubíes,{" "}
            <strong className="text-chocolate">cáscaras de naranja confitadas</strong> con su amargor dulce y brillante,
            y el crujido delicado de la <strong className="text-chocolate">azúcar perlada</strong> que estalla entre los dientes.
          </p>
          <p className="text-center text-xl font-bold text-gold pt-2">
            Todo sin gluten y con todo el sabor que merecés.
          </p>
        </div>
      </Section>

      {/* PRECIO */}
      <Section className="py-16 px-6 text-center bg-white/50 w-full">
        <div className="max-w-xl mx-auto">
          <p className="text-chocolate-light text-lg mb-3">Precio de mercado</p>
          <p className="text-5xl md:text-6xl font-bold animate-strike mb-6" style={{ color: "rgba(192,57,43,0.45)" }}>
            ${PRICE_FAKE.toLocaleString("es-AR")}
          </p>
          <p className="text-chocolate-light text-lg mb-2">Precio especial si reservás ahora</p>
          <p className="text-6xl md:text-7xl font-black" style={{ color: "#2e7d32" }}>
            ${PRICE_REAL.toLocaleString("es-AR")}
          </p>
          <div className="mt-4 inline-block rounded-full px-6 py-2" style={{ background: "rgba(46,125,50,0.1)", border: "1px solid rgba(46,125,50,0.3)" }}>
            <span className="font-bold text-xl" style={{ color: "#388e3c" }}>
              ¡Ahorrás ${(PRICE_FAKE - PRICE_REAL).toLocaleString("es-AR")}!
            </span>
          </div>
          <CTAButton available={stock.available} />
        </div>
      </Section>

      {/* ESCASEZ */}
      <Section className="py-20 px-6 text-center w-full">
        <div className="max-w-md md:max-w-2xl mx-auto">
          <div className="border-2 border-gold/20 rounded-2xl p-6 bg-white/40">
            <p className="text-lg md:text-2xl font-black text-chocolate leading-tight">
              Sólo se harán{" "}
              <span className="text-gold text-xl md:text-3xl">30</span>{" "}
              roscas este año,
            </p>
            <p className="text-lg md:text-2xl font-black text-red mt-2">
              ni una más.
            </p>
            <div className="mt-8">
              <StockBar sold={stock.sold} total={stock.total} />
            </div>
          </div>
        </div>
      </Section>

      {/* TESTIMONIOS */}
      <Section className="py-16 px-6 w-full bg-cream-dark/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-chocolate">
            Lo que dicen nuestros clientes
          </h2>
          <TestimonialCarousel items={testimonios} />
        </div>
      </Section>

      {/* MENSAJES FINALES + CTA */}
      <Section className="py-20 px-6 text-center w-full">
        <div className="max-w-2xl mx-auto space-y-10">
          <p className="text-lg md:text-xl leading-relaxed text-chocolate-light">
            Si conoces a{" "}
            <span className="text-gold font-bold">Gustazo</span>, no te vas a querer perder la oportunidad de probarla.
          </p>
          <p className="text-lg md:text-xl leading-relaxed text-chocolate-light">
            Si no nos conocés,{" "}
            <span className="text-gold font-bold">esta es tu oportunidad de hacerlo.</span>
          </p>

          <CTAButton available={stock.available} />
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-chocolate-light/40 text-sm border-t border-gold/10 w-full">
        <p>© {new Date().getFullYear()} Gustazo Gluten Free · Todos los derechos reservados</p>
      </footer>
    </main>
  );
}
