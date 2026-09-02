import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Package, Settings, KeyRound, ArrowLeft, Tag, Wrench, Users, FileText, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProductsPanel from '../../components/Admin/ProductsPanel';
import PlansPanel from '../../components/Admin/PlansPanel';
import ContentItemsPanel from '../../components/Admin/ContentItemsPanel';
import AboutPanel from '../../components/Admin/AboutPanel';
import InicioPanel from '../../components/Admin/InicioPanel';
import PageCopyPanel from '../../components/Admin/PageCopyPanel';
import SettingsPanel from '../../components/Admin/SettingsPanel';
import PasswordPanel from '../../components/Admin/PasswordPanel';

const ServiciosPanel = () => (
  <ContentItemsPanel heading="Servicios" apiPath="/api/services" itemLabel="servicio" />
);

const TABS = [
  { key: 'inicio',        label: 'Inicio',        icon: Home,      Panel: InicioPanel },
  { key: 'productos',     label: 'Productos',     icon: Package,   Panel: ProductsPanel },
  { key: 'planes',        label: 'Planes',        icon: Tag,       Panel: PlansPanel },
  { key: 'servicios',     label: 'Servicios',      icon: Wrench,    Panel: ServiciosPanel },
  { key: 'nosotros',      label: 'Nosotros',       icon: Users,     Panel: AboutPanel },
  { key: 'contenido',     label: 'Contenido',     icon: FileText,  Panel: PageCopyPanel },
  { key: 'configuracion', label: 'Configuración', icon: Settings,  Panel: SettingsPanel },
  { key: 'contrasena',    label: 'Contraseña',    icon: KeyRound,  Panel: PasswordPanel },
];

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('productos');

  const ActivePanel = TABS.find(t => t.key === activeTab)?.Panel;

  return (
    <section className="min-h-screen pt-10 pb-24 px-6 bg-leybrak-light dark:bg-leybrak-dark"
             style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-[11px] font-mono text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
              <ArrowLeft size={13} /> Volver al sitio
            </Link>
            <h1 className="text-3xl font-black uppercase text-gray-900 dark:text-white">Panel de administración</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut size={15} /> Salir
          </button>
        </div>

        <div className="flex gap-2 mb-8 border-b-2 border-gray-900 dark:border-white">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-[12px] font-bold uppercase tracking-widest border-b-2 -mb-[2px] transition-colors duration-200
                ${activeTab === key
                  ? 'border-leybrak-blue text-leybrak-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {ActivePanel && <ActivePanel />}
      </div>
    </section>
  );
};

export default AdminDashboard;
