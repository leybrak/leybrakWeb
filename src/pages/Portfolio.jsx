import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Download, MessageCircle, ExternalLink, Send, User, Mail, Briefcase, GraduationCap, Code2, Quote, Languages } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa6';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useContentItems } from '../hooks/useContentItems';
import { useLead } from '../hooks/useLead';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_FOUNDER = {
  name: 'Sebastián Silva Mendoza',
  role: 'Fundador · Full-stack & Data',
  photoUrl: null,
};

// Convierte un texto "uno por línea" (como se guarda en settings) en una lista limpia
const parseLines = (text) => (text || '').split('\n').map(l => l.trim()).filter(Boolean);

// Convierte líneas "Etiqueta: valor" en pares {label, value}
const parseLabeledLines = (text) => parseLines(text).map(line => {
  const idx = line.indexOf(':');
  if (idx === -1) return { label: line, value: '' };
  return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
});

// Convierte "Categoría: tec1, tec2" por línea en grupos {label, items[]} —
// una línea sin ":" cae en un grupo genérico "General" para no perder nada.
const parseSkillCategories = (text) => {
  const categories = [];
  parseLines(text).forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) {
      let generic = categories.find(c => c.label === 'General');
      if (!generic) { generic = { label: 'General', items: [] }; categories.push(generic); }
      generic.items.push(line);
    } else {
      const label = line.slice(0, idx).trim();
      const items = line.slice(idx + 1).split(',').map(v => v.trim()).filter(Boolean);
      if (items.length > 0) categories.push({ label, items });
    }
  });
  return categories;
};

// ─── Formulario de contacto — usa el mismo sistema de leads que el resto de la web ──
const ContactForm = () => {
  const [formData, setFormData] = useState({ nombre: '', telefono: '', mensaje: '' });
  const { submit, status, errorMsg } = useLead();
  const formRef = useRef(null);

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submit({ ...formData, servicio: 'portafolio', origen: 'formulario' });
      gsap.fromTo(formRef.current, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    } catch {
      // el error ya queda en errorMsg
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-14 h-14 border-2 border-leybrak-blue flex items-center justify-center">
          <span className="text-leybrak-blue text-2xl font-black">/</span>
        </div>
        <p className="font-black uppercase text-[1.1rem] text-gray-900 dark:text-white">¡Recibido!</p>
        <p className="text-gray-500 text-[0.88rem]" style={{ fontFamily: "'Barlow', sans-serif" }}>
          Te contacto en menos de 24 horas, {formData.nombre}.
        </p>
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
            className="bg-transparent border-2 border-gray-300 dark:border-white/15 focus:border-leybrak-blue text-gray-900 dark:text-white px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Teléfono / WhatsApp</label>
          <input
            type="tel" required disabled={isLoading}
            placeholder="Tu número"
            value={formData.telefono}
            onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))}
            className="bg-transparent border-2 border-gray-300 dark:border-white/15 focus:border-leybrak-blue text-gray-900 dark:text-white px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Tu mensaje</label>
        <textarea
          rows={3} disabled={isLoading}
          placeholder="Cuéntame qué tienes en mente..."
          value={formData.mensaje}
          onChange={e => setFormData(p => ({ ...p, mensaje: e.target.value }))}
          className="bg-transparent border-2 border-gray-300 dark:border-white/15 focus:border-leybrak-blue text-gray-900 dark:text-white px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 resize-none disabled:opacity-50"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        />
      </div>

      {errorMsg && <p className="text-red-500 text-[12px] font-mono">{errorMsg}</p>}

      <button
        type="submit" disabled={isLoading}
        className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-6 py-4 text-[13px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? <span className="animate-pulse font-mono">Enviando...</span> : <><Send size={14} /> Enviar mensaje</>}
      </button>
    </form>
  );
};

