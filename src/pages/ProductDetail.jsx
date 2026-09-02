import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Check, X, Download, Zap, Shield, Wifi, BarChart2, Users, Smartphone, Monitor, Layers } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useProducts } from '../hooks/useProducts';
import { usePlans } from '../hooks/usePlans';

gsap.registerPlugin(ScrollTrigger);

const FEATURE_ICONS = [Zap, BarChart2, Wifi, Users, Smartphone, Shield, Monitor, Layers];

// ─── Galería con auto-avance — misma que usa Leybrak POS, alimentada con las
// imágenes que el admin marcó (o no) como portada ──────────────────────────────
const Gallery = ({ shots }) => {
  const [active, setActive] = useState(0);
  const previewRef  = useRef(null);
  const intervalRef = useRef(null);
  const activeRef    = useRef(0);
  const shot = shots[active] || shots[0];

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

  useEffect(() => {
    activeRef.current = 0;
    (() => setActive(0))();
    intervalRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % shots.length;
      animateTo(next);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [shots]);

  const goTo = (idx) => {
    clearInterval(intervalRef.current);
    animateTo(idx);
    intervalRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % shots.length;
      animateTo(next);
    }, 4000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr] items-start">
      <div className="flex flex-col gap-3">
        <div className="p-4 border-l-2 border-leybrak-blue bg-[#0a0a0a] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-leybrak-blue/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <h4 className="font-black uppercase text-[1rem] tracking-tight text-white mb-1 relative z-10">{shot.label || `Imagen ${active + 1}`}</h4>
          {shot.desc && (
            <p className="text-gray-400 text-[0.8rem] leading-relaxed relative z-10" style={{ fontFamily: "'Barlow', sans-serif" }}>{shot.desc}</p>
          )}
        </div>

        {shots.length > 1 && (
          <div className="flex gap-1">
            {shots.map((_, i) => (
              <div key={i} className="flex-1 h-[2px] bg-gray-800 overflow-hidden rounded-full">
                <div
                  className={`h-full bg-leybrak-blue transition-all duration-300 ${i === active ? 'w-full' : 'w-0'}`}
                  style={{ transition: i === active ? 'width 4s linear' : 'none' }}
                />
              </div>
            ))}
          </div>
        )}

        {shots.length > 1 && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-1 pl-1">// PANTALLAS</p>
            {shots.map((s, i) => (
              <button key={i} onClick={() => goTo(i)}
                      className={`flex items-center gap-3 p-2 border border-transparent text-left transition-all duration-300 rounded-sm group
                        ${i === active ? 'bg-[#111] border-white/10' : 'hover:bg-[#0a0a0a]'}`}>
                <div className={`w-12 h-8 overflow-hidden flex-shrink-0 border transition-colors duration-300
                  ${i === active ? 'border-leybrak-blue' : 'border-gray-800 group-hover:border-gray-600'}`}>
                  <img src={s.src} alt={s.label || ''}
                       className={`w-full h-full object-cover object-top transition-opacity duration-300
                         ${i === active ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold uppercase tracking-tight leading-tight truncate transition-colors duration-300
                    ${i === active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{s.label || `Imagen ${i + 1}`}</p>
                  <p className={`text-[9px] font-mono mt-0.5 ${i === active ? 'text-leybrak-blue' : 'text-gray-700'}`}>0{i + 1}</p>
                </div>
                {i === active && <ArrowRight size={12} className="text-leybrak-blue mr-1 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={previewRef} className="flex justify-center items-center w-full">
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-leybrak-blue/15 blur-[80px] rounded-full z-0" />
          <img
            src={shot.src}
            alt={shot.label || ''}
            className="relative z-10 w-full object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Página de presentación genérica de un producto ───────────────────────────
// Se auto-genera para cada producto según su slug — el admin controla título,
// descripción, características, imágenes (y cuáles van en la portada) y planes.
// El layout es el mismo para los 3 tipos de plataforma; solo cambian qué
// bloques de imágenes se muestran (celular, escritorio o ambos).
const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const heroRef   = useRef(null);
  const featRefs  = useRef([]);
  const planRefs  = useRef([]);
  const ctaRef    = useRef(null);
  const galRef    = useRef(null);
  const heroImgRef = useRef(null);
  const plansSectionRef = useRef(null);

  const { settings } = useSiteSettings();
  const WA_BASE = `https://wa.me/${settings.whatsapp_number}`;

  const { products, loading } = useProducts();
  const product = products.find(p => p.slug === slug);
  const { plans: fetchedPlans } = usePlans(product?.id);
  const plans = fetchedPlans.map(p => ({
    name: p.name, price: p.price, priceNote: p.priceNote, tag: p.tag, featured: p.featured,
    desc: p.description, features: p.features,
  }));

  useEffect(() => {
    if (!loading && !product) navigate('/softwares', { replace: true });
  }, [loading, product, navigate]);

  const images   = product?.images || [];
  const platform = product?.platform || 'both';

  const coverImages = images.filter(img => img.cover);
  const heroImages  = platform !== 'desktop' ? (coverImages.length > 0 ? coverImages : images).slice(0, 2) : [];
  const remaining   = images.filter(img => !heroImages.includes(img));
  const galleryShots = platform !== 'mobile'
    ? (remaining.length > 0 ? remaining : images).map(img => ({ src: img.url, label: img.label, desc: img.description }))
    : [];

  useEffect(() => {
    if (!product) return;
    window.scrollTo(0, 0);

    gsap.fromTo(
      heroRef.current?.querySelectorAll('.hi'),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
    );

    if (heroImgRef.current) {
      gsap.fromTo(heroImgRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 }
      );
    }

    if (galRef.current) {
      gsap.fromTo(galRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: galRef.current, start: 'top 80%' } }
      );
    }

    featRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.4, delay: i * 0.06, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
      );
    });

    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: ctaRef.current, start: 'top 90%' } }
      );
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [product]);

  useEffect(() => {
    if (plans.length === 0) return;
    const ctx = gsap.context(() => {
      planRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, y: 50, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: i * 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
        );
      });
    }, plansSectionRef);
    return () => ctx.revert();
  }, [plans]);

  if (!product) return null;

  const waMessage = encodeURIComponent(`Hola Leybrak, quiero más información sobre ${product.title}.`);

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
              <span className="text-gray-900 dark:text-white font-bold">{product.title}</span>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">

              <div ref={heroRef} className="flex flex-col gap-6 relative z-20">
                {product.tag && (
                  <div className="hi">
                    <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold">
                      // {product.tag}
                    </span>
                  </div>
                )}

                <h1 className="hi text-[clamp(2.6rem,5vw,4.2rem)] font-black uppercase leading-[0.95] tracking-tight text-gray-900 dark:text-white">
                  {product.title}
                </h1>

                {product.description && (
                  <p className="hi text-[1.05rem] text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg border-l-2 border-gray-300 dark:border-gray-700 pl-4"
                     style={{ fontFamily: "'Barlow', sans-serif" }}>
                    {product.description}
                  </p>
                )}

                <div className="hi flex flex-col sm:flex-row gap-4 relative z-20 mt-2">
                  <a href={`${WA_BASE}?text=${waMessage}`}
                     target="_blank" rel="noopener noreferrer"
                     className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-8 py-4 font-bold uppercase tracking-widest text-[13px] border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group"
                     style={{ boxShadow: '4px 4px 0px #111827' }}>
                    {product.cta || 'Saber más'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  {plans.length > 0 && (
                    <button
                      onClick={() => document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center justify-center gap-3 bg-transparent text-gray-900 dark:text-white px-8 py-4 font-bold uppercase tracking-widest text-[13px] border-2 border-gray-900 dark:border-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200">
                      Ver precios
                    </button>
                  )}
                  {product.downloadUrl && (
                    <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-center gap-3 bg-transparent text-gray-900 dark:text-white px-8 py-4 font-bold uppercase tracking-widest text-[13px] border-2 border-gray-900 dark:border-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200">
                      <Download size={15} /> Descargar
                    </a>
                  )}
                </div>

                {product.features?.length > 0 && (
                  <div className="hi flex flex-col gap-2 mt-2">
                    {product.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check size={14} className="text-leybrak-blue flex-shrink-0" />
                        <span className="text-[0.85rem] text-gray-700 dark:text-gray-300" style={{ fontFamily: "'Barlow', sans-serif" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Imagen(es) de portada — solo si el producto aplica a celular */}
              {heroImages.length > 0 && (
                <div ref={heroImgRef} className="hidden lg:flex relative w-full h-[560px] items-center justify-center z-10">
                  <div className="absolute w-[90%] h-[90%] bg-leybrak-blue/10 blur-[120px] rounded-full z-0" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    {heroImages.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={img.label || product.title}
                        className={`absolute max-h-[92%] max-w-[80%] object-contain rounded-2xl shadow-2xl border border-white/10
                          ${heroImages.length > 1 && i === 0 ? '-translate-x-16 -translate-y-6 z-10 opacity-90' : ''}
                          ${heroImages.length > 1 && i === 1 ? 'translate-x-16 translate-y-6 z-20' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="absolute top-10 -right-40 w-[600px] h-[600px] border-[30px] border-gray-900/5 dark:border-white/5 rounded-full pointer-events-none z-0" />
        </section>

        {/* ── GALERÍA — solo si el producto aplica a escritorio ───────────────── */}
        {galleryShots.length > 0 && (
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
              <div ref={galRef}><Gallery shots={galleryShots} /></div>
            </div>
          </section>
        )}

        {/* ── CARACTERÍSTICAS ──────────────────────────────────────────────── */}
        {product.features?.length > 0 && (
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
                {product.features.map((f, i) => {
                  const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                  return (
                    <div key={i} ref={el => featRefs.current[i] = el}
                         className="border-r-2 border-b-2 border-gray-900/10 dark:border-white/10 p-8 hover:bg-leybrak-blue/5 transition-colors duration-200 bg-leybrak-light dark:bg-leybrak-dark">
                      <div className="w-10 h-10 bg-leybrak-blue flex items-center justify-center mb-5">
                        <Icon size={18} className="text-white" />
                      </div>
                      <p className="text-[0.95rem] font-bold text-gray-900 dark:text-white leading-snug"
                         style={{ fontFamily: "'Barlow', sans-serif" }}>{f}</p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-leybrak-blue/5 rounded-full pointer-events-none z-0" />
            </div>
          </section>
        )}

        {/* ── PLANES ───────────────────────────────────────────────────────── */}
        {plans.length > 0 && (
          <section id="planes" ref={plansSectionRef} className="py-20 px-6 border-b-2 border-gray-900/10 dark:border-white/10 bg-gray-50 dark:bg-[#08080a]">
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
                {plans.map((plan, i) => (
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
                            <div className={`text-[11px] font-mono ${plan.featured ? 'text-white/60' : 'text-white/50 dark:text-gray-900/50'}`}>{plan.priceNote || '/mes'}</div>
                          </div>
                        </div>
                        {plan.desc && (
                          <p className={`text-[0.82rem] mt-3 leading-relaxed ${plan.featured ? 'text-white/80' : 'text-white/60 dark:text-gray-900/60'}`}
                             style={{ fontFamily: "'Barlow', sans-serif" }}>{plan.desc}</p>
                        )}
                      </div>
                      <div className="px-8 py-6 flex flex-col flex-1 gap-3">
                        {(plan.features || []).map((f, j) => (
                          <div key={j} className="flex items-center gap-3">
                            {f.ok ? <Check size={14} className="text-leybrak-blue flex-shrink-0" /> : <X size={14} className="text-gray-300 dark:text-gray-700 flex-shrink-0" />}
                            <span className={`text-[0.83rem] font-mono ${f.ok ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700 line-through'}`}>{f.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="px-8 pb-8 mt-auto">
                        <a href={`${WA_BASE}?text=${encodeURIComponent(`Hola, me interesa el plan ${plan.name} de ${product.title} a S/${plan.price}/mes.`)}`}
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
        )}

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section ref={ctaRef} className="py-24 px-6 bg-gray-900 dark:bg-[#050507] overflow-hidden relative">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <span className="inline-flex items-center bg-white text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold mb-6">
              // TE_INTERESA
            </span>
            <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-black uppercase leading-[0.95] tracking-tight text-white mb-6">
              Hablemos de{' '}
              <span className="inline-block -skew-x-2 bg-leybrak-blue px-3 pb-1">
                {product.title}.
              </span>
            </h2>
            <p className="text-gray-400 text-[1rem] leading-relaxed mb-10 max-w-lg mx-auto"
               style={{ fontFamily: "'Barlow', sans-serif" }}>
              Escríbenos y te contamos cómo implementarlo en tu negocio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
              <a href={`${WA_BASE}?text=${waMessage}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center gap-3 bg-leybrak-blue text-white px-10 py-5 text-sm font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 group rounded-sm"
                 style={{ boxShadow: '4px 4px 0px rgba(255,255,255,0.15)' }}>
                {product.cta || 'Saber más'}
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

export default ProductDetail;
