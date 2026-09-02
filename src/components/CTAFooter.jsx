import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, Send, ArrowRight } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { useLead } from '../hooks/useLead';
import { useSiteSettings } from '../hooks/useSiteSettings';

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_MSG = encodeURIComponent('Hola Leybrak, quiero digitalizar mi negocio. ¿Podemos hablar?');

const NAV_LINKS = ['Softwares', 'Servicios', 'Nosotros'];

// Servicios disponibles para el select del formulario
const SERVICIOS = [
  { value: 'general',    label: 'No sé aún, quiero información' },
  { value: 'saas',       label: 'SaaS Gastronómico (Brava POS)' },
  { value: 'custom',     label: 'Software a medida' },
  { value: 'data_vision', label: 'Inteligencia de negocio' },
];

const CTAFooter = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef     = useRef(null);
  const waRef      = useRef(null);
  const formRef    = useRef(null);
  const footerRef  = useRef(null);
  const glitchRef  = useRef(null);

  const [formData, setFormData] = useState({ nombre: '', telefono: '', servicio: 'general' });
  const { submit, status, errorMsg } = useLead();
  const { settings } = useSiteSettings();

  const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${WHATSAPP_MSG}`;
  const social = [
    { icon: FaInstagram, label: 'Instagram', href: settings.instagram_url },
    { icon: FaLinkedin,  label: 'LinkedIn',  href: settings.linkedin_url },
    { icon: FaXTwitter,  label: 'Twitter',   href: settings.twitter_url },
  ].filter(s => s.href);

  // ── GSAP entrada ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { clipPath: 'inset(0% 0% 100% 0%)', y: 60 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.7, ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      );
      gsap.fromTo(subRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      );
      gsap.fromTo(waRef.current,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: waRef.current, start: 'top 85%' } }
      );
      gsap.fromTo(formRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: formRef.current, start: 'top 85%' } }
      );
      gsap.fromTo(footerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 95%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleWaEnter = () => {
    gsap.to(waRef.current, {
      x: gsap.utils.random(-2, 2), duration: 0.06, repeat: 4, yoyo: true, ease: 'none',
      onComplete: () => gsap.set(waRef.current, { x: 0 }),
    });
  };

  const glitchLogo = () => {
    if (!glitchRef.current) return;
    const chars = '█▓▒░<>[]{}';
    const final = 'LEYBRAK';
    const steps = 12;
    let count = 0;
    const id = setInterval(() => {
      if (count >= steps) { glitchRef.current.textContent = final; clearInterval(id); return; }
      const prog  = count / steps;
      const shown = Math.floor(prog * final.length);
      glitchRef.current.textContent = final
        .split('')
        .map((c, i) => i < shown ? c : chars[Math.floor(Math.random() * chars.length)])
        .join('');
      count++;
    }, 35);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submit({ ...formData, origen: 'formulario' });
      // Animación de éxito
      gsap.fromTo(formRef.current, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    } catch {
      // El error ya lo maneja el hook — no necesitamos hacer nada más aquí
    }
  };

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <>
      {/* ── CTA FINAL ──────────────────────────────────────────────────────── */}
      <section
        ref={sectionRef}
        className="relative py-28 px-6 overflow-hidden bg-gray-900 dark:bg-[#050507]"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-12 right-8 text-white/[0.03] font-black text-[120px] leading-none select-none pointer-events-none">08</div>
        <span className="absolute top-10 left-8 text-white/20 font-mono text-sm select-none">+</span>
        <span className="absolute bottom-10 right-10 text-white/20 font-mono text-sm select-none">+</span>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Encabezado */}
          <div className="mb-16 text-center">
            <div className="overflow-hidden mb-2">
              <h2 ref={headingRef} className="text-[clamp(3rem,8vw,6.5rem)] font-black uppercase leading-[0.88] tracking-tight text-white">
                Da el{' '}
                <span className="inline-block -skew-x-3 bg-leybrak-blue px-3 pb-1">primer paso.</span>
              </h2>
            </div>
            <p ref={subRef} className="text-gray-400 text-[1rem] max-w-md mx-auto mt-6 leading-relaxed"
               style={{ fontFamily: "'Barlow', sans-serif" }}>
              Sin compromisos. Sin letra chica. Solo una conversación sobre tu negocio.
            </p>
          </div>

          {/* Dos canales */}
          <div className="grid md:grid-cols-2 gap-0 border-2 border-white/10 max-w-4xl mx-auto">

            {/* WhatsApp */}
            <div ref={waRef} onMouseEnter={handleWaEnter}
                 className="p-10 border-b-2 md:border-b-0 md:border-r-2 border-white/10 flex flex-col justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#25D366] flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black uppercase text-[1rem] leading-tight">Escríbenos por WhatsApp</p>
                    <p className="text-gray-500 text-[11px] font-mono tracking-wide">Respuesta en menos de 1 hora</p>
                  </div>
                </div>
                <p className="text-gray-400 text-[0.85rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                  Cuéntanos qué tipo de negocio tienes y qué necesitas. Sin formularios, sin esperas.
                </p>
              </div>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4 text-[13px] font-bold uppercase tracking-widest border-2 border-[#25D366] hover:bg-transparent hover:text-[#25D366] transition-all duration-200 group"
                 style={{ boxShadow: '4px 4px 0px rgba(37,211,102,0.3)' }}>
                <MessageCircle size={16} />
                Abrir WhatsApp
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Formulario */}
            <div ref={formRef} className="p-10 flex flex-col justify-between gap-8">
              {!isSuccess ? (
                <>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-leybrak-blue flex items-center justify-center flex-shrink-0">
                        <Send size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-black uppercase text-[1rem] leading-tight">Te llamamos nosotros</p>
                        <p className="text-gray-500 text-[11px] font-mono tracking-wide">En menos de 24 horas</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[0.85rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                      Déjanos tu nombre y número. Nosotros te contactamos para entender tu caso.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    {/* Nombre */}
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="w-full bg-transparent border-2 border-white/20 focus:border-leybrak-blue text-white placeholder-gray-600 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
                    />

                    {/* Teléfono */}
                    <input
                      type="tel"
                      placeholder="Tu número de teléfono"
                      value={formData.telefono}
                      onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="w-full bg-transparent border-2 border-white/20 focus:border-leybrak-blue text-white placeholder-gray-600 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
                    />

                    {/* Servicio de interés */}
                    <select
                      value={formData.servicio}
                      onChange={e => setFormData(p => ({ ...p, servicio: e.target.value }))}
                      disabled={isLoading}
                      className="w-full bg-gray-900 border-2 border-white/20 focus:border-leybrak-blue text-gray-300 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {SERVICIOS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    {/* Error del backend */}
                    {errorMsg && (
                      <p className="text-red-400 text-[12px] font-mono">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-6 py-4 text-[13px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ boxShadow: '4px 4px 0px rgba(37,99,235,0.4)' }}
                    >
                      {isLoading
                        ? <span className="font-mono animate-pulse tracking-widest">Enviando...</span>
                        : <>Quiero que me llamen <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                      }
                    </button>
                  </form>
                </>
              ) : (
                // Estado de éxito
                <div className="flex flex-col items-center justify-center h-full gap-5 py-8">
                  <div className="w-16 h-16 border-2 border-leybrak-blue flex items-center justify-center">
                    <span className="text-leybrak-blue text-3xl font-black">/</span>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-black uppercase text-[1.3rem] leading-tight mb-2">¡Recibido!</p>
                    <p className="text-gray-400 text-[0.85rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                      Te llamamos en menos de 24 horas,{' '}
                      <span className="text-white font-semibold">{formData.nombre}</span>.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
                    // muchas gracias por dar el paso
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-gray-700 text-[11px] font-mono tracking-widest uppercase mt-8">
            // La libertad no tiene precio
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer ref={footerRef} className="bg-black border-t-2 border-white/10 px-6 py-12"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 mb-10">

            {/* Logo */}
            <div>
              <div className="flex items-center gap-2 cursor-pointer mb-4" onMouseEnter={glitchLogo}>
                <div className="w-6 h-6 bg-leybrak-blue flex items-center justify-center">
                  <span className="text-white font-mono font-bold text-sm">/L</span>
                </div>
                <span ref={glitchRef} className="text-2xl font-black tracking-tighter text-white uppercase">LEYBRAK</span>
              </div>
              <p className="text-gray-600 text-[0.82rem] leading-relaxed max-w-xs" style={{ fontFamily: "'Barlow', sans-serif" }}>
                Digitalizamos pequeños negocios con software a medida y soluciones SaaS listas para usar.
              </p>
            </div>

            {/* Nav */}
            <div>
              <p className="text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase mb-4">// navegación</p>
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map(link => (
                  <li key={link}>
                    <a href={`/${link.toLowerCase()}`}
                       className="text-gray-500 hover:text-white text-[0.9rem] font-bold uppercase tracking-widest transition-colors duration-200 group flex items-center gap-2">
                      <span className="text-leybrak-blue text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">›</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <p className="text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase mb-4">// contacto</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-[#25D366] text-[0.82rem] font-mono hover:underline mb-3">
                <MessageCircle size={13} />
                WhatsApp directo
              </a>
              {settings.contact_email && (
                <a href={`mailto:${settings.contact_email}`}
                   className="block text-gray-400 hover:text-white text-[0.82rem] font-mono transition-colors mb-6">
                  {settings.contact_email}
                </a>
              )}
              {social.length > 0 && (
                <>
                  <p className="text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase mb-3">// redes</p>
                  <div className="flex gap-3">
                    {social.map(({ icon: Icon, label, href }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                         className="w-9 h-9 border border-white/10 flex items-center justify-center text-gray-600 hover:text-white hover:border-white/40 transition-all duration-200">
                        <Icon size={15} />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-gray-700 text-[10px] font-mono tracking-widest uppercase">
              © {new Date().getFullYear()} Leybrak — Todos los derechos reservados
            </p>
            <p className="text-gray-800 text-[10px] font-mono tracking-widest uppercase">
              // SYS.CORE_V1.0.0 — STATUS: ONLINE_
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default CTAFooter;