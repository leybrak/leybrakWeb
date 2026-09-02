import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { useScrollTo } from '../hooks/useScrollTo';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useContentItems } from '../hooks/useContentItems';

const DEFAULT_MANIFESTO = [
  { num: '01', line: 'Todo negocio merece tecnología de calidad,\nno solo las grandes empresas.' },
  { num: '02', line: 'El papel y el Excel tienen fecha de\nvencimiento. Ya venció.' },
  { num: '03', line: 'No vendemos software.\nVendemos control sobre tu negocio.' },
  { num: '04', line: 'Sin contratos eternos.\nSin letra chica. Sin excusas.' },
];

const Hero = () => {
  const containerRef  = useRef(null);
  const labelRef      = useRef(null);
  const titleLinesRef = useRef([]);
  const descRef       = useRef(null);
  const buttonsRef    = useRef(null);
  const panelRef      = useRef(null);
  const manifestoRefs = useRef([]);
  const activeLineRef = useRef(0);
  const scrollTo      = useScrollTo();
  const { settings }  = useSiteSettings();
  const { items: fetchedManifesto } = useContentItems('/api/manifesto');
  const MANIFESTO = fetchedManifesto.length > 0
    ? fetchedManifesto.map((m, i) => ({ num: String(i + 1).padStart(2, '0'), line: m.title }))
    : DEFAULT_MANIFESTO;

  // ── Entrada GSAP ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(labelRef.current,   { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.45 })
      .fromTo(titleLinesRef.current,
        { y: 110, clipPath: 'inset(0% 0% 100% 0%)' },
        { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.65, stagger: 0.14 }, '-=0.2')
      .fromTo(descRef.current,    { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
      .fromTo(buttonsRef.current, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.5)' }, '-=0.3')
      .fromTo(panelRef.current,   { opacity: 0, x: 48, rotationY: 12 }, { opacity: 1, x: 0, rotationY: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
      .fromTo(manifestoRefs.current, { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.35, stagger: 0.1, ease: 'power2.out' }, '-=0.3');
  }, []);

  // ── Efecto typewriter ─────────────────────────────────────────────────────────
  useEffect(() => {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#_/\\[]{}';

    const typewriteLine = (idx) => {
      const el = manifestoRefs.current[idx]?.querySelector('.manifesto-text');
      if (!el) return;
      const finalText = MANIFESTO[idx].line;
      const steps = 18;
      let count = 0;
      manifestoRefs.current.forEach((r, i) => {
        if (!r) return;
        gsap.to(r, { opacity: i === idx ? 1 : 0.3, duration: 0.25, ease: 'power2.out' });
      });
      const id = setInterval(() => {
        if (count >= steps) { el.textContent = finalText; clearInterval(id); return; }
        const prog = count / steps;
        const revealed = Math.floor(prog * finalText.length);
        let result = '';
        for (let i = 0; i < finalText.length; i++) {
          if (finalText[i] === '\n') { result += '\n'; continue; }
          result += i < revealed ? finalText[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        el.textContent = result;
        count++;
      }, 38);
    };

    activeLineRef.current = 0;
    typewriteLine(0);
    const interval = setInterval(() => {
      activeLineRef.current = (activeLineRef.current + 1) % MANIFESTO.length;
      typewriteLine(activeLineRef.current);
    }, 3200);
    return () => clearInterval(interval);
    // Se re-arma cuando llegan las frases reales de la API (fetchedManifesto),
    // no cuando cambia MANIFESTO — esa referencia es nueva en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedManifesto]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen flex items-center px-6 overflow-hidden bg-leybrak-light dark:bg-leybrak-dark transition-colors duration-300"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800&family=Barlow:wght@400;500;600&display=swap');
        .hero-grid-bg {
          background-image: linear-gradient(to right, rgba(128,128,128,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .dark .hero-grid-bg {
          background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor-blink { animation: blink 1s step-end infinite; }
        .btn-brutal { transition: box-shadow 0.15s ease, transform 0.15s ease; }
        .btn-brutal:hover { box-shadow: 2px 2px 0px #111827 !important; transform: translate(3px, 3px); }
        .dark .btn-brutal:hover { box-shadow: 2px 2px 0px #F9FAFB !important; }
        .btn-brutal-outline:hover { box-shadow: 2px 2px 0px transparent !important; transform: translate(3px, 3px); }
        .manifesto-text { white-space: pre-line; }
      `}</style>

      <div className="hero-grid-bg absolute inset-0 pointer-events-none" />
      <span className="absolute top-24 left-6 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">+</span>
      <span className="absolute bottom-10 right-6 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">+</span>
      <div className="absolute top-28 right-8 text-gray-200 dark:text-gray-800 font-black text-[120px] leading-none select-none pointer-events-none">01</div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative z-10">

        {/* ── IZQUIERDA ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col justify-center">

          <div ref={labelRef} className="mb-6">
            <span className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold">
              {settings.hero_label}
            </span>
          </div>

          <h1 className="text-[clamp(3.2rem,9vw,6.5rem)] font-black uppercase leading-[0.88] tracking-tight mb-8 text-gray-900 dark:text-white">
            <div className="overflow-hidden pb-1">
              <span ref={el => titleLinesRef.current[0] = el} className="block italic">{settings.hero_heading_start}</span>
            </div>
            <div className="overflow-hidden pb-1">
              <span ref={el => titleLinesRef.current[1] = el} className="block">
                a <span className="inline-block -skew-x-6 bg-leybrak-blue text-white px-3 pb-1">{settings.hero_heading_highlight}</span>
              </span>
            </div>
            <div className="overflow-hidden pb-1">
              <span ref={el => titleLinesRef.current[2] = el} className="block text-transparent" style={{ WebkitTextStroke: '2.5px currentColor' }}>
                {settings.hero_heading_end}
                <span className="cursor-blink text-leybrak-blue ml-1" style={{ WebkitTextStroke: 0 }}>_</span>
              </span>
            </div>
          </h1>

          <p ref={descRef} className="text-[1.05rem] text-gray-600 dark:text-gray-400 max-w-lg mb-10 leading-relaxed border-l-2 border-gray-300 dark:border-gray-700 pl-4"
             style={{ fontFamily: "'Barlow', sans-serif" }}>
            {settings.hero_description_before}{' '}
            <strong className="text-gray-900 dark:text-white font-semibold">
              {settings.hero_description_bold}
            </strong>
            {settings.hero_description_after}
          </p>

          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
            {/* ── CTA principal → scroll al formulario ── */}
            <button
              onClick={() => scrollTo('cta')}
              className="btn-brutal flex items-center justify-center gap-3 bg-leybrak-blue text-white px-8 py-4 font-bold uppercase tracking-widest text-sm border-2 border-gray-900 dark:border-transparent"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em', boxShadow: '5px 5px 0px #111827' }}
            >
              {settings.hero_button_primary}
            </button>

            {/* ── Secundario → scroll a Cómo funciona ── */}
            <button
              onClick={() => scrollTo('how-it-works')}
              className="btn-brutal btn-brutal-outline flex items-center justify-center gap-3 bg-transparent text-gray-900 dark:text-white px-8 py-4 font-bold uppercase tracking-widest text-sm border-2 border-gray-900 dark:border-white group"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em', boxShadow: '5px 5px 0px #111827' }}
            >
              {settings.hero_button_secondary}
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* ── DERECHA: Manifiesto ─────────────────────────────────────────── */}
        <div ref={panelRef} className="lg:col-span-5 relative hidden md:block">
          <div className="absolute top-4 left-4 w-full h-full bg-leybrak-blue border-2 border-gray-900 dark:border-white z-0" />
          <div className="relative z-10 bg-white dark:bg-[#0A0A0A] border-2 border-gray-900 dark:border-white flex flex-col hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-900 dark:border-white">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-gray-900 dark:bg-white" />
                <div className="w-3 h-3 bg-gray-900 dark:bg-white opacity-40" />
                <div className="w-3 h-3 bg-gray-900 dark:bg-white opacity-15" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">// lo_que_creemos</span>
            </div>
            <div className="px-6 py-2 flex flex-col">
              {MANIFESTO.map((item, i) => (
                <div key={item.num} ref={el => manifestoRefs.current[i] = el}
                     className="flex gap-4 py-5 border-b border-gray-100 dark:border-gray-900 last:border-0">
                  <span className="text-[10px] font-bold font-mono text-leybrak-blue mt-0.5 flex-shrink-0 w-5">{item.num}</span>
                  <p className="manifesto-text text-[0.9rem] font-bold uppercase leading-snug tracking-tight text-gray-900 dark:text-white">
                    {item.line}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t-2 border-gray-900 dark:border-white bg-gray-900 dark:bg-white flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono text-white dark:text-gray-900 uppercase tracking-widest">LEYBRAK.SYS</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">online</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;