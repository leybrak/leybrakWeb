import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight, Download } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useSiteSettings } from '../hooks/useSiteSettings';

gsap.registerPlugin();

const Descargas = () => {
  const headerRef = useRef(null);
  const cardRefs  = useRef([]);
  const { products } = useProducts();
  const downloads = products.filter(p => p.downloadUrl);
  const { settings } = useSiteSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.fromTo(headerRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (downloads.length === 0) return;
    gsap.fromTo(cardRefs.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
    );
  }, [downloads]);

  return (
    <section
      className="relative min-h-screen pt-28 pb-24 px-6 overflow-hidden bg-leybrak-light dark:bg-leybrak-dark transition-colors duration-300"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(to right, rgba(128,128,128,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.08) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute top-28 right-8 text-gray-900/5 dark:text-white/5 font-black text-[120px] leading-none select-none pointer-events-none">DL</div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10 font-mono text-[11px] text-gray-400">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">Descargas</span>
        </div>

        {/* Encabezado */}
        <div ref={headerRef} className="mb-16 max-w-3xl">
          <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-5 block w-fit">
            // DESCARGAS_DISPONIBLES
          </span>
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.88] tracking-tight text-gray-900 dark:text-white mb-5">
            Descarga{' '}
            <span className="inline-block -skew-x-3 bg-leybrak-blue text-white px-3 pb-1">nuestros sistemas.</span>
          </h1>
          <p className="text-[1rem] text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-gray-300 dark:border-gray-700 pl-4"
             style={{ fontFamily: "'Barlow', sans-serif" }}>
            {settings.descargas_subtitle}
          </p>
        </div>

        {/* Cards */}
        {downloads.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 font-mono text-[0.9rem] border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
            {settings.descargas_empty_text}
          </p>
        ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {downloads.map((d, i) => (
            <div key={d.id} ref={el => cardRefs.current[i] = el} className="relative flex flex-col">
              <div className={`absolute top-3 left-3 w-full h-full border-2 z-0 ${d.available ? 'bg-leybrak-blue border-leybrak-blue' : 'bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-800'}`} />

              <div className={`relative z-10 flex flex-col h-full bg-white dark:bg-[#0f0f12] border-2 border-gray-900 dark:border-white ${!d.available ? 'opacity-70' : ''}`}>

                <div className="flex items-center justify-between px-7 py-4 border-b-2 border-gray-900 dark:border-white">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">{d.sysName}</span>
                  <span className="font-mono text-[10px] font-bold text-gray-300 dark:text-gray-700">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <div className="px-7 py-7 flex flex-col flex-1 gap-4">
                  <span className={`text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 border font-mono w-fit
                    ${d.available ? 'border-leybrak-blue text-leybrak-blue' : 'border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-500'}`}>
                    {d.tag}
                  </span>
                  <h2 className="text-[1.7rem] font-black uppercase leading-tight text-gray-900 dark:text-white tracking-tight">
                    {d.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-[0.88rem] leading-relaxed flex-1"
                     style={{ fontFamily: "'Barlow', sans-serif" }}>
                    {d.description}
                  </p>

                  <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800">
                    {d.available ? (
                      <a href={d.downloadUrl} target="_blank" rel="noopener noreferrer"
                         className="flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3.5 text-[12px] font-bold uppercase tracking-widest hover:bg-leybrak-blue hover:border-leybrak-blue hover:text-white border-2 border-gray-900 dark:border-white transition-all duration-200 group w-full"
                         style={{ boxShadow: '3px 3px 0px rgba(37,99,235,0.3)' }}>
                        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                        {d.cta}
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-500 px-5 py-3.5 text-[12px] font-bold uppercase tracking-widest border-2 border-gray-200 dark:border-gray-800 w-full cursor-not-allowed">
                        {d.cta}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="mt-12 flex items-center justify-between border-t-2 border-gray-900/10 dark:border-white/10 pt-8">
          <Link to="/" className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-mono group">
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <Link to="/softwares" className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-gray-900 dark:text-white hover:text-leybrak-blue transition-colors font-mono group">
            Ver softwares
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Descargas;
