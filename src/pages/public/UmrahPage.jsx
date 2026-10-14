import React, { useState, useEffect } from 'react';
import { servicesAPI, faqsAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { PageHeader, SectionHeader, InfoAlert, Accordion, LoadingSpinner } from '../../components/ui/index';
import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, FileText, PhoneCall, HelpCircle } from 'lucide-react';

export default function UmrahPage() {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Layanan Umrah - ${settings.site_short_name || 'PLHUT Magetan'}`;
    window.scrollTo(0, 0);

    Promise.all([
      servicesAPI.getAll({ category: 'umrah' }),
      faqsAPI.getAll({ category: 'umrah' })
    ])
      .then(([srvRes, faqRes]) => {
        setServices(srvRes.data || []);
        setFaqs(faqRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [settings.site_short_name]);

  return (
    <div className="pb-20">
      <PageHeader
        title="Layanan & Edukasi Umrah"
        subtitle="Panduan resmi perjalanan ibadah umrah aman, terpercaya, dan berizin Kementerian Agama RI"
        breadcrumbs={['Beranda', 'Layanan', 'Layanan Umrah']}
      />

      <div className="container mx-auto px-4 mt-12 max-w-5xl">
        {/* Institutional Non-Agency Disclaimer */}
        <InfoAlert type="warning">
          <strong>Perhatian:</strong> PLHUT Kabupaten Magetan adalah instansi pemerintah di bawah Kementerian Agama dan <strong>bukan merupakan biro perjalanan (travel agent) umrah</strong>. Kami berfungsi mengawasi, membina, dan memverifikasi legalitas PPIU demi perlindungan jemaah.
        </InfoAlert>

        {/* Section: Gerakan 5 Pasti Umrah */}
        <section className="mb-14">
          <div className="card p-8 md:p-10 border-2" style={{ borderColor: 'var(--color-gold)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black" style={{ background: 'var(--color-gold)' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-black">
                  Gerakan 5 Pasti Umrah
                </h2>
                <p className="text-xs text-gray-500">Kunci Utama Menghindari Penipuan Biro Umrah Tak Berizin</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              Sebelum mendaftarkan diri Anda dan keluarga untuk ibadah umrah, pastikan Anda memeriksa lima kepastian wajib yang ditetapkan Kementerian Agama Republik Indonesia:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: '1. Pasti Travelnya', desc: 'Pilih PPIU yang mengantongi izin operasional resmi dan masih aktif dari Kemenag RI.' },
                { title: '2. Pasti Jadwalnya', desc: 'Pastikan tanggal keberangkatan dan kepulangan telah pasti serta memiliki tiket pesawat PP.' },
                { title: '3. Pasti Terbangnya', desc: 'Maskapai penerbangan jelas, bukan sekadar janji waiting list atau carter tanpa kepastian.' },
                { title: '4. Pasti Hotelnya', desc: 'Nama hotel di Makkah dan Madinah terkonfirmasi dan memiliki bukti pemesanan resmi.' },
                { title: '5. Pasti Visanya', desc: 'Visa umrah diterbitkan oleh Pemerintah Arab Saudi secara resmi sebelum hari keberangkatan.' }
              ].map((pasti, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="flex items-center gap-2 font-bold text-sm text-black mb-1">
                    <CheckCircle2 size={16} className="text-yellow-600" />
                    {pasti.title}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{pasti.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-gray-600">
                Periksa daftar resmi Penyelenggara Perjalanan Ibadah Umrah (PPIU) berizin:
              </span>
              <a
                href="https://simpu.kemenag.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
              >
                Cek Legalitas di Portal SIMPU <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Section: Persyaratan & Panduan Dokumen */}
        <section className="mb-14">
          <SectionHeader title="Persyaratan Dokumen Umrah" subtitle="Kelengkapan dokumen standar sebelum keberangkatan" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 md:p-8">
              <h3 className="font-bold text-base text-black mb-4 flex items-center gap-2">
                <FileText size={18} className="text-yellow-600" /> Dokumen Utama Calon Jemaah
              </h3>
              <ul className="text-xs md:text-sm text-gray-700 space-y-2.5 list-disc list-inside">
                <li>Paspor Republik Indonesia yang masih berlaku minimal 6 (enam) bulan sebelum tanggal kepulangan.</li>
                <li>Nama di paspor minimal 2 (dua) kata sesuai regulasi penerbangan dan keimigrasian Arab Saudi.</li>
                <li>Kartu Tanda Penduduk (KTP) dan Kartu Keluarga (KK) asli serta fotokopi.</li>
                <li>Buku Nikah (bagi pasangan suami-istri) atau Akta Kelahiran (bagi anak-anak).</li>
                <li>Pasfoto terbaru berwarna berlatar belakang putih ukuran 4x6 (tampak wajah 80%).</li>
              </ul>
            </div>

            <div className="card p-6 md:p-8">
              <h3 className="font-bold text-base text-black mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-yellow-600" /> Persyaratan Kesehatan & Legalitas
              </h3>
              <ul className="text-xs md:text-sm text-gray-700 space-y-2.5 list-disc list-inside">
                <li>Sertifikat vaksinasi meningitis meningokokus yang sah dari fasilitas pelayanan kesehatan berwenang.</li>
                <li>Memiliki perlindungan asuransi perjalanan umrah yang masih berlaku.</li>
                <li>Terdaftar pada aplikasi Sistem Informasi Pengawasan Terpadu Umrah dan Haji Khusus (SISKOPATUH).</li>
                <li>Kondisi kesehatan fisik yang memadai untuk menjalankan ibadah rukun di Tanah Suci.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Layanan Terdaftar */}
        {services.length > 0 && (
          <section className="mb-14">
            <SectionHeader title="Layanan Terkait Umrah" subtitle="Konsultasi dan rekomendasi penerbitan dokumen" />
            <div className="space-y-6">
              {services.map((svc) => (
                <div key={svc.id} className="card p-6 md:p-8">
                  <h3 className="text-lg font-bold text-black mb-2">{svc.title}</h3>
                  <p className="text-sm text-gray-700 mb-4">{svc.description}</p>
                  {svc.procedure && (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-gray-700">
                      <strong>Panduan:</strong> {svc.procedure}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: FAQ Umrah */}
        <section className="mb-14">
          <SectionHeader title="Pertanyaan Seputar Umrah" subtitle="Informasi dan tips seputar ibadah umrah yang aman" />
          {loading ? (
            <LoadingSpinner text="Memuat FAQ..." />
          ) : faqs.length > 0 ? (
            <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
          ) : (
            <p className="text-center text-sm text-gray-500">FAQ umrah akan diperbarui secara berkala.</p>
          )}
        </section>
      </div>
    </div>
  );
}
