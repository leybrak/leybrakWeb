import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check, MessageCircle, Send, Settings, Layers, GitMerge, ChevronDown } from 'lucide-react';
import { useLead } from '../hooks/useLead';

gsap.registerPlugin(ScrollTrigger);

const WA_BASE    = 'https://wa.me/51976267494';
const WA_CUSTOM  = `${WA_BASE}?text=${encodeURIComponent('Hola Leybrak, me interesa un software a medida. ¿Podemos hablar?')}`;

// ─── Servicios ────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: '01',
    icon: Settings,
    title: 'Sistemas de gestión',
    sub: 'Inventario · Reservas · Citas · Ventas',
    desc: 'Si tu negocio tiene procesos que hoy manejas en papel, Excel o WhatsApp, los convertimos en un sistema digital ordenado, rápido y hecho para tu flujo exacto.',
    examples: [
      'Sistema de reservas para hoteles o restaurantes',
      'Control de inventario multi-sede',
      'Gestión de citas y agenda de servicios',
      'Panel de ventas con reportes personalizados',
    ],
  },
  {
    id: '02',
    icon: Layers,
    title: 'Apps web para negocios',
    sub: 'Portales · Dashboards · Plataformas',
    desc: 'Construimos aplicaciones web completas pensadas para tu operación: desde un portal para tus clientes hasta un dashboard interno para tu equipo.',
    examples: [
      'Portal de clientes con historial y pagos',
      'Dashboard de métricas para tu equipo',
      'Plataforma de pedidos o cotizaciones online',
      'Panel administrativo a medida',
    ],
  },
  {
    id: '03',
    icon: GitMerge,
    title: 'Automatizaciones',
    sub: 'Flujos · Integraciones · Notificaciones',
    desc: 'Detectamos las tareas repetitivas que te quitan tiempo y las automatizamos. Menos trabajo manual, menos errores, más tiempo para lo que importa.',
    examples: [
      'Notificaciones automáticas por WhatsApp o email',
      'Sincronización entre sistemas que ya usas',
      'Generación automática de reportes y facturas',
      'Flujos de aprobación sin intervención manual',
    ],
  },
];

// ─── Proceso ──────────────────────────────────────────────────────────────────
const PROCESS = [
  { num: '01', title: 'Diagnóstico gratis',    desc: 'Nos cuentas cómo trabajas. Entendemos tu operación sin tecnicismos.' },
  { num: '02', title: 'Propuesta clara',        desc: 'Te presentamos qué vamos a construir, en cuánto tiempo y a qué costo. Sin sorpresas.' },
  { num: '03', title: 'Desarrollo transparente', desc: 'Avances visibles semana a semana. Ves el progreso sin tener que preguntar.' },
  { num: '04', title: 'Lanzamiento y soporte',  desc: 'Tu equipo aprende a usarlo antes del go-live. No te dejamos solo después.' },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: '¿Cuánto cuesta un software a medida?', a: 'Depende del alcance del proyecto. Cada negocio es distinto. Por eso hacemos un diagnóstico gratuito primero — para entender qué necesitas y darte un presupuesto real, no un número al azar.' },
  { q: '¿Cuánto tiempo tarda en estar listo?', a: 'Proyectos simples pueden estar en 3-4 semanas. Sistemas más complejos, entre 6 y 12 semanas. Te damos fechas claras desde el inicio.' },
  { q: '¿Necesito saber de tecnología?', a: 'Para nada. Nosotros traducimos tus procesos a código. Tú nos explicas cómo funciona tu negocio, nosotros nos encargamos del resto.' },
  { q: '¿Qué pasa si quiero cambiar algo después?', a: 'El software es tuyo. Podemos hacer ajustes y mejoras después del lanzamiento. Acordamos eso desde el inicio.' },
  { q: '¿Trabajan con negocios pequeños?', a: 'Sí, es nuestro foco. No necesitas ser una empresa grande para merecer un sistema bien hecho.' },
];

