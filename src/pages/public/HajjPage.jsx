import React, { useState, useEffect } from 'react';
import { servicesAPI, faqsAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { PageHeader, SectionHeader, InfoAlert, Accordion, LoadingSpinner } from '../../components/ui/index';
import { BookOpen, FileCheck, CheckCircle2, ExternalLink, HelpCircle, ShieldAlert } from 'lucide-react';

export default function HajjPage() {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Layanan Haji - ${settings.site_short_name || 'PLHUT Magetan'}`;
    window.scrollTo(0, 0);

    Promise.all([
      servicesAPI.getAll({ category: 'haji' }),
      faqsAPI.getAll({ category: 'haji' })
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
        title="Layanan Haji"
        subtitle="Informasi resmi pendaftaran, persyaratan, prosedur, dan pembinaan jemaah haji Kabupaten Magetan"
        breadcrumbs={['Beranda', 'Layanan', 'Layanan Haji']}
      />

      <div className="container mx-auto px-4 mt-12 max-w-5xl">
        {/* Official Disclaimer Alert */}
        <InfoAlert type="warning">
          <strong>Perhatian:</strong> Pendaftaran haji resmi hanya dilakukan melalui loket PLHUT Kementerian Agama Kabupaten Magetan dan Bank Penerima Setoran (BPS) BPIH terdaftar. Website ini bersifat portal informasi dan tidak melakukan pemungutan biaya secara daring.
        </InfoAlert>

        {/* Section: Pengenalan Layanan */}
        <section className="mb-14">
          <div className="card p-8 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-black">
              Pusat Pelayanan Haji Satu Atap
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-700 mb-6">
              Pusat Layanan Haji dan Umrah Terpadu (PLHUT) Kabupaten Magetan menyediakan fasilitas pelayanan pendaftaran dan pembatalan haji reguler, verifikasi dokumen, perekaman biometrik, dan koordinasi dengan Bank Penerima Setoran (BPS) BPIH. Calon jemaah dapat menyelesaikan seluruh proses administrasi awal hanya dalam satu kunjungan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-yellow-600 flex-shrink-0" size={20} />
                <span className="text-xs md:text-sm font-medium text-gray-800">Pendaftaran Cepat & Terpadu</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-yellow-600 flex-shrink-0" size={20} />
                <span className="text-xs md:text-sm font-medium text-gray-800">Foto & Biometrik di Tempat</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-yellow-600 flex-shrink-0" size={20} />
                <span className="text-xs md:text-sm font-medium text-gray-800">Langsung Terbit SPPH</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Cek Nomor Porsi & Estimasi */}
        <section className="mb-14">
          <div className="card-gold p-8 rounded-2xl text-black">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Pengecekan Nomor Porsi & Estimasi Keberangkatan</h3>
                <p className="text-xs md:text-sm opacity-90 max-w-xl">
                  Perkiraan tahun keberangkatan dapat berubah sesuai kuota resmi pemerintah yang ditetapkan Kementerian Agama RI setiap tahunnya. Anda dapat mengecek status porsi melalui aplikasi resmi <strong>Haji Pintar / Pusaka SuperApps</strong> atau portal resmi Kemenag.
                </p>
              </div>
              <a
                href="https://haji.kemenag.go.id/v4/basisdata/estimasi-keberangkatan"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary bg-black text-white hover:bg-gray-800 flex-shrink-0 flex items-center gap-2"
              >
                Cek Estimasi Resmi <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* Section: Layanan Terdaftar */}
        <section className="mb-14">
          <SectionHeader title="Daftar Layanan & Prosedur" subtitle="Panduan teknis persyaratan dan alur pengurusan" />

          {loading ? (
            <LoadingSpinner text="Memuat daftar layanan..." />
          ) : services.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              Belum ada informasi layanan haji tambahan yang dimasukkan.
            </div>
          ) : (
            <div className="space-y-6">
              {services.map((svc) => (
                <div key={svc.id} className="card p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-black">{svc.title}</h3>
                    <span className="badge badge-gold uppercase text-[10px] tracking-wider">Haji</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-6">{svc.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-5 rounded-xl border border-stone-200">
                    <div>
                      <h4 className="font-semibold text-xs text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileCheck size={16} className="text-yellow-600" /> Persyaratan Dokumen
                      </h4>
                      <pre className="text-xs text-gray-700 font-sans whitespace-pre-wrap leading-relaxed">
                        {svc.requirements || 'Persyaratan dapat dikonfirmasi ke loket PLHUT.'}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold text-xs text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen size={16} className="text-yellow-600" /> Tahapan / Prosedur
                      </h4>
                      <pre className="text-xs text-gray-700 font-sans whitespace-pre-wrap leading-relaxed">
                        {svc.procedure || 'Ikuti alur loket terpadu di kantor PLHUT.'}
                      </pre>
                    </div>
                  </div>

                  {svc.official_url && (
                    <div className="mt-4 text-right">
                      <a
                        href={svc.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-700 hover:underline"
                      >
                        Sumber / Regulasi Resmi <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: FAQ Haji */}
        <section className="mb-14">
          <SectionHeader title="Pertanyaan Seputar Haji" subtitle="Tanya jawab umum terkait administrasi dan pelaksanaan haji" />
          {faqs.length > 0 ? (
            <Accordion items={faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
          ) : (
            <p className="text-center text-sm text-gray-500">FAQ haji akan diperbarui berkala.</p>
          )}
        </section>
      </div>
    </div>
  );
}
