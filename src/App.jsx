import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx';
import Header          from './components/Header.jsx';
import Landing         from './pages/Landing.jsx';
import Softwares       from './pages/Softwares.jsx';
import LeybrakPOS      from './pages/LeybrakPOS.jsx';
import SoftwareAMedida from './pages/SoftwareAMedida.jsx';
import ProductDetail   from './pages/ProductDetail.jsx';
import Servicios       from './pages/Servicios.jsx';
import Nosotros        from './pages/Nosotros.jsx';
import Portfolio       from './pages/Portfolio.jsx';
import Descargas       from './pages/Descargas.jsx';
import NotFound        from './pages/NotFound.jsx';
import AdminLogin      from './pages/Admin/AdminLogin.jsx';
import AdminDashboard  from './pages/Admin/AdminDashboard.jsx';
import ProtectedRoute  from './components/Admin/ProtectedRoute.jsx';

// El header/nav público no se muestra dentro del panel de admin
const PublicHeader = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <Header />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <PublicHeader />
          <main className="font-sans antialiased">
            <Routes>
              <Route path="/"                        element={<Landing />}         />
              <Route path="/softwares"               element={<Softwares />}       />
              <Route path="/softwares/leybrak-pos"   element={<LeybrakPOS />}      />
              <Route path="/softwares/a-medida"      element={<SoftwareAMedida />} />
              <Route path="/softwares/:slug"         element={<ProductDetail />}   />
              <Route path="/servicios"               element={<Servicios />}       />
              <Route path="/nosotros"                element={<Nosotros />}        />
              <Route path="/portafolio"              element={<Portfolio />}       />
              <Route path="/descargas"               element={<Descargas />}       />
              <Route path="/admin/login"             element={<AdminLogin />}      />
              <Route path="/admin" element={
                <ProtectedRoute><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="*"                        element={<NotFound />}        />
            </Routes>
          </main>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;