// ─── Accordion FAQ ────────────────────────────────────────────────────────────
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!bodyRef.current) return;
    gsap.to(bodyRef.current, {
      height: open ? 'auto' : 0,
      opacity: open ? 1 : 0,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  }, [open]);

  return (
    <div
      className={`border-b border-white/10 transition-colors duration-200 ${open ? 'bg-white/[0.03]' : ''}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left group"
      >
        <span className="font-bold uppercase text-[0.95rem] tracking-tight text-white group-hover:text-leybrak-blue transition-colors duration-200">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-500 flex-shrink-0 ml-4 transition-transform duration-300 ${open ? 'rotate-180 text-leybrak-blue' : ''}`}
        />
      </button>
      <div ref={bodyRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
        <p className="px-6 pb-5 text-gray-400 text-[0.88rem] leading-relaxed"
           style={{ fontFamily: "'Barlow', sans-serif" }}>
          {a}
        </p>
      </div>
    </div>
  );
};

// ─── Formulario ───────────────────────────────────────────────────────────────
const ContactForm = () => {
  const [formData, setFormData] = useState({ nombre: '', telefono: '', servicio: 'custom', mensaje: '' });
  const { submit, status, errorMsg } = useLead();
  const formRef = useRef(null);

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submit({ ...formData, origen: 'formulario' });
      gsap.fromTo(formRef.current, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    } catch {}
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12 text-center">
        <div className="w-16 h-16 border-2 border-leybrak-blue flex items-center justify-center">
          <span className="text-leybrak-blue text-3xl font-black">/</span>
        </div>
        <div>
          <p className="text-white font-black uppercase text-[1.2rem] mb-2">¡Recibido!</p>
          <p className="text-gray-400 text-[0.88rem]" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Te contactamos en menos de 24 horas, <span className="text-white font-semibold">{formData.nombre}</span>.
          </p>
        </div>
        <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">// solicitud_enviada.ok</span>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Nombre</label>
          <input
            type="text" required disabled={isLoading}
            placeholder="Tu nombre"
            value={formData.nombre}
            onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
            className="bg-transparent border-2 border-white/15 focus:border-leybrak-blue text-white placeholder-gray-700 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Teléfono</label>
          <input
            type="tel" required disabled={isLoading}
            placeholder="Tu número"
            value={formData.telefono}
            onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))}
            className="bg-transparent border-2 border-white/15 focus:border-leybrak-blue text-white placeholder-gray-700 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">¿Qué necesitas?</label>
        <select
          value={formData.servicio}
          onChange={e => setFormData(p => ({ ...p, servicio: e.target.value }))}
          disabled={isLoading}
          className="bg-[#0f0f12] border-2 border-white/15 focus:border-leybrak-blue text-gray-300 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 cursor-pointer"
        >
          <option value="custom">No estoy seguro aún</option>
          <option value="gestion">Sistema de gestión</option>
          <option value="webapp">App web para mi negocio</option>
          <option value="automatizacion">Automatización de procesos</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Cuéntanos más (opcional)</label>
        <textarea
          rows={3} disabled={isLoading}
          placeholder="Describe brevemente cómo funciona tu negocio hoy y qué quisieras mejorar..."
          value={formData.mensaje}
          onChange={e => setFormData(p => ({ ...p, mensaje: e.target.value }))}
          className="bg-transparent border-2 border-white/15 focus:border-leybrak-blue text-white placeholder-gray-700 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 resize-none disabled:opacity-50"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        />
      </div>

      {errorMsg && (
        <p className="text-red-400 text-[12px] font-mono">{errorMsg}</p>
      )}

      <button
        type="submit" disabled={isLoading}
        className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-6 py-4 text-[13px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ boxShadow: '4px 4px 0px rgba(37,99,235,0.3)' }}
      >
        {isLoading
          ? <span className="animate-pulse font-mono">Enviando...</span>
          : <><Send size={14} /> Quiero el diagnóstico gratis</>
        }
      </button>
    </form>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const SoftwareAMedida = () => {
  const heroRef    = useRef(null);
  const servRefs   = useRef([]);
  const procRefs   = useRef([]);
  const faqRef     = useRef(null);
  const ctaRef     = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    gsap.fromTo(
      heroRef.current?.querySelectorAll('.hi'),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    );

    servRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 0.5, delay: i * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' } }
      );
    });

    procRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.4, delay: i * 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' } }
      );
    });

    gsap.fromTo(faqRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: faqRef.current, start: 'top 80%' } }
    );

    gsap.fromTo(ctaRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' } }
    );

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div
      className="relative min-h-screen bg-leybrak-light dark:bg-leybrak-dark transition-colors duration-300"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-28 pb-24 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
          <div className="max-w-5xl mx-auto" ref={heroRef}>

            <div className="hi flex items-center gap-2 mb-10 font-mono text-[11px] text-gray-400">
              <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Inicio</Link>
              <span>/</span>
              <Link to="/softwares" className="hover:text-gray-900 dark:hover:text-white transition-colors">Softwares</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-bold">Software a Medida</span>
            </div>

            <div className="hi mb-5">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold">
                // SYS_CUSTOM — Desarrollo a medida
              </span>
            </div>

            <h1 className="hi text-[clamp(3.5rem,8vw,7rem)] font-black uppercase leading-[0.88] tracking-tight text-gray-900 dark:text-white mb-6">
              Cuando lo<br />
              estándar{' '}
              <span className="inline-block -skew-x-3 bg-leybrak-blue text-white px-4 pb-2">no alcanza.</span>
            </h1>

            <p className="hi text-[1.1rem] text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl border-l-2 border-gray-300 dark:border-gray-700 pl-4 mb-10"
               style={{ fontFamily: "'Barlow', sans-serif" }}>
              Si tu negocio tiene procesos únicos que ningún software del mercado cubre exactamente,
              lo construimos desde cero — hecho para ti, no para todos.
            </p>

            <div className="hi flex flex-col sm:flex-row gap-4">
              <a
                href="#contacto"
                onClick={e => { e.preventDefault(); document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-10 py-5 font-bold uppercase tracking-widest text-sm border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group"
                style={{ boxShadow: '5px 5px 0px #111827' }}
              >
                Diagnóstico gratis
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href={WA_CUSTOM} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-transparent text-gray-900 dark:text-white px-10 py-5 font-bold uppercase tracking-widest text-sm border-2 border-gray-900 dark:border-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
              >
                <MessageCircle size={16} />
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── SERVICIOS ────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit">
                // QUE_CONSTRUIMOS
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black uppercase leading-tight text-gray-900 dark:text-white">
                Tres tipos de proyectos,<br />
                <span className="text-leybrak-blue">un solo equipo.</span>
              </h2>
            </div>

            <div className="flex flex-col gap-0 border-l-2 border-t-2 border-gray-900/10 dark:border-white/10">
              {SERVICES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    ref={el => servRefs.current[i] = el}
                    className="border-r-2 border-b-2 border-gray-900/10 dark:border-white/10 grid md:grid-cols-[280px_1fr_1fr] gap-0 group hover:bg-leybrak-blue/[0.03] transition-colors duration-300"
                  >
                    {/* Número + título */}
                    <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-gray-900/10 dark:border-white/10 flex flex-col gap-4 justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-gray-400 tracking-widest block mb-3">{s.id}</span>
                        <div className="w-10 h-10 bg-leybrak-blue flex items-center justify-center mb-4">
                          <Icon size={18} className="text-white" />
                        </div>
                        <h3 className="text-[1.4rem] font-black uppercase leading-tight text-gray-900 dark:text-white tracking-tight">
                          {s.title}
                        </h3>
                        <p className="text-[11px] font-mono text-leybrak-blue mt-2 tracking-wide">{s.sub}</p>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="p-8 border-b-2 md:border-b-0 md:border-r-2 border-gray-900/10 dark:border-white/10 flex items-start">
                      <p className="text-gray-600 dark:text-gray-400 text-[0.92rem] leading-relaxed"
                         style={{ fontFamily: "'Barlow', sans-serif" }}>
                        {s.desc}
                      </p>
                    </div>

                    {/* Ejemplos */}
                    <div className="p-8 flex flex-col gap-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">Ejemplos</p>
                      {s.examples.map((ex, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Check size={13} className="text-leybrak-blue flex-shrink-0 mt-0.5" />
                          <span className="text-[0.82rem] text-gray-700 dark:text-gray-300"
                                style={{ fontFamily: "'Barlow', sans-serif" }}>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PROCESO ──────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10 bg-gray-900 dark:bg-[#050507]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14">
              <span className="inline-flex items-center bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit">
                // COMO_TRABAJAMOS
              </span>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black uppercase leading-tight text-white">
                Sin sorpresas.<br />Sin letra chica.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-0 border-l-2 border-t-2 border-white/10">
              {PROCESS.map((p, i) => (
                <div
                  key={p.num}
                  ref={el => procRefs.current[i] = el}
                  className="border-r-2 border-b-2 border-white/10 p-8 flex flex-col gap-3"
                >
                  <span className="font-mono text-[2rem] font-black text-leybrak-blue leading-none">{p.num}</span>
                  <h3 className="text-[1.2rem] font-black uppercase leading-tight text-white">{p.title}</h3>
                  <p className="text-gray-400 text-[0.85rem] leading-relaxed"
                     style={{ fontFamily: "'Barlow', sans-serif" }}>{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 border border-white/10 bg-white/[0.03] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-black uppercase text-white text-[1rem] tracking-tight">
                  ¿Y el precio?
                </p>
                <p className="text-gray-400 text-[0.85rem] mt-1" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  Cada proyecto es distinto. Por eso lo primero es el diagnóstico — para darte un número real, no uno al azar.
                </p>
              </div>
              <a
                href={WA_CUSTOM} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-2 bg-white text-gray-900 px-6 py-3 font-bold uppercase tracking-widest text-[12px] hover:bg-leybrak-blue hover:text-white transition-all duration-200"
              >
                Conversemos
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
          <div className="max-w-3xl mx-auto" ref={faqRef}>
            <div className="mb-12">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit">
                // PREGUNTAS_FRECUENTES
              </span>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-gray-900 dark:text-white">
                Lo que más nos preguntan.
              </h2>
            </div>
            <div className="border-t border-gray-200 dark:border-white/10">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} {...faq} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA + FORMULARIO ─────────────────────────────────────────────── */}
        <section id="contacto" className="py-20 px-6 bg-gray-900 dark:bg-[#050507]" ref={ctaRef}>
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-0 border-2 border-white/10">

              {/* Izquierda: texto */}
              <div className="p-10 border-b-2 md:border-b-0 md:border-r-2 border-white/10 flex flex-col justify-between gap-8">
                <div>
                  <span className="inline-flex items-center bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-6 block w-fit">
                    // CONTACTO
                  </span>
                  <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white mb-4">
                    Cuéntanos tu proyecto.
                  </h2>
                  <p className="text-gray-400 text-[0.92rem] leading-relaxed"
                     style={{ fontFamily: "'Barlow', sans-serif" }}>
                    Déjanos tus datos y te contactamos en menos de 24 horas para entender qué necesitas. Sin compromisos.
                  </p>
                </div>

                {/* WhatsApp alternativo */}
                <div className="border-t border-white/10 pt-6">
                  <p className="text-gray-500 text-[11px] font-mono uppercase tracking-widest mb-3">
                    O si prefieres hablar directo:
                  </p>
                  <a
                    href={WA_CUSTOM} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[#25D366] hover:underline font-mono text-[0.85rem] group"
                  >
                    <MessageCircle size={16} />
                    Abrir WhatsApp
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Derecha: formulario */}
              <div className="p-10">
                <ContactForm />
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SoftwareAMedida;