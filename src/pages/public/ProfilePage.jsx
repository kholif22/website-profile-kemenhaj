import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { PageHeader, SectionHeader, InfoAlert } from '../../components/ui/index';
import { Building2, Target, Award, Users, ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ProfilePage() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    document.title = `Profil Instansi - ${settings.site_short_name || 'PLHUT Magetan'}`;
    window.scrollTo(0, 0);
  }, [settings.site_short_name]);

  return (
    <div className="pb-20">
      <PageHeader
        title="Profil Instansi"
        subtitle="Mengenal lebih dekat Pusat Layanan Haji dan Umrah Terpadu (PLHUT) Kabupaten Magetan"
        breadcrumbs={['Beranda', 'Profil Instansi']}
      />

      <div className="container mx-auto px-4 mt-12">
        {/* Notice of Demo Data / Institutional Notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <InfoAlert type="info">
            <strong>Catatan Resmi:</strong> Seluruh informasi profil kelembagaan yang ditampilkan mengacu pada ketetapan resmi Kantor Kementerian Agama Kabupaten Magetan. Data pejabat dan kontak dapat diperbarui secara berkala oleh pengelola instansi.
          </InfoAlert>
        </div>

        {/* Section: Sejarah & Gambaran Umum */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="card p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black" style={{ background: 'var(--color-gold)' }}>
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-black)' }}>
                  Gambaran Umum & Sejarah
                </h2>
                <p className="text-xs text-yellow-500">Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan</p>
              </div>
            </div>

            <div className="prose-plhut text-sm md:text-base space-y-4 text-gray-700">
              <p>
                Pusat Layanan Haji dan Umrah Terpadu (PLHUT) Kabupaten Magetan didirikan sebagai wujud komitmen Kementerian Agama dalam menghadirkan pelayanan publik yang terintegrasi, transparan, akuntabel, dan nyaman bagi seluruh calon jemaah haji dan umrah.
              </p>
              <p>
                Keberadaan gedung PLHUT di Kabupaten Magetan mempertemukan seluruh proses administrasi pelayanan haji dalam satu atap, mulai dari pendaftaran setoran awal di Bank Penerima Setoran (BPS BPIH), verifikasi berkas, pemindaian biometrik (foto dan sidik jari), hingga penerimaan Surat Pendaftaran Pergi Haji (SPPH).
              </p>
              <p>
                Dengan mengedepankan prinsip pelayanan prima dan nilai-nilai keislaman, PLHUT siap melayani masyarakat Magetan dengan sepenuh hati demi kenyamanan dan kelancaran ibadah ke Tanah Suci.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Visi & Misi */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-black" style={{ background: 'var(--color-gold)' }}>
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-black)' }}>Visi</h3>
              <p className="text-sm leading-relaxed text-gray-700">
                "Terwujudnya pelayanan haji dan umrah yang profesional, transparan, akuntabel, berkeadilan, dan memberikan rasa aman serta kepuasan bagi masyarakat Kabupaten Magetan."
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-black" style={{ background: 'var(--color-gold)' }}>
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-black)' }}>Misi</h3>
              <ul className="text-sm space-y-2 text-gray-700 list-disc list-inside">
                <li>Meningkatkan kualitas tata kelola pelayanan pendaftaran dan pembatalan haji.</li>
                <li>Menyelenggarakan pembinaan manasik haji yang komprehensif dan mandiri.</li>
                <li>Memberikan pengawasan dan advokasi perlindungan bagi jemaah umrah.</li>
                <li>Memanfaatkan teknologi informasi untuk keterbukaan informasi publik yang cepat dan akurat.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Tugas dan Fungsi */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="card p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black" style={{ background: 'var(--color-gold)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-black)' }}>Tugas dan Fungsi</h3>
                <p className="text-xs text-gray-500">Berdasarkan Regulasi Penyelenggaraan Haji dan Umrah</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                <h4 className="font-semibold text-black mb-1">1. Pelayanan Administrasi</h4>
                <p>Melaksanakan pendaftaran, verifikasi dokumen, pembatalan, dan pelimpahan porsi calon jemaah haji.</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                <h4 className="font-semibold text-black mb-1">2. Pembinaan & Manasik</h4>
                <p>Merencanakan dan menyelenggarakan bimbingan manasik haji reguler tingkat kabupaten dan kecamatan.</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                <h4 className="font-semibold text-black mb-1">3. Advokasi & Pengawasan Umrah</h4>
                <p>Sosialisasi legalitas Penyelenggara Perjalanan Ibadah Umrah (PPIU) serta fasilitasi pengaduan jemaah.</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                <h4 className="font-semibold text-black mb-1">4. Layanan Terpadu Satu Atap</h4>
                <p>Koordinasi bersama BPS BPIH, Dinas Kesehatan, dan instansi terkait keberangkatan jemaah haji.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Struktur Pimpinan */}
        <section className="max-w-4xl mx-auto mb-16">
          <SectionHeader title="Struktur & Pejabat" subtitle="Pengelola dan penanggung jawab pelayanan PLHUT Magetan" />
          <div className="card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 text-black" style={{ background: 'var(--color-gold)' }}>
                  <Users size={40} />
                </div>
                <h4 className="font-bold text-base text-black">{settings.site_welcome_name}</h4>
                <p className="text-xs text-yellow-700 font-medium mt-1">{settings.site_welcome_title}</p>
                <span className="mt-3 text-[11px] px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                  Pejabat Penanggung Jawab
                </span>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <p>
                  Pengelolaan operasional PLHUT berada di bawah naungan Seksi Penyelenggaraan Haji dan Umrah (PHU) Kantor Kementerian Agama Kabupaten Magetan.
                </p>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                  <p className="font-medium text-black mb-1">Unit Layanan Aktif:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Loket Pendaftaran & Biometrik Haji</li>
                    <li>Loket BPS BPIH Terpadu</li>
                    <li>Ruang Konsultasi & Advokasi Jemaah</li>
                    <li>Aula Pertemuan & Bimbingan Manasik</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Kontak & Jam Layanan */}
        <section className="max-w-4xl mx-auto">
          <div className="card p-8 md:p-10">
            <h3 className="text-xl font-bold mb-6 text-black">Lokasi & Jam Kerja</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="block text-black">Alamat Kantor:</strong>
                    <span>{settings.site_address}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="block text-black">Telepon / WhatsApp:</strong>
                    <span>{settings.site_phone}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="block text-black">Email Resmi:</strong>
                    <span>{settings.site_email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="block text-black">Jam Operasional:</strong>
                    <span>{settings.site_hours}</span>
                    <p className="text-xs text-gray-500 mt-1">Sabtu, Minggu & Hari Libur Nasional: Tutup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
