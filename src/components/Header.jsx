import { useContext, useEffect, useRef, useState } from 'react';
import logoCompacto from '../assets/logo/logo-compacto.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { Moon, Sun, MessageCircle, LayoutGrid, Wrench, Users, Download } from 'lucide-react';
import gsap from 'gsap';
import { useScrollTo } from '../hooks/useScrollTo';

const WHATSAPP_NUMBER = '51976267494';
const WHATSAPP_MSG    = encodeURIComponent('Hola Leybrak, quiero más información.');
const WA_URL          = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

const NAV_ITEMS = [
  { label: 'Softwares', to: '/softwares', icon: LayoutGrid },
  { label: 'Servicios', to: '/servicios', icon: Wrench     },
  { label: 'Nosotros',  to: '/nosotros',  icon: Users      },
  { label: 'Descargas', to: '/descargas', icon: Download   },
];

// ─── Bottom bar mobile ────────────────────────────────────────────────────────
const BottomBar = ({ isDark, toggleTheme }) => {
  const location     = useLocation();
  const barRef       = useRef(null);
  const indicatorRef = useRef(null);
  const itemRefs     = useRef([]);
  const scrollTo     = useScrollTo();

  useEffect(() => {
    gsap.fromTo(barRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)', delay: 0.3 }
    );
  }, []);

  useEffect(() => {
    const idx = NAV_ITEMS.findIndex(i => location.pathname === i.to);
    const el  = itemRefs.current[idx];
    if (!el || !indicatorRef.current) return;
    const bar  = barRef.current.getBoundingClientRect();
    const item = el.getBoundingClientRect();
    gsap.to(indicatorRef.current, {
      x: item.left - bar.left + item.width / 2 - 12,
      duration: 0.3, ease: 'power3.out',
      opacity: idx >= 0 ? 1 : 0,
    });
  }, [location.pathname]);

  const isActive = (to) => location.pathname === to;

  return (
    <nav ref={barRef}
         className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-[#0f0f12] border-t-2 border-gray-900 dark:border-white/10"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div ref={indicatorRef} className="absolute -top-[2px] w-6 h-[3px] bg-leybrak-blue opacity-0" />
      <div className="grid grid-cols-6 items-stretch h-16">

        {NAV_ITEMS.map((item, i) => {
          const Icon   = item.icon;
          const active = item.to ? isActive(item.to) : false;
          const bump   = () => gsap.to(itemRefs.current[i], {
            scale: 0.85, duration: 0.08,
            onComplete: () => gsap.to(itemRefs.current[i], { scale: 1, duration: 0.2, ease: 'back.out(3)' })
          });
          const content = (
            <>
              <Icon size={20} className={`transition-colors duration-200 ${active ? 'text-leybrak-blue' : 'text-gray-400 dark:text-gray-600'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-widest font-mono transition-colors duration-200 ${active ? 'text-leybrak-blue' : 'text-gray-400 dark:text-gray-600'}`}>
                {item.label}
              </span>
            </>
          );
          return item.href ? (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
               ref={el => itemRefs.current[i] = el}
               className="flex flex-col items-center justify-center gap-1 group"
               onClick={bump}>
              {content}
            </a>
          ) : (
            <Link key={item.to} to={item.to} ref={el => itemRefs.current[i] = el}
                  className="flex flex-col items-center justify-center gap-1 group"
                  onClick={bump}>
              {content}
            </Link>
          );
        })}

        <button
          onClick={() => {
            toggleTheme();
            gsap.fromTo('#theme-tab-icon', { rotation: -30, scale: 0.7 }, { rotation: 0, scale: 1, duration: 0.35, ease: 'back.out(3)' });
          }}
          className="flex flex-col items-center justify-center gap-1 group">
          {isDark
            ? <Sun  id="theme-tab-icon" size={20} className="text-gray-400 dark:text-gray-600 group-hover:text-yellow-400 transition-colors" />
            : <Moon id="theme-tab-icon" size={20} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
          }
          <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-gray-400 dark:text-gray-600">Tema</span>
        </button>

        {/* CTA → scroll al formulario */}
        <button
          onClick={() => scrollTo('cta')}
          className="flex flex-col items-center justify-center gap-1 bg-leybrak-blue group active:bg-blue-700 transition-colors">
          <MessageCircle size={20} className="text-white" />
          <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-white">Demo</span>
        </button>

      </div>
    </nav>
  );
};

