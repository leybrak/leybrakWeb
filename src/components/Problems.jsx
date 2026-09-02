import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useProblemCards } from '../hooks/useProblemCards';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_PROBLEMS = [
  {
    id: '01',
    quote: 'No sé cuánto\nvendí hoy.',
    context: 'Al final del día tienes la caja llena pero no sabes de dónde vino cada peso.',
    who: 'Restaurante · Tienda · Bodega',
  },
  {
    id: '02',
    quote: 'Siempre me\nfalta stock.',
    context: 'Descubres que te quedaste sin producto cuando el cliente ya está parado frente a ti.',
    who: 'Retail · Farmacia · Ferretería',
  },
  {
    id: '03',
    quote: 'Todo lo anoto\nen un cuaderno.',
    context: 'Entre tachones, páginas arrancadas y letras ilegibles, la información se pierde.',
    who: 'Hostal · Peluquería · Taller',
  },
  {
    id: '04',
    quote: 'Mis empleados\nme fallan y no me entero.',
    context: 'Sin registro digital no sabes qué pasó en tu negocio cuando no estabas.',
    who: 'Cualquier negocio con personal',
  },
];

const Problems = () => {
  const sectionRef   = useRef(null);
  const labelRef     = useRef(null);
  const headingRef   = useRef(null);
  const subRef       = useRef(null);
  const cardsRef     = useRef([]);
  const ctaRef       = useRef(null);
  const { settings } = useSiteSettings();
  const { cards: fetchedCards } = useProblemCards();
  const PROBLEMS = fetchedCards.length > 0 ? fetchedCards : DEFAULT_PROBLEMS;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Label + heading entrada ──────────────────────────────────────────
      gsap.fromTo(
        [labelRef.current, headingRef.current, subRef.current],
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      // ── Tarjetas: cada una entra con un micro-skew brutal ────────────────
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 60,
            skewY: i % 2 === 0 ? 2 : -2,
          },
          {
            opacity: 1,
            y: 0,
            skewY: 0,
            duration: 0.55,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
          }
        );

        // Hover: la tarjeta "vibra" de dolor al hacer hover
        const handleEnter = () => {
          gsap.to(card, {
            x: gsap.utils.random(-3, 3),
            y: gsap.utils.random(-2, 2),
            duration: 0.08,
            repeat: 3,
            yoyo: true,
            ease: 'none',
            onComplete: () => gsap.set(card, { x: 0, y: 0 }),
          });
        };
        card.addEventListener('mouseenter', handleEnter);
        card._cleanup = () => card.removeEventListener('mouseenter', handleEnter);
      });

      // ── CTA final ────────────────────────────────────────────────────────
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.94 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 90%',
          },
        }
      );
    }, sectionRef);

    return () => {
      cardsRef.current.forEach(c => c?._cleanup?.());
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 overflow-hidden bg-gray-900 dark:bg-[#050507]"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      {/* Cuadrícula invertida (blanca sobre oscuro) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Número de sección decorativo */}
      <div
        className="absolute top-12 right-8 text-white/5 font-black text-[120px] leading-none select-none pointer-events-none"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >02</div>

      {/* Cruces */}
      <span className="absolute top-10 left-8 text-white/20 font-mono text-sm select-none">+</span>
      <span className="absolute bottom-10 right-10 text-white/20 font-mono text-sm select-none">+</span>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Encabezado ──────────────────────────────────────────────────── */}
        <div className="mb-16">
          <div ref={labelRef} className="mb-5">
            <span
              className="inline-flex items-center gap-2 bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {settings.problems_label}
            </span>
          </div>

          <h2
            ref={headingRef}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white mb-6"
          >
            {settings.problems_heading_start}{' '}
            <span
              className="inline-block -skew-x-3 bg-leybrak-blue px-3 pb-1"
            >
              {settings.problems_heading_highlight}
            </span>
          </h2>

          <p
            ref={subRef}
            className="text-gray-400 text-[1rem] max-w-lg leading-relaxed border-l-2 border-gray-700 pl-4"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            {settings.problems_subtitle}
          </p>
        </div>

        {/* ── Grid de tarjetas ─────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l-2 border-t-2 border-white/10">
          {PROBLEMS.map((p, i) => (
            <div
              key={p.id}
              ref={el => cardsRef.current[i] = el}
              className="relative border-r-2 border-b-2 border-white/10 p-8 flex flex-col justify-between group cursor-default"
              style={{ minHeight: '280px' }}
            >
              {/* Número */}
              <span
                className="text-[11px] font-bold font-mono text-white/20 tracking-[0.2em] mb-6 block"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Quote — el dolor */}
              <blockquote
                className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-black uppercase leading-[0.95] tracking-tight text-white mb-6 flex-1"
                style={{ whiteSpace: 'pre-line' }}
              >
                {/* Comillas de apertura estilo graffiti */}
                <span
                  className="text-leybrak-blue text-[3rem] leading-none block mb-[-8px]"
                  aria-hidden="true"
                >
                  "
                </span>
                {p.quote}
              </blockquote>

              {/* Contexto */}
              <p
                className="text-[0.82rem] text-gray-500 leading-relaxed mb-5"
                style={{ fontFamily: "'Barlow', sans-serif" }}
              >
                {p.context}
              </p>

              {/* Tag de rubro */}
              <span
                className="text-[10px] font-bold tracking-[0.15em] uppercase text-leybrak-blue font-mono border-t border-white/10 pt-4 block"
              >
                {p.who}
              </span>

              {/* Hover: línea inferior que crece */}
              <div className="absolute bottom-0 left-0 h-[3px] bg-leybrak-blue w-0 group-hover:w-full transition-all duration-300 ease-out" />
            </div>
          ))}
        </div>

        <div ref={ctaRef} className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t-2 border-white/10 pt-10">
          <p
            className="text-white text-[1.2rem] font-black uppercase tracking-tight max-w-md"
          >
            {settings.problems_cta_start}{' '}
            <span className="text-leybrak-blue">{settings.problems_cta_highlight}</span>
          </p>
        </div>

      </div>
    </section>
  );
};

export default Problems;