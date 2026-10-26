import React, { useState, useEffect } from 'react';
import { complaintsAPI, faqsAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSEO } from '../../hooks/useSEO';
import { PageHeader, SectionHeader, InfoAlert, FormGroup, Accordion, LoadingSpinner } from '../../components/ui/index';
import { MessageSquare, Send, Clock, Phone, Mail, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintPage() {
  const { settings } = useSiteSettings();
  useSEO({
    title: 'Pusat Informasi & Pengaduan',
    description: 'Sampaikan pengaduan, pertanyaan, atau laporan pelayanan haji dan umrah kepada PLHUT Kabupaten Magetan.',
    url: '/pengaduan',
  });
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    reporter_name: '',
    contact: '',
    category: 'Pelayanan Haji',
    subject: '',
    message: '',
    data_consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);

    faqsAPI.getAll()
      .then((res) => setFaqs(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingFaqs(false));
  }, [settings.site_short_name]);

  const validate = () => {
    const errs = {};
    if (!formData.reporter_name.trim()) errs.reporter_name = 'Nama lengkap wajib diisi.';
    if (!formData.contact.trim()) errs.contact = 'Nomor kontak / WhatsApp / Email wajib diisi.';
    if (!formData.subject.trim()) errs.subject = 'Subjek laporan / pertanyaan wajib diisi.';
    if (!formData.message.trim()) errs.message = 'Isi pesan wajib diisi.';
    if (!formData.data_consent) errs.data_consent = 'Anda wajib menyetujui penggunaan data untuk proses tindak lanjut.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Harap lengkapi semua kolom yang wajib diisi.');
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        data_consent: 'true', // string for express-validator check
      };
      const res = await complaintsAPI.submit(payload);
      setSubmittedRef(res.data.reference_number);
      toast.success('Pengaduan / pertanyaan Anda berhasil dikirim!');
      setFormData({
        reporter_name: '',
        contact: '',
        category: 'Pelayanan Haji',
        subject: '',
        message: '',
        data_consent: false,
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Gagal mengirim pengaduan.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader
        title="Pusat Informasi & Pengaduan"
        subtitle="Layanan komunikasi resmi, konsultasi pelayanan, dan penyampaian saran/pengaduan masyarakat"
        breadcrumbs={['Beranda', 'Informasi & Pengaduan']}
      />

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Kolom Kiri: Formulir Pengaduan (7 kolom) */}
          <div className="lg:col-span-7">
            <div className="card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black" style={{ background: 'var(--color-gold)' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-black">Formulir Pertanyaan & Pengaduan</h2>
                  <p className="text-xs text-gray-500">Sampaikan keluhan, pertanyaan, atau masukan Anda</p>
                </div>
              </div>

              {submittedRef ? (
                <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center">
                  <CheckCircle2 size={48} className="text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-green-900 mb-1">Pengaduan Berhasil Terkirim</h3>
                  <p className="text-xs text-green-800 mb-4">
                    Terima kasih atas laporan Anda. Petugas PLHUT akan segera menindaklanjuti.
                  </p>
                  <div className="inline-block px-4 py-2 bg-white rounded-xl border border-green-300 mb-6">
                    <span className="text-[11px] text-gray-500 block">Nomor Referensi Anda:</span>
                    <strong className="text-base text-black tracking-wide font-mono">{submittedRef}</strong>
                  </div>
                  <div>
                    <button
                      onClick={() => setSubmittedRef(null)}
                      className="btn-primary text-xs py-2 px-5"
                    >
                      Kirim Laporan Baru
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <FormGroup label="Nama Lengkap" required error={errors.reporter_name}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Masukkan nama lengkap Anda"
                      value={formData.reporter_name}
                      onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup label="Kontak (No. WhatsApp / Telepon / Email)" required error={errors.contact} hint="Digunakan petugas untuk memberikan respon atau klarifikasi">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Contoh: 081234567890 / email@domain.com"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup label="Kategori Laporan" required>
                    <select
                      className="input-field"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Pelayanan Haji">Pelayanan Haji</option>
                      <option value="Pelayanan Umrah">Pelayanan Umrah & Pengawasan PPIU</option>
                      <option value="Bimbingan Manasik">Bimbingan Manasik</option>
                      <option value="Fasilitas & Loket PLHUT">Fasilitas & Loket PLHUT</option>
                      <option value="Lainnya">Lainnya / Pertanyaan Umum</option>
                    </select>
                  </FormGroup>

                  <FormGroup label="Subjek / Pokok Permasalahan" required error={errors.subject}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Contoh: Pertanyaan prosedur pelimpahan porsi haji"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </FormGroup>

                  <FormGroup label="Isi Pesan / Rincian Pengaduan" required error={errors.message}>
                    <textarea
                      rows={5}
                      className="input-field resize-y"
                      placeholder="Tuliskan secara jelas informasi, pertanyaan, atau kronologi yang ingin Anda sampaikan..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </FormGroup>

                  <div className="mb-6 p-4 rounded-xl bg-stone-50 border border-stone-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.data_consent}
                        onChange={(e) => setFormData({ ...formData, data_consent: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-xs text-gray-700 leading-relaxed">
                        Saya menyatakan data yang saya kirimkan adalah benar dan bersedia dihubungi oleh petugas resmi PLHUT Kabupaten Magetan untuk keperluan verifikasi dan tindak lanjut laporan.
                      </span>
                    </label>
                    {errors.data_consent && (
                      <p className="text-xs text-red-600 mt-2 font-medium">{errors.data_consent}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Mengirim...' : <><Send size={16} /> Kirim Pengaduan Sekarang</>}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Pusat Informasi, Jam Kerja & FAQ (5 kolom) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Info Jam & Kontak */}
            <div className="card p-6 md:p-8">
              <h3 className="font-bold text-base text-black mb-4 flex items-center gap-2">
                <Clock size={18} className="text-yellow-600" /> Jam Pelayanan Tatap Muka
              </h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Anda juga dapat berkonsultasi langsung di meja informasi gedung PLHUT:
              </p>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold block text-black">Waktu Operasional:</span>
                  <span>{settings.site_hours}</span>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold block text-black">Nomor WhatsApp Resmi:</span>
                  <span>{settings.site_phone}</span>
                </div>
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <span className="font-semibold block text-black">Email Pengaduan:</span>
                  <span>{settings.site_email}</span>
                </div>
              </div>
            </div>

            {/* Keamanan Data */}
            <div className="card p-6 border-l-4 border-yellow-600">
              <div className="flex items-start gap-3">
                <ShieldCheck size={22} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed">
                  <strong className="block text-black mb-1">Perlindungan Data Pribadi:</strong>
                  Identitas pelapor dan nomor kontak hanya dapat diakses oleh petugas administrator resmi Kementerian Agama dan tidak dipublikasikan ke publik.
                </div>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="card p-6">
              <h3 className="font-bold text-base text-black mb-4 flex items-center gap-2">
                <HelpCircle size={18} className="text-yellow-600" /> FAQ Singkat
              </h3>
              {loadingFaqs ? (
                <LoadingSpinner text="Memuat FAQ..." />
              ) : faqs.length > 0 ? (
                <Accordion items={faqs.slice(0, 4).map((f) => ({ question: f.question, answer: f.answer }))} />
              ) : (
                <p className="text-xs text-gray-500">FAQ belum tersedia.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
