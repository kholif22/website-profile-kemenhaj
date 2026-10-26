import React, { useEffect, useState } from 'react';
import { staffAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSEO } from '../../hooks/useSEO';
import { PageHeader, SectionHeader, InfoAlert, LoadingSpinner } from '../../components/ui/index';
import { formatNewsContent } from '../../utils/helpers';
import { Building2, Target, Award, Users, ShieldCheck, MapPin, Phone, Mail, Clock, UserRound } from 'lucide-react';

const FALLBACK_HISTORY = [
  'Pusat Layanan Haji dan Umrah Terpadu (PLHUT) Kabupaten Magetan didirikan sebagai wujud komitmen Kementerian Agama dalam menghadirkan pelayanan publik yang terintegrasi, transparan, akuntabel, dan nyaman bagi seluruh calon jemaah haji dan umrah.',
  'Keberadaan gedung PLHUT di Kabupaten Magetan mempertemukan seluruh proses administrasi pelayanan haji dalam satu atap, mulai dari pendaftaran setoran awal di Bank Penerima Setoran (BPS BPIH), verifikasi berkas, pemindaian biometrik (foto dan sidik jari), hingga penerimaan Surat Pendaftaran Pergi Haji (SPPH).',
  'Dengan mengedepankan prinsip pelayanan prima dan nilai-nilai keislaman, PLHUT siap melayani masyarakat Magetan dengan sepenuh hati demi kenyamanan dan kelancaran ibadah ke Tanah Suci.',
].join('\n\n');

const FALLBACK_VISION = 'Terwujudnya pelayanan haji dan umrah yang profesional, transparan, akuntabel, berkeadilan, dan memberikan rasa aman serta kepuasan bagi masyarakat Kabupaten Magetan.';

const FALLBACK_MISSION = [
  'Meningkatkan kualitas tata kelola pelayanan pendaftaran dan pembatalan haji.',
  'Menyelenggarakan pembinaan manasik haji yang komprehensif dan mandiri.',
  'Memberikan pengawasan dan advokasi perlindungan bagi jemaah umrah.',
  'Memanfaatkan teknologi informasi untuk keterbukaan informasi publik yang cepat dan akurat.',
];

const FALLBACK_DUTIES = [
  'Pelayanan Administrasi|Melaksanakan pendaftaran, verifikasi dokumen, pembatalan, dan pelimpahan porsi calon jemaah haji.',
  'Pembinaan & Manasik|Merencanakan dan menyelenggarakan bimbingan manasik haji reguler tingkat kabupaten dan kecamatan.',
  'Advokasi & Pengawasan Umrah|Sosialisasi legalitas Penyelenggara Perjalanan Ibadah Umrah (PPIU) serta fasilitasi pengaduan jemaah.',
  'Layanan Terpadu Satu Atap|Koordinasi bersama BPS BPIH, Dinas Kesehatan, dan instansi terkait keberangkatan jemaah haji.',
];

const FALLBACK_UNITS = [
  'Loket Pendaftaran & Biometrik Haji',
  'Loket BPS BPIH Terpadu',
  'Ruang Konsultasi & Advokasi Jemaah',
  'Aula Pertemuan & Bimbingan Manasik',
];

function splitLines(value, fallback = []) {
  const source = value && value.trim() ? value : fallback.join('\n');
  return source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function parseDuties(value) {
  return splitLines(value, FALLBACK_DUTIES).map((line) => {
    const [title, ...description] = line.split('|');
    return {
      title: title.trim(),
      description: description.join('|').trim(),
    };
  });
}

export default function ProfilePage() {
  const { settings } = useSiteSettings();
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);

  useSEO({
    title: 'Profil Instansi',
    description: settings.site_description || 'Sejarah, visi, misi, tugas, dan struktur layanan Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan.',
    url: '/profil',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    staffAPI.getAll()
      .then((res) => setStaff(res.data || []))
      .catch(() => setStaff([]))
      .finally(() => setStaffLoading(false));
  }, []);

  const missionItems = splitLines(settings.profile_mission, FALLBACK_MISSION);
  const dutyItems = parseDuties(settings.profile_duties);
  const unitItems = splitLines(settings.profile_units, FALLBACK_UNITS);
  const officePhotoCaption = settings.profile_office_photo_caption || 'Kantor PLHUT Kabupaten Magetan';

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
            <strong>Catatan Resmi:</strong> Seluruh informasi profil kelembagaan yang ditampilkan mengacu pada ketetapan resmi Kantor Kementerian Agama Kabupaten Magetan. Data pejabat, pegawai, dan kontak dapat diperbarui secara berkala oleh pengelola instansi.
          </InfoAlert>
        </div>

        {/* Foto kantor */}
        {settings.profile_office_photo && (
          <section className="max-w-4xl mx-auto mb-16">
            <figure className="card overflow-hidden">
              <div className="w-full bg-stone-100 flex items-center justify-center">
                <img
                  src={settings.profile_office_photo}
                  alt={officePhotoCaption}
                  className="w-full max-h-[480px] object-contain"
                />
              </div>
              {officePhotoCaption && (
                <figcaption className="px-6 py-3 text-xs text-gray-500 text-center border-t border-gray-100">
                  {officePhotoCaption}
                </figcaption>
              )}
            </figure>
          </section>
        )}

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

            <div
              className="prose-plhut text-sm md:text-base text-gray-700"
              dangerouslySetInnerHTML={{ __html: formatNewsContent(settings.profile_history || FALLBACK_HISTORY) }}
            />
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
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {settings.profile_vision || FALLBACK_VISION}
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-black" style={{ background: 'var(--color-gold)' }}>
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-black)' }}>Misi</h3>
              <ul className="text-sm space-y-2 text-gray-700 list-disc list-inside">
                {missionItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
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
              {dutyItems.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                  <h4 className="font-semibold text-black mb-1">{i + 1}. {item.title}</h4>
                  {item.description && <p>{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Struktur Pimpinan */}
        <section className="max-w-4xl mx-auto mb-16">
          <SectionHeader title="Struktur & Pejabat" subtitle="Pengelola dan penanggung jawab pelayanan PLHUT Magetan" />
          <div className="card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl border text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                {settings.site_welcome_photo ? (
                  <img
                    src={settings.site_welcome_photo}
                    alt={settings.site_welcome_name || 'Pimpinan'}
                    className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-yellow-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 text-black" style={{ background: 'var(--color-gold)' }}>
                    <Users size={40} />
                  </div>
                )}
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
                    {unitItems.map((unit, i) => (
                      <li key={i}>{unit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Pegawai & Karyawan */}
        {!staffLoading && staff.length > 0 && (
          <section className="max-w-4xl mx-auto mb-16">
            <SectionHeader title="Pegawai & Karyawan" subtitle="Tim yang melayani masyarakat di PLHUT Kabupaten Magetan" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {staff.map((person) => (
                <div key={person.id} className="card p-5 text-center">
                  <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center mb-3">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserRound size={38} className="text-gray-300" />
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-black leading-snug">{person.name}</h4>
                  <p className="text-xs text-yellow-700 font-medium mt-1">{person.position}</p>
                  {person.unit && <p className="text-[11px] text-gray-500 mt-1">{person.unit}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {staffLoading && (
          <div className="max-w-4xl mx-auto mb-16">
            <LoadingSpinner text="Memuat data pegawai..." size="sm" />
          </div>
        )}

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
