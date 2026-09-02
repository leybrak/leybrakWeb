import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const PasswordPanel = () => {
  const { authFetch } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setSaving(true);
    try {
      await authFetch('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccess('Contraseña actualizada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-black uppercase text-gray-900 dark:text-white">Cambiar contraseña</h2>

      <form onSubmit={handleSubmit} className="border-2 border-gray-900 dark:border-white bg-white dark:bg-[#0f0f12] p-6 flex flex-col gap-4 max-w-sm">
        <input
          type="password"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2.5 text-[13px] font-mono outline-none"
        />
        <input
          type="password"
          placeholder="Nueva contraseña (mín. 8 caracteres)"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2.5 text-[13px] font-mono outline-none"
        />
        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="bg-transparent border-2 border-gray-300 dark:border-white/20 focus:border-leybrak-blue text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2.5 text-[13px] font-mono outline-none"
        />

        {error && <p className="text-red-500 text-[12px] font-mono">{error}</p>}
        {success && <p className="text-green-500 text-[12px] font-mono">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 bg-leybrak-blue text-white px-6 py-3 text-[12px] font-bold uppercase tracking-widest border-2 border-leybrak-blue hover:bg-transparent hover:text-leybrak-blue transition-all duration-200 disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  );
};

export default PasswordPanel;
