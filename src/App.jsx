import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Header          from './components/Header.jsx';
import Landing         from './pages/Landing.jsx';
import Softwares       from './pages/Softwares.jsx';
import LeybrakPOS      from './pages/LeybrakPOS.jsx';
import SoftwareAMedida from './pages/SoftwareAMedida.jsx';
import Servicios       from './pages/Servicios.jsx';
import Nosotros        from './pages/Nosotros.jsx';
import Descargas       from './pages/Descargas.jsx';
import NotFound        from './pages/NotFound.jsx';

function App() {
  return (
    <ThemeProvider>
      <Header />
      <main className="font-sans antialiased">
        <Routes>
          <Route path="/"                        element={<Landing />}         />
          <Route path="/softwares"               element={<Softwares />}       />
          <Route path="/softwares/leybrak-pos"   element={<LeybrakPOS />}      />
          <Route path="/softwares/a-medida"      element={<SoftwareAMedida />} />
          <Route path="/servicios"               element={<Servicios />}       />
          <Route path="/nosotros"                element={<Nosotros />}        />
          <Route path="/descargas"               element={<Descargas />}       />
          <Route path="*"                        element={<NotFound />}        />
        </Routes>
      </main>
    </ThemeProvider>
  );
}

export default App;