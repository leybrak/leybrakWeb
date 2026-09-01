import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check, X, Zap, Shield, Wifi, BarChart2, Users, Smartphone, Monitor } from 'lucide-react';


import imgHeroIphone from '../assets/pos/hero-iphone.png';
import imgHeroS22 from '../assets/pos/hero-s22.png';
// ─── Imágenes ─────────────────────────────────────────────────────────────────
import imgMacDashboard from '../assets/img/hand-mackbook/dashboard.png';
import imgMacMesasMenu from '../assets/img/hand-mackbook/mesas-menu.png';
import imgMacMesasPed  from '../assets/img/hand-mackbook/mesas-pedidos.png';
import imgMacMenu      from '../assets/img/hand-mackbook/menu.png';
import imgMacEditor    from '../assets/img/hand-mackbook/editor-carta.png';
import imgMacSedes     from '../assets/img/hand-mackbook/sedes.png';

gsap.registerPlugin(ScrollTrigger);

const WA_BASE = 'https://wa.me/51976267494';

const DESKTOP_SHOTS = [
  { src: imgMacDashboard, label: 'Panel de control', desc: 'Ventas, órdenes activas y métricas del día en tiempo real.' },
  { src: imgMacMesasMenu, label: 'Órdenes en curso', desc: 'Estado de cada mesa y totales al instante.' },
  { src: imgMacMesasPed,  label: 'Tomar pedido',     desc: 'Selecciona productos y envía la orden a cocina.' },
  { src: imgMacMenu,      label: 'Menú y Catálogo',  desc: 'Administra tu menú, categorías, variantes y precios.' },
  { src: imgMacEditor,    label: 'Editor Carta QR',  desc: 'Personaliza tu carta digital con los colores de tu marca.' },
  { src: imgMacSedes,     label: 'Gestión de sedes', desc: 'Controla múltiples locales desde un solo panel.' },
];

const FEATURES = [
  { icon: Zap,        title: 'Terminal POS táctil',      desc: 'Cobra en segundos. Intuitivo para cualquier empleado sin capacitación técnica.' },
  { icon: BarChart2,  title: 'Dashboard en tiempo real', desc: 'Ventas del día, ticket promedio y canales de venta de un solo vistazo.' },
  { icon: Wifi,       title: 'Funciona sin internet',    desc: 'En hora pico no para. Opera offline y sincroniza cuando vuelve la señal.' },
  { icon: Users,      title: 'Multi-mozo y multi-mesa',  desc: 'Cada mozo tiene su acceso. Las mesas se actualizan en tiempo real.' },
  { icon: Smartphone, title: 'App móvil para mozos',     desc: 'Toman el pedido desde su celular y lo envían directo a cocina.' },
  { icon: Shield,     title: 'Control de caja exacto',   desc: 'Cada turno queda registrado. Sabes quién cobró qué y cuándo.' },
];

const RUBROS = [
  'Restaurantes', 'Pollerías', 'Cevicherías', 'Juguerías',
  'Cafeterías', 'Pastelerías', 'Picanterías', 'Marisquerías',
  'Comida rápida', 'Dark kitchens', 'Menú del día', 'Parrillas',
];

const PLANS = [
  {
    name: 'Básico', price: 80, tag: 'Para empezar', featured: false,
    desc: 'Todo lo que necesitas para digitalizar tu operación desde el primer día.',
    features: [
      { text: '1 sede',                   ok: true  },
      { text: 'Terminal POS ilimitado',   ok: true  },
      { text: 'KDS (pantalla de cocina)', ok: true  },
      { text: 'Carta QR para tu local',   ok: true  },
      { text: 'Dashboard de ventas',      ok: true  },
      { text: 'Soporte por WhatsApp',     ok: true  },
      { text: 'Bot de WhatsApp',          ok: false },
      { text: 'App de delivery propia',   ok: false },
      { text: 'Hasta 4 sedes',            ok: false },
    ],
  },
  {
    name: 'Pro', price: 150, tag: 'Más popular', featured: true,
    desc: 'Para negocios que ya crecieron o quieren escalar a varios locales.',
    features: [
      { text: 'Hasta 4 sedes',            ok: true },
      { text: 'Terminal POS ilimitado',   ok: true },
      { text: 'KDS (pantalla de cocina)', ok: true },
      { text: 'Carta QR para tu local',   ok: true },
      { text: 'Dashboard de ventas',      ok: true },
      { text: 'Soporte prioritario',      ok: true },
      { text: 'Bot de WhatsApp incluido', ok: true },
      { text: 'App de delivery propia',   ok: true },
      { text: 'Reportes multi-sede',      ok: true },
    ],
  },
];