// ─── Página de portafolio/CV del fundador ─────────────────────────────────────
const Portfolio = () => {
  const heroRef = useRef(null);
  const sectionRefs = useRef([]);
  const { settings } = useSiteSettings();
  const { items: team }  = useContentItems('/api/team-members');
  const { items: experience } = useContentItems('/api/founder-experience');
  const { items: projects }   = useContentItems('/api/founder-projects');
  const { items: certifications } = useContentItems('/api/founder-certifications');
  const { items: testimonials }   = useContentItems('/api/founder-testimonials');
  const { items: metrics }        = useContentItems('/api/founder-metrics');

  const founder = team.find(m => m.isFounder) || DEFAULT_FOUNDER;
  const WA_BASE = `https://wa.me/${settings.whatsapp_number}`;
  const waMessage = encodeURIComponent(`Hola ${founder.name.split(' ')[0]}, vi tu portafolio en la web de Leybrak y quiero conversar.`);

  const skillCategories = parseSkillCategories(settings.founder_skills);
  const languages  = parseLabeledLines(settings.founder_languages).filter(l => l.value);
  const interests  = parseLines(settings.founder_interests);
  const workExperience = experience.filter(e => e.type !== 'education');
  const education       = experience.filter(e => e.type === 'education');

  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.fromTo(
      heroRef.current?.querySelectorAll('.hi'),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    );
    sectionRefs.current.forEach((el) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
      );
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [founder.id]);

  return (
    <div className="relative min-h-screen bg-leybrak-light dark:bg-leybrak-dark transition-colors duration-300"
         style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-28 pb-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
          <div className="max-w-5xl mx-auto" ref={heroRef}>

            <div className="hi flex items-center gap-2 mb-10 font-mono text-[11px] text-gray-400">
              <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Inicio</Link>
              <span>/</span>
              <Link to="/nosotros" className="hover:text-gray-900 dark:hover:text-white transition-colors">Nosotros</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-bold">Portafolio</span>
            </div>

            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
              {(founder.photoUrl || founder.name) && (
                <div className="hi w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-200 dark:bg-white/10 border-2 border-gray-900/10 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                  {founder.photoUrl
                    ? <img src={founder.photoUrl} alt={founder.name} className="w-full h-full object-cover" />
                    : <User size={40} className="text-gray-400" />}
                </div>
              )}

              <div className="flex flex-col gap-5">
                {settings.founder_status_label && (
                  <div className="hi">
                    <span className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leybrak-blue opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-leybrak-blue" />
                      </span>
                      {settings.founder_status_label}
                    </span>
                  </div>
                )}

                <h1 className="hi text-[clamp(2.4rem,5vw,4rem)] font-black uppercase leading-[0.95] tracking-tight text-gray-900 dark:text-white">
                  {founder.name}
                </h1>

                {(founder.role || settings.founder_headline) && (
                  <p className="hi text-leybrak-blue text-[1.1rem] font-bold uppercase tracking-tight -mt-3">
                    {settings.founder_headline || founder.role}
                  </p>
                )}

                {settings.founder_bio && (
                  <p className="hi text-[1rem] text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl border-l-2 border-gray-300 dark:border-gray-700 pl-4"
                     style={{ fontFamily: "'Barlow', sans-serif" }}>
                    {settings.founder_bio}
                  </p>
                )}

                {settings.founder_location && (
                  <p className="hi text-gray-400 text-[11px] font-mono uppercase tracking-widest">
                    // {settings.founder_location}
                  </p>
                )}

                <div className="hi flex flex-wrap gap-4 mt-2">
                  <a href={`${WA_BASE}?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-8 py-4 font-bold uppercase tracking-widest text-[13px] border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group"
                     style={{ boxShadow: '4px 4px 0px #111827' }}>
                    <MessageCircle size={16} /> Hablar por WhatsApp
                  </a>
                  {settings.founder_cv_url && (
                    <a href={settings.founder_cv_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-center gap-3 bg-transparent text-gray-900 dark:text-white px-8 py-4 font-bold uppercase tracking-widest text-[13px] border-2 border-gray-900 dark:border-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200">
                      <Download size={15} /> Descargar CV
                    </a>
                  )}
                </div>

                {(settings.founder_email || settings.founder_linkedin_url || settings.founder_github_url) && (
                  <div className="hi flex flex-wrap gap-x-6 gap-y-2 mt-1 font-mono text-[12px]">
                    {settings.founder_email && (
                      <a href={`mailto:${settings.founder_email}`}
                         className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-leybrak-blue transition-colors">
                        <Mail size={14} /> {settings.founder_email}
                      </a>
                    )}
                    {settings.founder_linkedin_url && (
                      <a href={settings.founder_linkedin_url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-leybrak-blue transition-colors">
                        <FaLinkedin size={14} /> LinkedIn
                      </a>
                    )}
                    {settings.founder_github_url && (
                      <a href={settings.founder_github_url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-leybrak-blue transition-colors">
                        <FaGithub size={14} /> GitHub
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── MÉTRICAS RÁPIDAS ─────────────────────────────────────────────── */}
        {metrics.length > 0 && (
          <section ref={el => sectionRefs.current[0] = el} className="py-10 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics.map((m) => (
                <div key={m.id} className="p-5 border-2 border-gray-900/10 dark:border-white/10">
                  <p className="text-leybrak-blue text-[10px] font-mono uppercase tracking-widest mb-2">{m.label}</p>
                  <p className="text-[1.05rem] font-black text-gray-900 dark:text-white uppercase leading-tight">{m.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TECNOLOGÍAS E IDIOMAS ────────────────────────────────────────── */}
        {(skillCategories.length > 0 || languages.length > 0) && (
          <section ref={el => sectionRefs.current[1] = el} className="py-14 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
            <div className="max-w-5xl mx-auto flex flex-col gap-8">
              {skillCategories.length > 0 && (
                <div>
                  <span className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-6 block w-fit">
                    <Code2 size={13} /> // TECNOLOGÍAS
                  </span>
                  <div className="flex flex-col gap-5">
                    {skillCategories.map((cat, i) => (
                      <div key={i}>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">{cat.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((s, j) => (
                            <span key={j} className="text-[12px] font-bold px-4 py-2 border-2 border-gray-900/10 dark:border-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wide hover:border-leybrak-blue hover:text-leybrak-blue transition-colors">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {languages.length > 0 && (
                <div>
                  <span className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-6 block w-fit">
                    <Languages size={13} /> // IDIOMAS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l, i) => (
                      <span key={i} className="text-[12px] font-bold px-4 py-2 border-2 border-gray-900/10 dark:border-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        {l.label} <span className="text-leybrak-blue">— {l.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── TRAYECTORIA — experiencia y educación por separado ──────────── */}
        {experience.length > 0 && (
          <section ref={el => sectionRefs.current[2] = el} className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10 bg-gray-900 dark:bg-[#050507]">
            <div className="max-w-6xl mx-auto">
              <div className="mb-14">
                <span className="inline-flex items-center bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit">
                  // TRAYECTORIA
                </span>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white">
                  Experiencia & educación.
                </h2>
              </div>

              <div className={`grid gap-10 ${workExperience.length > 0 && education.length > 0 ? 'lg:grid-cols-2' : ''}`}>
                {workExperience.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-leybrak-blue mb-4">
                      <Briefcase size={14} /> Experiencia
                    </h3>
                    <div className="border-l-2 border-t-2 border-white/10">
                      {workExperience.map((item) => (
                        <div key={item.id} className="flex flex-col gap-1 p-6 border-r-2 border-b-2 border-white/10">
                          {item.dateLabel && (
                            <span className="text-gray-500 font-mono text-[11px] uppercase tracking-wide">{item.dateLabel}</span>
                          )}
                          <h4 className="text-[1.1rem] font-black uppercase text-white tracking-tight">{item.title}</h4>
                          {item.description && (
                            <p className="text-gray-400 text-[0.9rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-leybrak-blue mb-4">
                      <GraduationCap size={14} /> Educación
                    </h3>
                    <div className="border-l-2 border-t-2 border-white/10">
                      {education.map((item) => (
                        <div key={item.id} className="flex flex-col gap-1 p-6 border-r-2 border-b-2 border-white/10">
                          {item.dateLabel && (
                            <span className="text-gray-500 font-mono text-[11px] uppercase tracking-wide">{item.dateLabel}</span>
                          )}
                          <h4 className="text-[1.1rem] font-black uppercase text-white tracking-tight">{item.title}</h4>
                          {item.description && (
                            <p className="text-gray-400 text-[0.9rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── PROYECTOS ────────────────────────────────────────────────────── */}
        {projects.length > 0 && (
          <section ref={el => sectionRefs.current[3] = el} className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
            <div className="max-w-7xl mx-auto">
              <div className="mb-14">
                <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-4 block w-fit">
                  // PROYECTOS
                </span>
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-gray-900 dark:text-white">
                  Cosas que he construido.
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {projects.map((p) => (
                  <div key={p.id} className="border-2 border-gray-900 dark:border-white/10 bg-white dark:bg-[#0f0f12] flex flex-col">
                    {p.imageUrl && (
                      <div className="aspect-video overflow-hidden border-b-2 border-gray-900 dark:border-white/10">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <h3 className="text-[1.3rem] font-black uppercase text-gray-900 dark:text-white tracking-tight">{p.title}</h3>
                      {p.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-[0.88rem] leading-relaxed flex-1"
                           style={{ fontFamily: "'Barlow', sans-serif" }}>
                          {p.description}
                        </p>
                      )}
                      {p.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.technologies.map((t, i) => (
                            <span key={i} className="text-[9px] font-black px-3 py-1 bg-leybrak-blue/10 text-leybrak-blue uppercase tracking-widest">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {(p.githubLink || p.liveLink) && (
                        <div className="flex gap-4 mt-1">
                          {p.githubLink && (
                            <a href={p.githubLink} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-leybrak-blue transition-colors">
                              <FaGithub size={13} /> Código
                            </a>
                          )}
                          {p.liveLink && (
                            <a href={p.liveLink} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-leybrak-blue hover:underline">
                              <ExternalLink size={13} /> Ver en vivo
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CERTIFICACIONES ─────────────────────────────────────────────── */}
        {certifications.length > 0 && (
          <section ref={el => sectionRefs.current[4] = el} className="py-16 px-6 border-b-2 border-gray-900/10 dark:border-white/10 bg-gray-50 dark:bg-[#08080a]">
            <div className="max-w-7xl mx-auto">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-8 block w-fit">
                // CERTIFICACIONES
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {certifications.map((c) => {
                  const Card = (
                    <>
                      {c.issuerLogoUrl ? (
                        <img src={c.issuerLogoUrl} alt={c.issuer} className="h-10 object-contain grayscale opacity-70 mb-3" />
                      ) : (
                        <p className="font-black uppercase text-gray-400 text-[0.9rem] mb-3">{c.issuer}</p>
                      )}
                      <p className="text-[0.82rem] font-bold text-gray-900 dark:text-white leading-tight">{c.name}</p>
                      {c.dateEarned && <p className="text-[10px] font-mono text-gray-400 mt-1">{c.dateEarned}</p>}
                    </>
                  );
                  return c.certificateLink ? (
                    <a key={c.id} href={c.certificateLink} target="_blank" rel="noopener noreferrer"
                       className="border-2 border-gray-200 dark:border-white/10 p-5 hover:border-leybrak-blue transition-colors">
                      {Card}
                    </a>
                  ) : (
                    <div key={c.id} className="border-2 border-gray-200 dark:border-white/10 p-5">
                      {Card}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── TESTIMONIOS ──────────────────────────────────────────────────── */}
        {testimonials.length > 0 && (
          <section ref={el => sectionRefs.current[5] = el} className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
            <div className="max-w-6xl mx-auto">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-10 block w-fit">
                // TESTIMONIOS
              </span>
              <div className="grid md:grid-cols-2 gap-6">
                {testimonials.map((t) => (
                  <div key={t.id} className="relative border-2 border-gray-900 dark:border-white/10 bg-white dark:bg-[#0f0f12] p-8">
                    <Quote size={32} className="absolute top-6 right-6 text-leybrak-blue/15" />
                    <p className="relative z-10 text-gray-700 dark:text-gray-300 text-[1rem] leading-relaxed mb-6"
                       style={{ fontFamily: "'Barlow', sans-serif" }}>
                      "{t.quote}"
                    </p>
                    <p className="font-black uppercase text-gray-900 dark:text-white text-[0.9rem]">{t.authorName}</p>
                    {t.authorRole && (
                      <p className="text-gray-500 dark:text-gray-400 text-[0.8rem] font-mono">{t.authorRole}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SOBRE MÍ ─────────────────────────────────────────────────────── */}
        {settings.founder_personal_note && (
          <section ref={el => sectionRefs.current[6] = el} className="py-16 px-6 border-b-2 border-gray-900/10 dark:border-white/10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-6">
                // SOBRE_MÍ
              </span>
              <p className="text-[1.1rem] text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                {settings.founder_personal_note}
              </p>
              {interests.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {interests.map((interest, i) => (
                    <span key={i} className="text-[11px] font-bold px-3 py-1.5 bg-leybrak-blue/10 text-leybrak-blue uppercase tracking-wide">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── CONTACTO ─────────────────────────────────────────────────────── */}
        <section ref={el => sectionRefs.current[7] = el} className="py-20 px-6 bg-gray-900 dark:bg-[#050507]">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-0 border-2 border-white/10">
              <div className="p-10 border-b-2 md:border-b-0 md:border-r-2 border-white/10 flex flex-col justify-between gap-8">
                <div>
                  <span className="inline-flex items-center bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-6 block w-fit">
                    // CONTACTO
                  </span>
                  <h2 className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white mb-4">
                    Trabajemos juntos.
                  </h2>
                  {settings.founder_contact_subtitle && (
                    <p className="text-gray-400 text-[0.92rem] leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                      {settings.founder_contact_subtitle}
                    </p>
                  )}
                </div>
                <div className="border-t border-white/10 pt-6 flex flex-col gap-3">
                  <a href={`${WA_BASE}?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-3 text-[#25D366] hover:underline font-mono text-[0.85rem] group">
                    <MessageCircle size={16} /> Abrir WhatsApp
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  {settings.founder_email && (
                    <a href={`mailto:${settings.founder_email}`}
                       className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors font-mono text-[0.85rem] group">
                      <Mail size={16} /> {settings.founder_email}
                    </a>
                  )}
                </div>
              </div>
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

export default Portfolio;
