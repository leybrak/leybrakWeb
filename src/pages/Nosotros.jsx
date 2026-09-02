import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useContentItems } from '../hooks/useContentItems';

const Nosotros = () => {
  const sectionRef = useRef(null);
  const { settings } = useSiteSettings();
  const { items: values } = useContentItems('/api/about-values');

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.fromTo(
      sectionRef.current?.querySelectorAll('.fade-in'),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
    );
  }, []);

  return (
    <section
      ref={sectionRef}
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

      <div className="absolute top-28 right-8 text-gray-900/5 dark:text-white/5 font-black text-[120px] leading-none select-none pointer-events-none">
        NS
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Breadcrumb */}
        <div className="fade-in flex items-center gap-2 mb-10 font-mono text-[11px] text-gray-400">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">Nosotros</span>
        </div>

        {/* Encabezado */}
        <div className="fade-in mb-16 max-w-3xl">
          <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-5 block w-fit">
            // QUIENES_SOMOS
          </span>
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.88] tracking-tight text-gray-900 dark:text-white mb-6">
            Detrás de{' '}
            <span className="inline-block -skew-x-3 bg-leybrak-blue text-white px-3 pb-1">
              Leybrak.
            </span>
          </h1>
          <p
            className="text-[1rem] text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-gray-300 dark:border-gray-700 pl-4"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            {settings.about_mission}
          </p>
        </div>

        {/* Stats rápidos */}
        <div className="fade-in grid grid-cols-2 md:grid-cols-4 border-l-2 border-t-2 border-gray-900 dark:border-white/10 mb-16">
          {[
            { label: 'Fundada',    value: settings.about_founded },
            { label: 'Ciudad',     value: settings.about_city },
            { label: 'Negocios',   value: '1' },
            { label: 'Sectores',   value: '1' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-r-2 border-b-2 border-gray-900 dark:border-white/10 p-8"
            >
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <p className="text-[2rem] font-black uppercase text-gray-900 dark:text-white tracking-tight leading-none">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Valores */}
        <div className="fade-in mb-16">
          <h2 className="text-[1.6rem] font-black uppercase tracking-tight text-gray-900 dark:text-white mb-8 border-b-2 border-gray-900/10 dark:border-white/10 pb-4">
            Lo que nos mueve
          </h2>
          <div className="grid md:grid-cols-3 gap-0 border-l-2 border-t-2 border-gray-900 dark:border-white/10">
            {values.map((v, i) => (
              <div
                key={v.id}
                className="border-r-2 border-b-2 border-gray-900 dark:border-white/10 p-8"
              >
                <span className="font-mono text-[10px] text-leybrak-blue font-bold tracking-[0.2em] block mb-3">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[1.3rem] font-black uppercase text-gray-900 dark:text-white mb-3 tracking-tight">
                  {v.title}
                </h3>
                <p
                  className="text-[0.88rem] text-gray-500 dark:text-gray-400 leading-relaxed"
                  style={{ fontFamily: "'Barlow', sans-serif" }}
                >
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder — equipo */}
        <div className="fade-in border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 mb-16 text-center">
          <p className="font-mono text-[11px] text-gray-400 uppercase tracking-widest mb-2">
            // PRÓXIMAMENTE
          </p>
          <p
            className="text-gray-500 dark:text-gray-500 text-[0.9rem]"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            
          </p>
        </div>

        {/* Footer de página */}
        <div className="fade-in flex items-center justify-between border-t-2 border-gray-900/10 dark:border-white/10 pt-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-mono group"
          >
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <Link
            to="/servicios"
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-gray-900 dark:text-white hover:text-leybrak-blue transition-colors font-mono group"
          >
            Ver servicios
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Nosotros;