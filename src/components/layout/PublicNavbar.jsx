import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const navItems = [
  { label: 'Beranda', path: '/' },
  { label: 'Profil Instansi', path: '/profil' },
  {
    label: 'Layanan',
    children: [
      { label: 'Layanan Haji', path: '/layanan-haji' },
      { label: 'Layanan Umrah', path: '/layanan-umrah' },
      { label: 'Informasi Manasik', path: '/manasik' },
    ],
  },
  { label: 'Berita & Pengumuman', path: '/berita' },
  { label: 'Informasi & Pengaduan', path: '/pengaduan' },
  { label: 'Kontak', path: '/kontak' },
];

export default function PublicNavbar() {
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(null);
  }, [location.pathname]);

  const navbarStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
    background: scrolled ? 'rgba(23,23,23,0.97)' : 'rgba(23,23,23,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: scrolled ? '1px solid rgba(212,175,55,0.2)' : 'none',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      <nav style={navbarStyle} role="navigation" aria-label="Navigasi utama">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
                PL
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-sm text-white leading-tight">{settings.site_short_name}</div>
                <div className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>Kabupaten Magetan</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.8)' }}
                      onClick={() => setDropdownOpen(dropdownOpen === item.label ? null : item.label)}
                      onMouseEnter={() => setDropdownOpen(item.label)}
                      onMouseLeave={() => setDropdownOpen(null)}
                      onKeyDown={(e) => { if (e.key === 'Escape') setDropdownOpen(null); }}
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen === item.label}
                    >
                      {item.label} <ChevronDown size={14} />
                    </button>
                    {dropdownOpen === item.label && (
                      <div
                        className="absolute top-full left-0 mt-1 min-w-[200px] bg-white rounded-xl shadow-xl overflow-hidden py-1"
                        style={{ border: '1px solid var(--color-border)' }}
                        onMouseEnter={() => setDropdownOpen(item.label)}
                        onMouseLeave={() => setDropdownOpen(null)}
                      >
                        {item.children.map(child => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              `block px-4 py-2.5 text-sm transition-colors ${isActive ? 'font-semibold' : 'hover:bg-gray-50'}`
                            }
                            style={({ isActive }) => ({ color: isActive ? 'var(--color-gold-dark)' : 'var(--color-text-primary)' })}
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'font-semibold' : 'hover:text-white'}`
                    }
                    style={({ isActive }) => ({
                      color: isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.8)',
                    })}
                  >
                    {item.label}
                  </NavLink>
                )
              )}
            </div>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <Link
                to="/kontak"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all"
                style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}
              >
                <Phone size={14} /> Hubungi Kami
              </Link>
              <button
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t" style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(23,23,23,0.98)' }}>
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-gold)' }}>
                      {item.label}
                    </div>
                    {item.children.map(child => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `block pl-6 pr-3 py-2.5 text-sm rounded-lg transition-colors ${isActive ? 'font-semibold' : ''}`
                        }
                        style={({ isActive }) => ({
                          color: isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.8)',
                          background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                        })}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive ? 'font-semibold' : ''}`
                    }
                    style={({ isActive }) => ({
                      color: isActive ? 'var(--color-gold)' : 'rgba(255,255,255,0.8)',
                      background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                    })}
                  >
                    {item.label}
                  </NavLink>
                )
              )}
              <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <Link to="/kontak" className="btn-primary w-full justify-center">
                  <Phone size={14} /> Hubungi Kami
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div style={{ height: '64px' }} />
    </>
  );
}
