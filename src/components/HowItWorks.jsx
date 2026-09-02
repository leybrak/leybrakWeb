import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Settings, ArrowRight, Check } from 'lucide-react';
import { useScrollTo } from '../hooks/useScrollTo';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useContentItems } from '../hooks/useContentItems';
gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SAAS_STEPS = [
  {
    num: '01',
    title: 'Elige tu producto',
    desc: 'POS, inventario, reservas... tenemos módulos listos para el tipo de negocio que tienes.',
  },
  {
    num: '02',
    title: 'Lo configuramos juntos',
    desc: 'En menos de 48 horas dejamos todo listo con tus productos, precios y equipo.',
  },
  {
    num: '03',
    title: 'Empiezas desde el día 1',
    desc: 'Te acompañamos los primeros días para que tú y tu equipo lo dominen sin estrés.',
  },
];

const DEFAULT_CUSTOM_STEPS = [
  {
    num: '01',
    title: 'Diagnóstico gratis',
    desc: 'Nos sentamos contigo, entendemos cómo trabajas y detectamos dónde estás perdiendo tiempo o plata.',
  },
  {
    num: '02',
    title: 'Diseñamos la solución',
    desc: 'Te presentamos exactamente qué vamos a construir, cuánto cuesta y en cuánto tiempo.',
  },
  {
    num: '03',
    title: 'Desarrollamos sin sorpresas',
    desc: 'Fechas claras, avances visibles. Tú ves el progreso semana a semana.',
  },
  {
    num: '04',
    title: 'Lanzamos y capacitamos',
    desc: 'Tu equipo aprende a usarlo antes del lanzamiento. Salimos en vivo cuando estés listo.',
  },
];