// ─── Galería solo escritorio con auto-avance ──────────────────────────────────
const Gallery = () => {
  const [active, setActive]   = useState(0);
  const previewRef            = useRef(null);
  const intervalRef           = useRef(null);
  const activeRef             = useRef(0); // ref para leer en el interval sin stale closure
  const shot                  = DESKTOP_SHOTS[active];

  const animateTo = (idx) => {
    if (idx === activeRef.current) return;
    gsap.to(previewRef.current, {
      opacity: 0, y: -20, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        activeRef.current = idx;
        setActive(idx);
        gsap.set(previewRef.current, { y: 40 });
        gsap.to(previewRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      },
    });
  };

  // Auto-avance cada 4 segundos
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % DESKTOP_SHOTS.length;
      animateTo(next);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Al hacer clic manual, reinicia el timer
  const goTo = (idx) => {
    clearInterval(intervalRef.current);
    animateTo(idx);
    intervalRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % DESKTOP_SHOTS.length;
      animateTo(next);
    }, 4000);
  };

  return (
    // Grid: columna izquierda más angosta, imagen ocupa todo el resto
    <div className="grid gap-6 lg:grid-cols-[220px_1fr] items-start">

      {/* Columna izquierda: descripción + lista */}
      <div className="flex flex-col gap-3">
        <div className="p-4 border-l-2 border-leybrak-blue bg-[#0a0a0a] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-leybrak-blue/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <h4 className="font-black uppercase text-[1rem] tracking-tight text-white mb-1 relative z-10">{shot.label}</h4>
          <p className="text-gray-400 text-[0.8rem] leading-relaxed relative z-10" style={{ fontFamily: "'Barlow', sans-serif" }}>{shot.desc}</p>
        </div>

        {/* Barra de progreso del auto-avance */}
        <div className="flex gap-1">
          {DESKTOP_SHOTS.map((_, i) => (
            <div key={i} className="flex-1 h-[2px] bg-gray-800 overflow-hidden rounded-full">
              <div
                className={`h-full bg-leybrak-blue transition-all duration-300 ${i === active ? 'w-full' : 'w-0'}`}
                style={{ transition: i === active ? 'width 4s linear' : 'none' }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1 pl-1">// PANTALLAS</p>
          {DESKTOP_SHOTS.map((s, i) => (
            <button key={i} onClick={() => goTo(i)}
                    className={`flex items-center gap-3 p-2 border border-transparent text-left transition-all duration-300 rounded-sm group
                      ${i === active ? 'bg-[#111] border-white/10' : 'hover:bg-[#0a0a0a]'}`}>
              <div className={`w-12 h-8 overflow-hidden flex-shrink-0 border transition-colors duration-300
                ${i === active ? 'border-leybrak-blue' : 'border-gray-800 group-hover:border-gray-600'}`}>
                <img src={s.src} alt={s.label}
                     className={`w-full h-full object-cover object-top transition-opacity duration-300
                       ${i === active ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold uppercase tracking-tight leading-tight truncate transition-colors duration-300
                  ${i === active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{s.label}</p>
                <p className={`text-[9px] font-mono mt-0.5 ${i === active ? 'text-leybrak-blue' : 'text-gray-700'}`}>0{i + 1}</p>
              </div>
              {i === active && <ArrowRight size={12} className="text-leybrak-blue mr-1 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Columna derecha: preview grande */}
      <div ref={previewRef}  className="flex justify-center items-center w-full">
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-leybrak-blue/15 blur-[80px] rounded-full z-0" />
          <img
            src={shot.src}
            alt={shot.label}
            className="relative  z-10 w-full object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>

    </div>
  );
};

// ─── Página Principal ─────────────────────────────────────────────────────────
const BravaPOS = () => {
  const heroRef  = useRef(null);
  const featRefs = useRef([]);
  const planRefs = useRef([]);
  const ctaRef   = useRef(null);
  const galRef   = useRef(null);
  const phoneRef = useRef(null);
  const phone1Ref = useRef(null);
  const phone2Ref = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);

    gsap.fromTo(
      heroRef.current?.querySelectorAll('.hi'),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    );

    gsap.fromTo(phoneRef.current,
      { opacity: 0, y: 80 },
      {
        opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.3,
        onComplete: () => {
          gsap.to(phoneRef.current, { y: -15, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        }
      }
    );

    gsap.fromTo(galRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: galRef.current, start: 'top 80%' } }
    );

    featRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.4, delay: i * 0.06, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
      );
    });

    planRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 50, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: i * 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
      );
    });

    gsap.fromTo(ctaRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: ctaRef.current, start: 'top 90%' } }
    );

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div className="relative min-h-screen bg-leybrak-light dark:bg-leybrak-dark transition-colors duration-300"
         style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-28 pb-24 px-6 border-b-2 border-gray-900/10 dark:border-white/10 overflow-hidden relative">
          <div className="max-w-[85rem] mx-auto">

            <div className="hi flex items-center gap-2 mb-10 font-mono text-[11px] text-gray-400 relative z-20">
              <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Inicio</Link>
              <span>/</span>
              <Link to="/softwares" className="hover:text-gray-900 dark:hover:text-white transition-colors">Softwares</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-bold">Leybrak POS</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">

              {/* Texto */}
              <div ref={heroRef} className="flex flex-col gap-6 relative z-20">
                <div className="hi">
                  <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold">
                    // LEYBRAK_POS — SaaS Gastronómico
                  </span>
                </div>

                <h1 className="hi text-[clamp(2.8rem,5vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tight text-gray-900 dark:text-white">
                  El sistema<br />
                  que tu<br />
                  <span className="inline-block -skew-x-3 bg-leybrak-blue text-white px-4 pb-1 mt-2">restaurante</span><br />
                  necesitaba.
                </h1>

                <p className="hi text-[1.05rem] text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg border-l-2 border-gray-300 dark:border-gray-700 pl-4"
                   style={{ fontFamily: "'Barlow', sans-serif" }}>
                  De la comanda en papel al sistema digital en menos de 48 horas. Mesas, pedidos, caja e inventario desde un solo lugar — sin complicaciones técnicas.
                </p>

                <div className="hi flex flex-col sm:flex-row gap-4 relative z-20 mt-2">
                  <a href={`${WA_BASE}?text=${encodeURIComponent('Hola Leybrak, quiero una demo de Leybrak POS.')}`}
                     target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-8 py-4 font-bold uppercase tracking-widest text-[13px] border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group"
                     style={{ boxShadow: '4px 4px 0px #111827' }}>
                    Agendar demo
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <button
                    onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center justify-center gap-3 bg-transparent text-gray-900 dark:text-white px-8 py-4 font-bold uppercase tracking-widest text-[13px] border-2 border-gray-900 dark:border-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200">
                    Ver precios
                  </button>
                </div>

                <div className="hi grid grid-cols-3 gap-0 border-2 border-gray-900/10 dark:border-white/10 w-fit relative z-10 mt-2">
                  {[
                    { val: '48h',  label: 'Operativo' },
                    { val: '100%', label: 'Sin papel'  },
                    { val: '24/7', label: 'Soporte'    },
                  ].map((s, i) => (
                    <div key={i} className="px-5 py-3 border-r-2 border-gray-900/10 dark:border-white/10 last:border-0 text-center bg-leybrak-light dark:bg-leybrak-dark">
                      <p className="text-[1.5rem] font-black text-leybrak-blue leading-none">{s.val}</p>
                      <p className="text-[9px] text-gray-500 font-mono uppercase tracking-wide mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imagen hero */}
              <div className="hidden lg:flex relative w-full h-[650px] items-center justify-center pointer-events-none z-10">
                  <div className="absolute w-[90%] h-[90%] bg-leybrak-blue/10 blur-[120px] rounded-full z-0" />
                  
                  <div className="relative w-full h-full flex items-center justify-center">
                    
                    {/* S22 ULTRA (Está a la izquierda) -> Lo movemos a la DERECHA para que se acerque al centro (+) */}
                    <img 
                    ref={phone2Ref}
                    src={imgHeroS22} 
                    alt="Leybrak POS Mesas" 
                    className="absolute w-[200%] max-w-none object-contain drop-shadow-2xl z-10 opacity-80 translate-x-1 scale-100"
                    />

                    {/* IPHONE (Está a la derecha) -> Lo movemos a la IZQUIERDA para que se acerque al centro (-) */}
                    <img 
                    ref={phone1Ref}
                    src={imgHeroIphone} 
                    alt="Leybrak POS Pedidos" 
                    className="absolute w-[200%] max-w-none object-contain drop-shadow-2xl z-20 -translate-x-1 translate-y-8 scale-100"
                    />

                  </div>
              </div>

            </div>
          </div>

          <div className="absolute top-10 -right-40 w-[600px] h-[600px] border-[30px] border-gray-900/5 dark:border-white/5 rounded-full pointer-events-none z-0" />
        </section>

        {/* ── GALERÍA ───────────────────────────────────────────────────────── */}
        <section className="py-16 px-6 border-b-2 border-white/5 bg-[#030303]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center lg:text-left">
              <span className="inline-flex items-center bg-[#111] text-white text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit mx-auto lg:mx-0">
                // CAPTURAS_DEL_SISTEMA
              </span>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white">
                Ve cada pantalla del sistema.
              </h2>
            </div>
            <div ref={galRef}><Gallery /></div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto relative">
            <div className="mb-12 relative z-10">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit">
                // QUE_INCLUYE
              </span>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-gray-900 dark:text-white">
                Todo lo que necesitas, <span className="text-leybrak-blue">nada que no.</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l-2 border-t-2 border-gray-900/10 dark:border-white/10 relative z-10 bg-leybrak-light dark:bg-leybrak-dark">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} ref={el => featRefs.current[i] = el}
                       className="border-r-2 border-b-2 border-gray-900/10 dark:border-white/10 p-8 hover:bg-leybrak-blue/5 transition-colors duration-200 bg-leybrak-light dark:bg-leybrak-dark">
                    <div className="w-10 h-10 bg-leybrak-blue flex items-center justify-center mb-5">
                      <Icon size={18} className="text-white" />
                    </div>
                    <h3 className="text-[1.1rem] font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">{f.title}</h3>
                    <p className="text-[0.83rem] text-gray-500 dark:text-gray-400 leading-relaxed"
                       style={{ fontFamily: "'Barlow', sans-serif" }}>{f.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-leybrak-blue/5 rounded-full pointer-events-none z-0" />
          </div>
        </section>

        {/* ── RUBROS ───────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10 bg-gray-900 dark:bg-[#050507] overflow-hidden">
          <div className="max-w-7xl mx-auto relative">
            <div className="mb-10 relative z-10">
              <span className="inline-flex items-center bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit">
                // PARA_QUIEN_ES
              </span>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white">
                Diseñado para negocios de comida.
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 relative z-10">
              {RUBROS.map((r, i) => (
                <div key={i} className="border border-white/10 px-4 py-3 font-bold uppercase text-[0.85rem] tracking-tight text-gray-300 hover:border-leybrak-blue hover:text-white transition-all duration-200 rounded-sm bg-gray-900/50 dark:bg-black/20">
                  <span className="text-leybrak-blue font-mono text-[10px] mr-2">{String(i + 1).padStart(2, '0')}</span>
                  {r}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none z-0 opacity-20" style={{
              backgroundImage: `linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }} />
          </div>
        </section>

        {/* ── PLANES ───────────────────────────────────────────────────────── */}
        <section id="planes" className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10 bg-gray-50 dark:bg-[#08080a]">
          <div className="max-w-4xl mx-auto relative">
            <div className="mb-16 text-center relative z-10">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 mx-auto">
                // PLANES_Y_PRECIOS
              </span>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-gray-900 dark:text-white mt-4">
                Simple y sin sorpresas.
              </h2>
              <p className="text-gray-500 text-[0.9rem] mt-2 font-mono">Sin contratos largos. Cancela cuando quieras.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              {PLANS.map((plan, i) => (
                <div key={i} ref={el => planRefs.current[i] = el} className="relative flex flex-col">
                  <div className={`absolute top-3 left-3 w-full h-full border-2 z-0 ${plan.featured ? 'bg-leybrak-blue border-leybrak-blue' : 'bg-gray-300 dark:bg-gray-700 border-gray-300 dark:border-gray-700'}`} />
                  <div className="relative z-10 flex flex-col h-full bg-white dark:bg-[#0f0f12] border-2 border-gray-900 dark:border-white rounded-sm">
                    <div className={`px-8 py-6 border-b-2 border-gray-900 dark:border-white ${plan.featured ? 'bg-leybrak-blue' : 'bg-gray-900 dark:bg-white'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[10px] font-bold tracking-[0.2em] uppercase font-mono ${plan.featured ? 'text-white/70' : 'text-white/60 dark:text-gray-900/60'}`}>{plan.tag}</span>
                          <h3 className={`text-[2rem] font-black uppercase leading-tight tracking-tight mt-1 ${plan.featured ? 'text-white' : 'text-white dark:text-gray-900'}`}>{plan.name}</h3>
                        </div>
                        <div className="text-right">
                          <div className={`text-[2.8rem] font-black leading-none ${plan.featured ? 'text-white' : 'text-white dark:text-gray-900'}`}>S/{plan.price}</div>
                          <div className={`text-[11px] font-mono ${plan.featured ? 'text-white/60' : 'text-white/50 dark:text-gray-900/50'}`}>/ mes</div>
                        </div>
                      </div>
                      <p className={`text-[0.82rem] mt-3 leading-relaxed ${plan.featured ? 'text-white/80' : 'text-white/60 dark:text-gray-900/60'}`}
                         style={{ fontFamily: "'Barlow', sans-serif" }}>{plan.desc}</p>
                    </div>
                    <div className="px-8 py-6 flex flex-col flex-1 gap-3">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-3">
                          {f.ok ? <Check size={14} className="text-leybrak-blue flex-shrink-0" /> : <X size={14} className="text-gray-300 dark:text-gray-700 flex-shrink-0" />}
                          <span className={`text-[0.83rem] font-mono ${f.ok ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700 line-through'}`}>{f.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-8 pb-8 mt-auto">
                      <a href={`${WA_BASE}?text=${encodeURIComponent(`Hola, me interesa el plan ${plan.name} de Leybrak POS a S/${plan.price}/mes.`)}`}
                         target="_blank" rel="noopener noreferrer"
                         className={`flex items-center justify-center gap-3 w-full px-6 py-4 text-[13px] font-bold uppercase tracking-widest border-2 transition-all duration-200 group rounded-sm
                           ${plan.featured
                             ? 'bg-leybrak-blue text-white border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue'
                             : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white hover:bg-leybrak-blue hover:border-leybrak-blue hover:text-white'
                           }`}
                         style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.15)' }}>
                        Empezar con {plan.name}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 text-[11px] font-mono mt-12 uppercase tracking-widest relative z-10">
              // Todos los planes incluyen configuración inicial gratuita
            </p>
            <div className="absolute top-1/2 left-0 w-64 h-64 border border-leybrak-blue/10 rounded-full z-0 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 border border-leybrak-blue/10 rounded-full z-0 translate-x-1/3 translate-y-1/3" />
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section ref={ctaRef} className="py-24 px-6 bg-gray-900 dark:bg-[#050507] overflow-hidden relative">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <span className="inline-flex items-center bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-6">
              // DEMO_GRATUITA
            </span>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-tight text-white mb-6">
              Vélo funcionando en tu
              <span className="block -skew-x-2 bg-leybrak-blue px-3 pb-1 inline-block mt-1 relative">
                negocio real.
                <Zap className="absolute -top-6 -right-6 text-white/40 opacity-70" size={30} />
              </span>
            </h2>
            <p className="text-gray-400 text-[1rem] leading-relaxed mb-10 max-w-lg mx-auto"
               style={{ fontFamily: "'Barlow', sans-serif" }}>
              Demo en vivo con tu menú, tus mesas y tu operación. Sin PowerPoints genéricos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
              <a href={`${WA_BASE}?text=${encodeURIComponent('Hola Leybrak, quiero una demo de Leybrak POS.')}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-10 py-5 text-sm font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group rounded-sm"
                 style={{ boxShadow: '4px 4px 0px rgba(255,255,255,0.15)' }}>
                Quiero una demo gratis
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <Link to="/softwares"
                    className="flex items-center justify-center gap-3 bg-transparent text-white px-10 py-5 text-sm font-bold uppercase tracking-widest border-2 border-white/30 hover:border-white transition-all duration-200 rounded-sm">
                Ver otros productos
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
            backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }} />
        </section>

      </div>
    </div>
  );
};

export default BravaPOS;