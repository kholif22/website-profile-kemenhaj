import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const quickLinks = [
  { label: 'Beranda', path: '/' },
  { label: 'Profil Instansi', path: '/profil' },
  { label: 'Layanan Haji', path: '/layanan-haji' },
  { label: 'Layanan Umrah', path: '/layanan-umrah' },
  { label: 'Informasi Manasik', path: '/manasik' },
  { label: 'Berita & Pengumuman', path: '/berita' },
  { label: 'Informasi & Pengaduan', path: '/pengaduan' },
  { label: 'Kontak & Lokasi', path: '/kontak' },
];

export default function PublicFooter() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--color-black)', color: 'rgba(255,255,255,0.75)' }}>
      {/* Gold top border */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-light), var(--color-gold))' }} />

      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black" style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
                PL
              </div>
              <div>
                <div className="font-bold text-white text-sm">{settings.site_short_name}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Kabupaten Magetan</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-sm">{settings.site_description}</p>

            {/* Social media */}
            <div className="flex gap-3">
              {settings.site_facebook && (
                <a href={settings.site_facebook} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="Facebook">
                  <Facebook size={16} />
                </a>
              )}
              {settings.site_instagram && (
                <a href={settings.site_instagram} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="Instagram">
                  <Instagram size={16} />
                </a>
              )}
              {settings.site_youtube && (
                <a href={settings.site_youtube} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="Youtube">
                  <Youtube size={16} />
                </a>
              )}
              {settings.site_twitter && (
                <a href={settings.site_twitter} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.08)' }} aria-label="Twitter">
                  <Twitter size={16} />
                </a>
              )}
              {!settings.site_facebook && !settings.site_instagram && !settings.site_youtube && (
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Tautan media sosial belum dikonfigurasi</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 pb-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
              Navigasi Cepat
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors flex items-center gap-1.5"
                    style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '10px' }}>▶</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 pb-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.3)' }}>
              Informasi Kontak
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span>{settings.site_address}</span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} className="flex-shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span>{settings.site_phone}</span>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="flex-shrink-0" style={{ color: 'var(--color-gold)' }} />
                <span>{settings.site_email}</span>
              </li>
              <li className="flex gap-3">
                <Clock size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-gold)' }} />
                <div>
                  <div>Jam Pelayanan:</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>{settings.site_hours}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
          <p>{settings.site_footer_text || `© ${year} PLHUT Kabupaten Magetan. Hak cipta dilindungi.`}</p>
          <div className="flex gap-4">
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