// ─── Header desktop ───────────────────────────────────────────────────────────
const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const isDark   = theme === 'dark';
  const logoRef  = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollTo = useScrollTo();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const glitchText = (el, finalText) => {
    if (!el) return;
    const chars = '█▓▒░<>[]{}!@#$%^&*()_+';
    const steps = 15;
    let count = 0;
    const id = setInterval(() => {
      if (count >= steps) { el.textContent = finalText; clearInterval(id); return; }
      const prog = count / steps;
      const revealed = Math.floor(prog * finalText.length);
      let result = '';
      for (let i = 0; i < finalText.length; i++) {
        result += i < revealed ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = result;
      count++;
    }, 30);
  };

  const scrambleText = (e, originalText) => {
    const el = e.target;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let iteration = 0;
    clearInterval(el.dataset.intervalId);
    const interval = setInterval(() => {
      el.innerText = originalText.split('').map((letter, index) => {
        if (index < iteration) return originalText[index];
        return chars[Math.floor(Math.random() * 26)];
      }).join('');
      if (iteration >= originalText.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    el.dataset.intervalId = interval;
  };

  useEffect(() => { glitchText(logoRef.current, 'LEYBRAK'); }, [theme]);

  const handleLogoClick = () => {
    if (location.pathname !== '/') navigate('/');
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    glitchText(logoRef.current, 'LEYBRAK');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .leybrak-brutal-shadow { box-shadow: 4px 4px 0px 0px #2563eb; transition: box-shadow 0.15s ease, transform 0.15s ease; }
        .leybrak-brutal-shadow:active { box-shadow: 0px 0px 0px 0px #2563eb; transform: translate(4px, 4px); }
        .leybrak-marker-underline {
          background-image: linear-gradient(transparent 60%, rgba(37,99,235,0.8) 40%);
          background-size: 0 100%; background-repeat: no-repeat; transition: background-size 0.3s ease;
        }
        .leybrak-marker-underline:hover, .leybrak-marker-underline.active { background-size: 100% 100%; }
        @media (max-width: 767px) { main { padding-bottom: calc(4rem + env(safe-area-inset-bottom)); } }
      `}</style>

      <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b-2 overflow-hidden
        ${scrolled
          ? 'bg-leybrak-light dark:bg-leybrak-dark border-gray-900 dark:border-white shadow-[0_4px_0_rgba(0,0,0,0.1)]'
          : 'bg-transparent border-transparent'
        }`}>

        <div className="w-full bg-gray-900 dark:bg-white text-leybrak-light dark:text-gray-900 text-[10px] font-mono tracking-[0.2em] uppercase py-1 px-6 flex justify-between items-center">
          <span>// SYS.CORE_V1.0.0</span>
          <span className="hidden md:inline-block animate-pulse">STATUS: ONLINE_</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <div
            className="cursor-pointer relative flex items-center gap-3"
            onClick={handleLogoClick}
          >
            <img
              src={logoCompacto}
              alt="Leybrak"
              style={{ height: '110px', width: 'auto', position: 'absolute', top: '50%', left: 0, transform: 'translateY(-53%)', zIndex: 10 }}
            />
            {/* Espacio para que el img no tape el texto */}
            <span style={{ display: 'inline-block', width: '80px' }} />
            {/* Nombre visible solo en desktop */}
            <span
              ref={logoRef}
              className="hidden md:inline text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase"
            >
              LEYBRAK
            </span>
          </div>

          <nav className="hidden md:flex gap-10 items-center">
            {NAV_ITEMS.map((item, index) => (
              <div key={item.label} className="flex flex-col items-start">
                <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 mb-[-2px]">0{index + 1}</span>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer"
                     onMouseEnter={(e) => scrambleText(e, item.label.toUpperCase())}
                     className="text-sm font-bold tracking-widest text-gray-900 dark:text-white uppercase leybrak-marker-underline">
                    {item.label.toUpperCase()}
                  </a>
                ) : (
                  <Link to={item.to}
                        onMouseEnter={(e) => scrambleText(e, item.label.toUpperCase())}
                        className={`text-sm font-bold tracking-widest text-gray-900 dark:text-white uppercase leybrak-marker-underline ${isActive(item.to) ? 'active' : ''}`}>
                    {item.label.toUpperCase()}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={toggleTheme}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Agendar Demo → scroll al CTA */}
            <button
              onClick={() => scrollTo('cta')}
              className="flex items-center gap-2 border-2 border-gray-900 dark:border-white bg-leybrak-light dark:bg-leybrak-dark text-gray-900 dark:text-white px-6 py-2 text-sm font-bold uppercase tracking-widest leybrak-brutal-shadow group relative overflow-hidden">
              <span className="relative z-10">AGENDAR_DEMO</span>
              <div className="absolute inset-0 h-full w-[200%] bg-gradient-to-r from-transparent via-leybrak-blue to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-30 pointer-events-none" />
            </button>
          </div>

          {/* Mobile — solo toggle tema */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleTheme}
                    className="w-9 h-9 flex items-center justify-center border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

        </div>
      </header>

      <BottomBar isDark={isDark} toggleTheme={toggleTheme} />
    </>
  );
};

export default Header;