const HowItWorks = () => {
  const sectionRef   = useRef(null);
  const labelRef     = useRef(null);
  const headingRef   = useRef(null);
  const saasCardRef  = useRef(null);
  const customCardRef= useRef(null);
  const saasStepsRef = useRef([]);
  const customStepsRef = useRef([]);
  const dividerRef   = useRef(null);
  const [activeTrack, setActiveTrack] = useState(null);
  const scrollTo = useScrollTo();
  const { settings } = useSiteSettings();
  const { items: fetchedSaasSteps }   = useContentItems('/api/saas-steps');
  const { items: fetchedCustomSteps } = useContentItems('/api/custom-steps');
  const toSteps = (items) => items.map((it, i) => ({ num: String(i + 1).padStart(2, '0'), title: it.title, desc: it.description }));
  const SAAS_STEPS   = fetchedSaasSteps.length > 0   ? toSteps(fetchedSaasSteps)   : DEFAULT_SAAS_STEPS;
  const CUSTOM_STEPS = fetchedCustomSteps.length > 0 ? toSteps(fetchedCustomSteps) : DEFAULT_CUSTOM_STEPS;

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Encabezado ───────────────────────────────────────────────────────
      gsap.fromTo(
        [labelRef.current, headingRef.current],
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.55,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      // ── Tarjetas entran desde sus lados ──────────────────────────────────
      gsap.fromTo(saasCardRef.current,
        { opacity: 0, x: -48, skewX: -2 },
        {
          opacity: 1, x: 0, skewX: 0,
          duration: 0.65, ease: 'power4.out',
          scrollTrigger: { trigger: saasCardRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(dividerRef.current,
        { opacity: 0, scaleY: 0 },
        {
          opacity: 1, scaleY: 1,
          duration: 0.4, ease: 'power2.out',
          scrollTrigger: { trigger: dividerRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(customCardRef.current,
        { opacity: 0, x: 48, skewX: 2 },
        {
          opacity: 1, x: 0, skewX: 0,
          duration: 0.65, ease: 'power4.out',
          scrollTrigger: { trigger: customCardRef.current, start: 'top 80%' },
        }
      );

      // ── Pasos SaaS: revelan en secuencia ─────────────────────────────────
      saasStepsRef.current.forEach((step, i) => {
        if (!step) return;
        const line = step.querySelector('.step-line');
        gsap.fromTo(step,
          { opacity: 0, x: -20 },
          {
            opacity: 1, x: 0,
            duration: 0.4,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: saasCardRef.current, start: 'top 72%' },
          }
        );
        if (line) {
          gsap.fromTo(line,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.3,
              delay: i * 0.08 + 0.25,
              ease: 'power2.out',
              transformOrigin: 'top center',
              scrollTrigger: { trigger: saasCardRef.current, start: 'top 72%' },
            }
          );
        }
      });

      // ── Pasos Custom: revelan en secuencia ───────────────────────────────
      customStepsRef.current.forEach((step, i) => {
        if (!step) return;
        const line = step.querySelector('.step-line');
        gsap.fromTo(step,
          { opacity: 0, x: 20 },
          {
            opacity: 1, x: 0,
            duration: 0.4,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: customCardRef.current, start: 'top 72%' },
          }
        );
        if (line) {
          gsap.fromTo(line,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.3,
              delay: i * 0.08 + 0.25,
              ease: 'power2.out',
              transformOrigin: 'top center',
              scrollTrigger: { trigger: customCardRef.current, start: 'top 72%' },
            }
          );
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Hover: el track activo se "ilumina", el otro se opaca
  const handleTrackEnter = (track) => setActiveTrack(track);
  const handleTrackLeave = () => setActiveTrack(null);

  const saasOpacity  = activeTrack === 'custom' ? 'opacity-40' : 'opacity-100';
  const customOpacity= activeTrack === 'saas'   ? 'opacity-40' : 'opacity-100';

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 overflow-hidden bg-leybrak-light dark:bg-leybrak-dark transition-colors duration-300"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      {/* Cuadrícula de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(128,128,128,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128,128,128,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Número decorativo */}
      <div
        className="absolute top-12 right-8 text-gray-900/5 dark:text-white/5 font-black text-[120px] leading-none select-none pointer-events-none"
      >03</div>

      <span className="absolute top-10 left-8 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">+</span>
      <span className="absolute bottom-10 right-10 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">+</span>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Encabezado ────────────────────────────────────────────────── */}
        <div className="mb-16">
          <div ref={labelRef} className="mb-5">
            <span
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold"
            >
              {settings.howitworks_label}
            </span>
          </div>

          <h2
            ref={headingRef}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight text-gray-900 dark:text-white"
          >
            {settings.howitworks_heading_start}{' '}
            <span className="inline-block -skew-x-3 bg-leybrak-blue text-white px-3 pb-1">
              {settings.howitworks_heading_highlight}
            </span>
          </h2>
        </div>

        {/* ── Dos tracks ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-0 items-start">

          {/* ── TRACK SaaS ─────────────────────────────────────────────── */}
          <div
            ref={saasCardRef}
            className={`border-2 border-gray-900 dark:border-white transition-opacity duration-300 ${saasOpacity}`}
            onMouseEnter={() => handleTrackEnter('saas')}
            onMouseLeave={handleTrackLeave}
          >
            {/* Header tarjeta */}
            <div className="bg-leybrak-blue px-8 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-white" />
                  <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase font-mono">
                    {settings.howitworks_saas_badge}
                  </span>
                </div>
                <p className="text-white/80 text-[0.82rem]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  {settings.howitworks_saas_subtitle}
                </p>
              </div>
              <div className="text-white/20 font-black text-5xl leading-none">A</div>
            </div>

            {/* Pasos */}
            <div className="px-8 py-8 bg-white dark:bg-[#0f0f12]">
              {SAAS_STEPS.map((step, i) => (
                <div
                  key={step.num}
                  ref={el => saasStepsRef.current[i] = el}
                  className="flex gap-5 relative"
                >
                  {/* Línea conectora vertical */}
                  {i < SAAS_STEPS.length - 1 && (
                    <div
                      className="step-line absolute left-[19px] top-[38px] w-[2px] bg-gray-200 dark:bg-gray-800"
                      style={{ height: '48px' }}
                    />
                  )}

                  {/* Número burbuja */}
                  <div className="flex-shrink-0 w-10 h-10 bg-leybrak-blue flex items-center justify-center font-mono font-bold text-white text-[12px] relative z-10">
                    {step.num}
                  </div>

                  <div className="pb-10">
                    <p className="text-gray-900 dark:text-white font-black uppercase text-[1.1rem] leading-tight mb-1">
                      {step.title}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-[0.82rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* Tag de tiempo */}
              <div className="flex items-center gap-3 pt-2 border-t-2 border-gray-100 dark:border-gray-800 mt-2">
                <Check size={14} className="text-leybrak-blue flex-shrink-0" />
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-500 dark:text-gray-400 font-mono">
                  {settings.howitworks_saas_tag}
                </span>
              </div>

              {/* CTA */}
              <Link
                to="/softwares"
                className="mt-6 w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3.5 text-[13px] font-bold uppercase tracking-widest border-2 border-gray-900 dark:border-white hover:bg-leybrak-blue hover:border-leybrak-blue dark:hover:bg-leybrak-blue dark:hover:border-leybrak-blue hover:text-white transition-all duration-200 group"
                style={{ boxShadow: '4px 4px 0px #2563eb' }}
              >
                {settings.howitworks_saas_cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ── Separador central ──────────────────────────────────────── */}
          <div
            ref={dividerRef}
            className="hidden lg:flex flex-col items-center justify-center px-6 py-8 gap-3 self-stretch"
          >
            <div className="flex-1 w-[1px] bg-gray-300 dark:bg-gray-700" />
            <span
              className="text-[11px] font-bold tracking-[0.15em] text-gray-400 dark:text-gray-600 uppercase font-mono px-2 py-1 border border-gray-300 dark:border-gray-700"
            >
              o
            </span>
            <div className="flex-1 w-[1px] bg-gray-300 dark:bg-gray-700" />
          </div>

          {/* ── TRACK Custom ───────────────────────────────────────────── */}
          <div
            ref={customCardRef}
            className={`border-2 border-gray-900 dark:border-white transition-opacity duration-300 ${customOpacity}`}
            onMouseEnter={() => handleTrackEnter('custom')}
            onMouseLeave={handleTrackLeave}
          >
            {/* Header tarjeta — premium / oscuro */}
            <div className="bg-gray-900 dark:bg-white px-8 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Settings size={14} className="text-white dark:text-gray-900" />
                  <span className="text-white dark:text-gray-900 text-[10px] font-bold tracking-[0.2em] uppercase font-mono">
                    {settings.howitworks_custom_badge}
                  </span>
                </div>
                <p className="text-gray-400 dark:text-gray-600 text-[0.82rem]" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  {settings.howitworks_custom_subtitle}
                </p>
              </div>
              <div className="text-white/10 dark:text-gray-900/10 font-black text-5xl leading-none">B</div>
            </div>

            {/* Pasos */}
            <div className="px-8 py-8 bg-white dark:bg-[#0f0f12]">
              {CUSTOM_STEPS.map((step, i) => (
                <div
                  key={step.num}
                  ref={el => customStepsRef.current[i] = el}
                  className="flex gap-5 relative"
                >
                  {i < CUSTOM_STEPS.length - 1 && (
                    <div
                      className="step-line absolute left-[19px] top-[38px] w-[2px] bg-gray-200 dark:bg-gray-800"
                      style={{ height: '48px' }}
                    />
                  )}

                  <div className="flex-shrink-0 w-10 h-10 bg-gray-900 dark:bg-white flex items-center justify-center font-mono font-bold text-white dark:text-gray-900 text-[12px] relative z-10">
                    {step.num}
                  </div>

                  <div className="pb-10">
                    <p className="text-gray-900 dark:text-white font-black uppercase text-[1.1rem] leading-tight mb-1">
                      {step.title}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-[0.82rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* Tag premium */}
              <div className="flex items-center gap-3 pt-2 border-t-2 border-gray-100 dark:border-gray-800 mt-2">
                <Check size={14} className="text-gray-500 flex-shrink-0" />
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-500 dark:text-gray-400 font-mono">
                  {settings.howitworks_custom_tag}
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={() => scrollTo('cta')}
                className="mt-6 w-full flex items-center justify-center gap-3 bg-transparent text-gray-900 dark:text-white px-6 py-3.5 text-[13px] font-bold uppercase tracking-widest border-2 border-gray-900 dark:border-white hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all duration-200 group"
                style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.15)' }}
              >
                {settings.howitworks_custom_cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* ── Nota de confianza ─────────────────────────────────────────── */}
        <p
          className="text-center text-gray-400 dark:text-gray-600 text-[0.78rem] mt-8 font-mono tracking-wide uppercase"
        >
          {settings.howitworks_footer_note}
        </p>

      </div>
    </section>
  );
};

export default HowItWorks;