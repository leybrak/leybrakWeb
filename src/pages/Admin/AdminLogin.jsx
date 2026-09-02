import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const from = location.state?.from || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-leybrak-light dark:bg-leybrak-dark"
             style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      <div className="w-full max-w-sm border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12]">
        <div className="px-7 py-4 border-b-2 border-gray-900 dark:border-white flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-leybrak-blue">ADMIN_LOGIN</span>
          <LogIn size={16} className="text-gray-400" />
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-8 flex flex-col gap-4">
          <h1 className="text-2xl font-black uppercase text-gray-900 dark:text-white mb-2">Panel de control</h1>

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            autoFocus
            className="w-full bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white placeholder-gray-400 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white placeholder-gray-400 px-4 py-3 text-[13px] font-mono outline-none transition-colors duration-200 disabled:opacity-50"
          />

          {error && <p className="text-red-500 text-[12px] font-mono">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-3 bg-leybrak-blue text-white px-6 py-4 text-[13px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;
