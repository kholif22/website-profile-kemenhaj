import { useState, useEffect, createContext, useContext } from 'react';
import { settingsAPI } from '../services/api';

const SiteSettingsContext = createContext({});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    site_name: 'Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan',
    site_short_name: 'PLHUT Magetan',
    site_description: 'Pusat informasi resmi pelayanan haji dan umrah Kabupaten Magetan',
    site_address: '[Alamat kantor akan diisi setelah verifikasi]',
    site_phone: '[Nomor telepon akan diisi setelah verifikasi]',
    site_email: '[Email resmi akan diisi setelah verifikasi]',
    site_hours: 'Senin - Jumat: 08.00 - 16.00 WIB',
    site_hero_title: 'Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan',
    site_hero_subtitle: 'Melayani masyarakat Kabupaten Magetan dalam urusan ibadah haji dan umrah dengan profesional, transparan, dan amanah.',
    site_welcome_name: '[Nama Pimpinan — akan diisi setelah verifikasi]',
    site_welcome_title: '[Jabatan Pimpinan — akan diisi setelah verifikasi]',
    site_welcome_text: 'Selamat datang di website resmi Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan.',
    site_footer_text: '© 2025 PLHUT Kabupaten Magetan.',
    site_facebook: '',
    site_instagram: '',
    site_youtube: '',
    site_twitter: '',
  });

  useEffect(() => {
    settingsAPI.getAll()
      .then(res => setSettings(prev => ({ ...prev, ...res.data })))
      .catch(() => {}); // use defaults if API fails
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
