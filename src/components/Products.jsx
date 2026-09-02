import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';

gsap.registerPlugin(ScrollTrigger);

const Products = () => {
  const sectionRef  = useRef(null);
  const labelRef    = useRef(null);
  const headingRef  = useRef(null);
  const subRef      = useRef(null);
  const cardRefs    = useRef([]);
  const { products } = useProducts('producto');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [labelRef.current, headingRef.current, subRef.current],
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, y: 64, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: i * 0.12, ease: 'power4.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
        );
        const handleEnter = () => {
          gsap.to(card, { y: -6, x: -4, duration: 0.25, ease: 'power2.out' });
          gsap.to(card.querySelector('.card-shadow'), { opacity: 1, x: 4, y: 4, duration: 0.25, ease: 'power2.out' });
        };
        const handleLeave = () => {
          gsap.to(card, { y: 0, x: 0, duration: 0.3, ease: 'power2.inOut' });
          gsap.to(card.querySelector('.card-shadow'), { opacity: 0.5, x: 6, y: 6, duration: 0.3, ease: 'power2.inOut' });
        };
        card.addEventListener('mouseenter', handleEnter);
        card.addEventListener('mouseleave', handleLeave);
        card._cleanup = () => {
          card.removeEventListener('mouseenter', handleEnter);
          card.removeEventListener('mouseleave', handleLeave);
        };
      });
    }, sectionRef);

    return () => {
      cardRefs.current.forEach(c => c?._cleanup?.());
      ctx.revert();
    };
  }, [products]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-6 overflow-hidden bg-white dark:bg-[#050507] border-t-2 border-gray-900 dark:border-white/10 transition-colors duration-300"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute top-12 right-8 text-gray-900/5 dark:text-white/5 font-black text-[120px] leading-none select-none pointer-events-none">04</div>
      <div className="absolute top-0 left-6 md:left-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1 font-mono text-[10px] uppercase tracking-widest font-bold">
        // MODULOS_DISPONIBLES
      </div>
      <span className="absolute top-10 left-8 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">+</span>
      <span className="absolute bottom-10 right-10 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">+</span>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 max-w-3xl">
          <div ref={labelRef} className="mb-5 mt-6">
            <span className="inline-flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] px-3 py-1.5 uppercase tracking-[0.2em] border-l-4 border-leybrak-blue font-bold">
              Lo que construimos
            </span>
          </div>
          <h2 ref={headingRef} className="text-[clamp(2.8rem,7vw,5.5rem)] font-black uppercase leading-[0.9] tracking-tight text-gray-900 dark:text-white mb-6">
            Sistemas que{' '}
            <span className="inline-block -skew-x-3 bg-leybrak-blue text-white px-3 pb-1">trabajan</span>
            {' '}por ti.
          </h2>
          <p ref={subRef} className="text-gray-600 dark:text-gray-400 text-[1rem] leading-relaxed border-l-2 border-gray-300 dark:border-gray-700 pl-4 max-w-xl"
             style={{ fontFamily: "'Barlow', sans-serif" }}>
            No vendemos tecnología por vender. Cada producto está pensado para resolver un problema concreto de negocios como el tuyo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <div key={product.id} ref={el => cardRefs.current[i] = el} className="relative flex flex-col">
              <div
                className="card-shadow absolute inset-0 bg-leybrak-blue border-2 border-leybrak-blue"
                style={{ transform: 'translate(6px, 6px)', opacity: 0.5, zIndex: 0, transition: 'none' }}
              />
              <div className="relative z-10 flex flex-col h-full bg-leybrak-light dark:bg-leybrak-dark border-2 border-gray-900 dark:border-white">
                <div className="flex items-center justify-between px-7 py-4 border-b-2 border-gray-900 dark:border-white">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">{product.sysName}</span>
                  <span className="font-mono text-[10px] font-bold text-gray-400 dark:text-gray-600">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="px-7 py-7 flex flex-col flex-1 gap-6">
                  <span className={`self-start text-[10px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 border font-mono
                    ${product.available ? 'border-leybrak-blue text-leybrak-blue' : 'border-gray-900 dark:border-white text-gray-900 dark:text-white'}`}>
                    {product.tag}
                  </span>
                  <h3 className="text-[1.6rem] font-black uppercase leading-tight text-gray-900 dark:text-white tracking-tight">{product.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[0.88rem] leading-relaxed flex-1" style={{ fontFamily: "'Barlow', sans-serif" }}>
                    {product.description}
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {product.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-[0.82rem] text-gray-900 dark:text-gray-300 font-mono">
                        <span className="text-leybrak-blue font-bold mt-px flex-shrink-0">›</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA — Link en lugar de button */}
                  <Link
                    to={product.to || '/softwares'}
                    className="mt-2 w-full flex items-center justify-between border-t-2 pt-4 font-bold uppercase tracking-widest text-[12px] transition-colors duration-200 group border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:text-leybrak-blue"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    <span>Saber más</span>
                    <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;