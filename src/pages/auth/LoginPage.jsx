import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `Login Administrator - ${settings.site_short_name || 'PLHUT Magetan'}`;
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate, settings.site_short_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email/username dan kata sandi wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login berhasil! Selamat datang.');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Login gagal. Periksa email/username dan kata sandi.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-900 relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl p-8 shadow-2xl relative z-10 text-white">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-black mx-auto mb-4" style={{ background: 'var(--color-gold)' }}>
            PL
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Portal Administrator</h1>
          <p className="text-xs text-gray-400">
            {settings.site_name || 'Pusat Haji dan Umrah Terpadu Kab. Magetan'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email atau Username
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                required
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 pl-11 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-yellow-500 transition-colors"
                placeholder="hajimagetan atau nama@plhut-magetan.go.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 pl-11 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-yellow-500 transition-colors"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? 'Memverifikasi...' : <><ShieldCheck size={16} /> Masuk ke Dashboard</>}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-800/80 text-center">
          <Link to="/" className="text-xs text-yellow-500/80 hover:text-yellow-400 transition-colors">
            ← Kembali ke Website Publik
          </Link>
        </div>

        {/* Security notice */}
        <div className="mt-6 p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-gray-400 text-center">
          <span className="block text-gray-300 font-semibold mb-0.5">Pemberitahuan Keamanan:</span>
          Akses panel ini terbatas untuk petugas resmi. Hubungi administrator sistem apabila Anda memerlukan akun atau mengalami kendala login.
        </div>
      </div>
    </div>
  );
}
