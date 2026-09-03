import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Package, Settings, KeyRound, ArrowLeft, Tag, Wrench, Users, UserSquare2, Briefcase, FileText, Home, Inbox, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LeadsPanel from '../../components/Admin/LeadsPanel';
import ProductsPanel from '../../components/Admin/ProductsPanel';
import PlansPanel from '../../components/Admin/PlansPanel';
import ContentItemsPanel from '../../components/Admin/ContentItemsPanel';
import AboutPanel from '../../components/Admin/AboutPanel';
import TeamPanel from '../../components/Admin/TeamPanel';
import PortfolioPanel from '../../components/Admin/PortfolioPanel';
import InicioPanel from '../../components/Admin/InicioPanel';
import PageCopyPanel from '../../components/Admin/PageCopyPanel';
import SettingsPanel from '../../components/Admin/SettingsPanel';
import PasswordPanel from '../../components/Admin/PasswordPanel';

const ServiciosPanel = () => (
  <ContentItemsPanel heading="Servicios" apiPath="/api/services" itemLabel="servicio" />
);

const TABS = [
  { key: 'leads',         label: 'Leads',         icon: Inbox,       Panel: LeadsPanel },
  { key: 'inicio',        label: 'Inicio',        icon: Home,        Panel: InicioPanel },
  { key: 'productos',     label: 'Productos',     icon: Package,     Panel: ProductsPanel },
  { key: 'planes',        label: 'Planes',        icon: Tag,         Panel: PlansPanel },
  { key: 'servicios',     label: 'Servicios',     icon: Wrench,      Panel: ServiciosPanel },
  { key: 'nosotros',      label: 'Nosotros',      icon: Users,       Panel: AboutPanel },
  { key: 'equipo',        label: 'Equipo',        icon: UserSquare2, Panel: TeamPanel },
  { key: 'portafolio',    label: 'Portafolio',    icon: Briefcase,   Panel: PortfolioPanel },
  { key: 'contenido',     label: 'Contenido',     icon: FileText,    Panel: PageCopyPanel },
  { key: 'configuracion', label: 'Configuración', icon: Settings,    Panel: SettingsPanel },
  { key: 'contrasena',    label: 'Contraseña',    icon: KeyRound,    Panel: PasswordPanel },
];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab]     = useState('leads');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active      = TABS.find(t => t.key === activeTab);
  const ActivePanel = active?.Panel;

  const selectTab = (key) => { setActiveTab(key); setSidebarOpen(false); };

  return (
    <div className="min-h-screen flex bg-leybrak-light dark:bg-leybrak-dark" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>

      {/* Fondo oscuro al abrir el menú en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 flex-shrink-0 border-r-2 border-gray-900 dark:border-white
          bg-leybrak-light dark:bg-leybrak-dark z-50 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="md:hidden flex justify-end p-3">
          <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2 md:pt-6 border-b-2 border-gray-900/10 dark:border-white/10">
          <Link to="/" className="flex items-center gap-2 text-[11px] font-mono text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3">
            <ArrowLeft size={13} /> Volver al sitio
          </Link>
          <h1 className="text-xl font-black uppercase text-gray-900 dark:text-white leading-tight">
            Panel de administración
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => selectTab(key)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-[12px] font-bold uppercase tracking-widest border-l-4 transition-colors duration-200
                ${activeTab === key
                  ? 'border-leybrak-blue text-leybrak-blue bg-leybrak-blue/5'
                  : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-900/5 dark:hover:bg-white/5'}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-gray-900/10 dark:border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut size={15} /> Salir
          </button>
        </div>
      </aside>

      {/* ── Contenido ────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b-2 border-gray-900 dark:border-white sticky top-0 bg-leybrak-light dark:bg-leybrak-dark z-30">
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" className="text-gray-900 dark:text-white">
            <Menu size={22} />
          </button>
          <span className="text-[12px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">{active?.label}</span>
          <span className="w-[22px]" />
        </div>

        <div className="p-6 md:p-10 max-w-5xl">
          {ActivePanel && <ActivePanel />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
