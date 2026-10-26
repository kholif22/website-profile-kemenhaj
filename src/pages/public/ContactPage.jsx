import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSEO } from '../../hooks/useSEO';
import { PageHeader, SectionHeader, InfoAlert } from '../../components/ui/index';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink, Navigation, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

// Titik lokasi resmi di Google Maps. Nama "Kemenhaj Magetan" sudah terdaftar
// sebagai place, sehingga embed dan tautan langsung mengarah ke titik tersebut.
const MAP_QUERY = 'Kemenhaj Magetan';
const MAP_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`;
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

export default function ContactPage() {
  const { settings } = useSiteSettings();
  useSEO({
    title: 'Kontak & Lokasi',
    description: 'Alamat kantor, telepon, email, jam pelayanan, dan peta lokasi PLHUT Kabupaten Magetan.',
    url: '/kontak',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pb-24">
      <PageHeader
        title="Kontak & Lokasi Kantor"
        subtitle="Informasi alamat, nomor pelayanan, jam kerja, dan peta lokasi PLHUT Kabupaten Magetan"
        breadcrumbs={['Beranda', 'Kontak & Lokasi']}
      />

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        {/* Verification Note */}
        <InfoAlert type="info">
          <strong>Informasi Verifikasi:</strong> Data kontak dan koordinat lokasi yang tercantum merupakan kanal resmi pelayanan masyarakat Kementerian Agama Kabupaten Magetan.
        </InfoAlert>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

          {/* Kolom Kiri: Detail Kontak (5 kolom) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card p-6 md:p-8">
              <h2 className="text-xl font-bold text-black mb-6">Kantor Pelayanan Terpadu</h2>

              <div className="space-y-6 text-xs md:text-sm text-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black flex-shrink-0" style={{ background: 'var(--color-gold)' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong className="block text-black mb-1">Alamat Kantor:</strong>
                    <p className="leading-relaxed">{settings.site_address}</p>
                    <p className="text-gray-500 text-xs mt-0.5">Kabupaten Magetan, Jawa Timur</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black flex-shrink-0" style={{ background: 'var(--color-gold)' }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong className="block text-black mb-1">Telepon & WhatsApp Pelayanan:</strong>
                    <p>{settings.site_phone}</p>
                    <span className="text-xs text-yellow-700 font-medium">Buka pada jam kerja kantor</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black flex-shrink-0" style={{ background: 'var(--color-gold)' }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong className="block text-black mb-1">Email Resmi:</strong>
                    <p>{settings.site_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black flex-shrink-0" style={{ background: 'var(--color-gold)' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <strong className="block text-black mb-1">Jam Operasional:</strong>
                    <p>{settings.site_hours}</p>
                    <p className="text-gray-500 text-xs mt-1">Sabtu, Minggu & Hari Libur Nasional: Tutup</p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-xs text-black uppercase tracking-wider mb-3">Media Sosial Resmi:</h3>
                <div className="flex items-center gap-3">
                  {settings.site_facebook && (
                    <a href={settings.site_facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700" aria-label="Facebook">
                      <Facebook size={18} />
                    </a>
                  )}
                  {settings.site_instagram && (
                    <a href={settings.site_instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700" aria-label="Instagram">
                      <Instagram size={18} />
                    </a>
                  )}
                  {settings.site_youtube && (
                    <a href={settings.site_youtube} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700" aria-label="YouTube">
                      <Youtube size={18} />
                    </a>
                  )}
                  {settings.site_twitter && (
                    <a href={settings.site_twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700" aria-label="Twitter">
                      <Twitter size={18} />
                    </a>
                  )}
                  {!settings.site_facebook && !settings.site_instagram && !settings.site_youtube && (
                    <p className="text-xs text-gray-400">Tautan media sosial belum dikonfigurasi.</p>
                  )}
                </div>
              </div>

              {/* CTA ke Form Pengaduan */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link to="/pengaduan" className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2">
                  <MessageSquare size={16} /> Buka Formulir Pertanyaan Online
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Peta Lokasi (7 kolom) */}
          <div className="lg:col-span-7">
            <div className="card p-6 md:p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-base text-black">Peta Navigasi Lokasi</h3>
                  <div className="flex items-center gap-3">
                    <a
                      href={MAP_DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-700 hover:underline"
                    >
                      <Navigation size={13} /> Rute
                    </a>
                    <a
                      href={MAP_SEARCH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-700 hover:underline"
                    >
                      Buka di Google Maps <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-6">
                  Gedung PLHUT berada di kawasan Kantor Kementerian Agama (Kemenhaj) Kabupaten Magetan untuk mempermudah akses jemaah.
                </p>

                {/* Map Embed Container */}
                <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden border border-gray-200 bg-stone-100 relative">
                  <iframe
                    title="Peta Lokasi Kemenhaj Magetan"
                    src={MAP_EMBED_URL}
                    className="w-full h-full border-0"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>Panduan Akses: Dekat pusat pemerintahan Kabupaten Magetan dan mudah diakses transportasi umum.</span>
                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 flex-shrink-0 font-semibold text-yellow-700 hover:underline"
                >
                  <Navigation size={13} /> Petunjuk Arah
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
