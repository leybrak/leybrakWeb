import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { useScrollTo } from '../hooks/useScrollTo';
import { useContentItems } from '../hooks/useContentItems';

const Servicios = () => {
  const headerRef  = useRef(null);
  const gridRef    = useRef(null);
  const ctaRef     = useRef(null);
  const scrollTo = useScrollTo();
  const { items: services } = useContentItems('/api/services');

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    if (services.length === 0) return;
    const tl = gsap.timeline();
    tl.fromTo(
      gridRef.current?.querySelectorAll('.service-row'),
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.1'
    );
  }, [services]);

  return (
    <section
      className="relative min-h-screen pt-28 pb-24 px-6 bg-leybrak-light dark:bg-leybrak-dark transition-colors duration-300"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      {/* Cuadrícula */}
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
      <div className="absolute top-28 right-8 text-gray-900/5 dark:text-white/5 font-black text-[120px] leading-none select-none pointer-events-none">
        SV
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10 font-mono text-[11px] text-gray-400">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">Servicios</span>
        </div>

        {/* Encabezado */}
        <div ref={headerRef} className="mb-16 max-w-3xl">
          <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-5 block w-fit">
            // QUE_HACEMOS
          </span>
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.88] tracking-tight text-gray-900 dark:text-white mb-6">
            Cómo{' '}
            <span className="inline-block -skew-x-3 bg-leybrak-blue text-white px-3 pb-1">
              ayudamos
            </span>
            {' '}a tu negocio.
          </h1>
          <p
            className="text-[1rem] text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-gray-300 dark:border-gray-700 pl-4"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            No importa en qué punto está tu negocio hoy. Tenemos un servicio para acompañarte desde el primer paso hasta la operación completa.
          </p>
        </div>

        {/* Grid de servicios — lista brutalista */}
        <div
          ref={gridRef}
          className="border-l-2 border-t-2 border-gray-900 dark:border-white/10 mb-16"
        >
          {services.map((s, i) => (
            <div
              key={s.id}
              className="service-row grid md:grid-cols-[80px_1fr_1fr] border-b-2 border-r-2 border-gray-900 dark:border-white/10 group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-200"
            >
              {/* Número */}
              <div className="px-6 py-6 border-r-2 border-gray-900 dark:border-white/10 flex items-center justify-center">
                <span className="font-mono text-[11px] font-bold text-leybrak-blue">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Título */}
              <div className="px-8 py-6 border-r-0 md:border-r-2 border-gray-900 dark:border-white/10 flex items-center">
                <h3 className="text-[1.15rem] font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight">
                  {s.title}
                </h3>
              </div>

              {/* Descripción */}
              <div className="px-8 py-6 flex items-center justify-between gap-4">
                <p
                  className="text-[0.88rem] text-gray-600 dark:text-gray-400 leading-relaxed"
                  style={{ fontFamily: "'Barlow', sans-serif" }}
                >
                  {s.description}
                </p>
                <ArrowRight
                  size={16}
                  className="text-gray-300 dark:text-gray-700 flex-shrink-0 group-hover:text-leybrak-blue group-hover:translate-x-1 transition-all duration-200"
                />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className="grid md:grid-cols-2 gap-0 border-2 border-gray-900 dark:border-white"
        >
          <div className="p-10 border-b-2 md:border-b-0 md:border-r-2 border-gray-900 dark:border-white">
            <h3 className="text-[1.8rem] font-black uppercase leading-tight text-gray-900 dark:text-white mb-3 tracking-tight">
              ¿No sabes por dónde empezar?
            </h3>
            <p
              className="text-gray-500 dark:text-gray-400 text-[0.9rem] leading-relaxed"
              style={{ fontFamily: "'Barlow', sans-serif" }}
            >
              Te hacemos un diagnóstico gratuito. Nos cuentas cómo trabajas y te decimos qué necesitas — sin venderte nada que no sea útil.
            </p>
          </div>

          <div className="p-10 bg-gray-900 dark:bg-white flex flex-col gap-4 justify-center">
            <p className="text-white dark:text-gray-900 font-black uppercase text-[1rem] tracking-tight">
              Diagnóstico gratuito, sin compromiso.
            </p>
            <button
              onClick={() => scrollTo('cta')}
              className="flex items-center gap-3 bg-leybrak-blue text-white px-8 py-4 text-[13px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group w-fit"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                boxShadow: '4px 4px 0px rgba(255,255,255,0.15)',
              }}
            >
              Quiero el diagnóstico
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer de página */}
        <div className="mt-12 flex items-center justify-between border-t-2 border-gray-900/10 dark:border-white/10 pt-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-mono group"
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <Link
            to="/softwares"
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-gray-900 dark:text-white hover:text-leybrak-blue transition-colors font-mono group"
          >
            Ver softwares
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Servicios;