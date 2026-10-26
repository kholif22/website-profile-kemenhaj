import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { newsAPI, agendasAPI, announcementsAPI, faqsAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSEO } from '../../hooks/useSEO';
import { formatDate, truncate, agendaStatusLabel, agendaStatusClass, stripHtml } from '../../utils/helpers';
import { SectionHeader, LoadingSpinner, EmptyState, Accordion, Badge } from '../../components/ui/index';
import { ArrowRight, BookOpen, Calendar, Info, MessageSquare, Star, ChevronRight, Phone, Mail, MapPin, Newspaper, HelpCircle, Megaphone } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

function HeroSection({ settings }) {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden" style={{ background: 'var(--color-black)' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, #D4AF37 0%, transparent 40%), radial-gradient(circle at 80% 80%, #F5C542 0%, transparent 40%)',
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.04'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 container mx-auto px-4 py-16 text-center text-white">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <Star size={12} fill="currentColor" /> Website Resmi Instansi
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-black max-w-5xl mx-auto text-gold">
            {settings.site_hero_title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="text-sm md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {settings.site_hero_subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
            <Link to="/layanan-haji" className="btn-primary px-8 py-3.5 text-sm">
              Jelajahi Layanan <ArrowRight size={16} />
            </Link>
            <Link to="/kontak" className="btn-outline-dark px-8 py-3.5 text-sm">
              Hubungi Kami
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div variants={fadeUp} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Layanan Haji', value: 'Informasi Lengkap' },
              { label: 'Layanan Umrah', value: 'Panduan Resmi' },
              { label: 'Jadwal Manasik', value: 'Info Terkini' },
              { label: 'Pengaduan', value: 'Respon Cepat' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--color-gold)' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-16" fill="var(--color-bg)">
          <path d="M0,64L80,58.7C160,53,320,43,480,42.7C640,43,800,53,960,56C1120,59,1280,53,1360,50.7L1440,48V80H0Z" />
        </svg>
      </div>
    </section>
  );
}

function ServiceCards() {
  const services = [
    { icon: BookOpen, title: 'Layanan Haji', desc: 'Informasi pendaftaran, persyaratan, dan prosedur pelayanan ibadah haji.', path: '/layanan-haji', color: '#D4AF37' },
    { icon: Star, title: 'Layanan Umrah', desc: 'Panduan persiapan umrah dan informasi PPIU berizin resmi.', path: '/layanan-umrah', color: '#F5C542' },
    { icon: Calendar, title: 'Informasi Manasik', desc: 'Jadwal kegiatan manasik haji dan umrah untuk calon jemaah.', path: '/manasik', color: '#B88A24' },
    { icon: MessageSquare, title: 'Informasi & Pengaduan', desc: 'Sampaikan pertanyaan dan pengaduan Anda kepada kami.', path: '/pengaduan', color: '#D4AF37' },
  ];

  return (
    <section className="py-16" style={{ background: 'var(--color-bg)' }}>
      <div className="container mx-auto px-4">
        <SectionHeader title="Layanan Kami" subtitle="Akses informasi pelayanan haji dan umrah dengan mudah" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, desc, path, color }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <Link to={path} className="card p-6 block hover:-translate-y-1 transition-all duration-300 h-full group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110" style={{ background: `${color}18`, color }}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-black)' }}>{title}</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
                  Selengkapnya <ChevronRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WelcomeSection({ settings }) {
  return (
    <section className="py-16" style={{ background: 'var(--color-white)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Photo placeholder */}
            <div className="flex justify-center">
              <div className="w-48 h-56 rounded-2xl flex flex-col items-center justify-center text-center p-4" style={{ background: 'var(--color-bg)', border: '2px dashed var(--color-border)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--color-gold)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                </div>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{settings.site_welcome_name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{settings.site_welcome_title}</div>
                <div className="mt-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--color-gold-dark)', fontSize: '10px' }}>Foto belum tersedia</div>
              </div>
            </div>

            {/* Text */}
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold" style={{ color: 'var(--color-gold-dark)' }}>
                <div className="w-8 h-0.5" style={{ background: 'var(--color-gold)' }} />
                Sambutan Pimpinan
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: 'var(--color-black)' }}>
                Selamat Datang di PLHUT Kabupaten Magetan
              </h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                "{settings.site_welcome_text}"
              </p>
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--color-black)' }}>{settings.site_welcome_name}</div>
                <div className="text-xs" style={{ color: 'var(--color-gold-dark)' }}>{settings.site_welcome_title}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnnouncementsSection({ announcements, loading }) {
  if (loading || announcements.length === 0) return null;

  return (
    <section
      className="py-10"
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(245,197,66,0.06))',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-1 text-xs font-semibold" style={{ color: 'var(--color-gold-dark)' }}>
              <Megaphone size={15} /> Pengumuman Resmi
            </div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-black)' }}>Informasi Penting</h2>
          </div>
          <Link
            to="/berita?tab=pengumuman"
            className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold"
            style={{ color: 'var(--color-gold-dark)' }}
          >
            Lihat Semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <Link
              key={ann.id}
              to="/berita?tab=pengumuman"
              className="card p-5 border-l-4 hover:-translate-y-0.5 transition-transform"
              style={{ borderLeftColor: 'var(--color-gold)' }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="badge badge-warning text-[11px]">Penting</span>
                <span className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(ann.created_at)}
                </span>
              </div>
              <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-black)' }}>{ann.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {truncate(stripHtml(ann.content), 140)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestNews({ news, loading }) {
  return (
    <section className="py-16" style={{ background: 'var(--color-bg)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <SectionHeader title="Berita & Pengumuman" subtitle="Informasi dan kegiatan terbaru instansi" center={false} />
          <Link to="/berita" className="hidden sm:flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-gold-dark)' }}>
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? <LoadingSpinner /> : (
          news.length === 0 ? (
            <EmptyState icon={Newspaper} title="Belum ada berita" description="Berita akan ditampilkan setelah dipublikasikan oleh administrator." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {news.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/berita/${item.slug}`} className="card block overflow-hidden hover:-translate-y-1 transition-all duration-300 h-full group">
                    <div className="h-44 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(245,197,66,0.1) 100%)' }}>
                          <BookOpen size={40} style={{ color: 'var(--color-gold)', opacity: 0.4 }} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-gold text-xs">{item.category}</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{formatDate(item.published_at)}</span>
                      </div>
                      <h3 className="font-bold text-sm leading-snug mb-2 group-hover:text-gold-dark transition-colors" style={{ color: 'var(--color-black)' }}>{item.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{truncate(item.excerpt || stripHtml(item.content), 100)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )
        )}
        <div className="text-center mt-6 sm:hidden">
          <Link to="/berita" className="btn-secondary">Lihat Semua Berita</Link>
        </div>
      </div>
    </section>
  );
}

function UpcomingAgendas({ agendas, loading }) {
  return (
    <section className="py-16" style={{ background: 'var(--color-white)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <SectionHeader title="Agenda Mendatang" subtitle="Jadwal kegiatan manasik dan pelayanan haji" center={false} />
          <Link to="/manasik" className="hidden sm:flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-gold-dark)' }}>
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? <LoadingSpinner /> : (
          agendas.length === 0 ? (
            <EmptyState icon={Calendar} title="Belum ada agenda" description="Agenda kegiatan akan ditampilkan setelah ditambahkan oleh administrator." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agendas.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="card p-5 flex gap-4">
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="text-2xl font-black" style={{ color: 'var(--color-gold)' }}>
                        {new Date(item.event_date).getDate().toString().padStart(2, '0')}
                      </div>
                      <div className="text-xs uppercase font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(item.event_date).toLocaleDateString('id-ID', { month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${agendaStatusClass[item.status]} text-xs`}>{agendaStatusLabel[item.status]}</span>
                      </div>
                      <h3 className="font-bold text-sm mb-1 truncate" style={{ color: 'var(--color-black)' }}>{item.title}</h3>
                      {item.start_time && <div className="text-xs mb-1" style={{ color: 'var(--color-gold-dark)' }}>🕐 {item.start_time}{item.end_time ? ` - ${item.end_time}` : ''} WIB</div>}
                      {item.location && <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>📍 {item.location}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}

function FAQSection({ faqs, loading }) {
  return (
    <section className="py-16" style={{ background: 'var(--color-bg)' }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <SectionHeader title="Pertanyaan Umum" subtitle="Jawaban atas pertanyaan yang sering ditanyakan masyarakat" />
        {loading ? <LoadingSpinner /> : (
          faqs.length === 0 ? (
            <EmptyState icon={HelpCircle} title="Belum ada FAQ" />
          ) : (
            <Accordion items={faqs.map(f => ({ question: f.question, answer: f.answer }))} />
          )
        )}
        <div className="text-center mt-8">
          <Link to="/pengaduan" className="btn-primary">
            Ada Pertanyaan Lain? Hubungi Kami <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16" style={{ background: 'var(--color-black)' }}>
      <div className="container mx-auto px-4 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Ada Pertanyaan tentang Haji & Umrah?</h2>
        <p className="mb-8 text-sm max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Tim kami siap membantu Anda mendapatkan informasi yang tepat dan akurat seputar pelayanan haji dan umrah.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/pengaduan" className="btn-primary">
            <MessageSquare size={16} /> Kirim Pengaduan / Pertanyaan
          </Link>
          <Link to="/kontak" className="btn-outline-dark">
            <Phone size={16} /> Lihat Kontak
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { settings } = useSiteSettings();
  useSEO({
    title: `${settings.site_short_name || 'PLHUT Magetan'} - Pusat Layanan Haji dan Umrah`,
    description: settings.site_description,
    url: '/',
  });
  const [news, setNews] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState({ news: true, agendas: true, faqs: true, announcements: true });

  useEffect(() => {
    newsAPI.getAll({ status: 'published', limit: 3 })
      .then(r => setNews(r.data.data || []))
      .catch(() => setNews([]))
      .finally(() => setLoading(p => ({ ...p, news: false })));

    agendasAPI.getAll({ status: 'upcoming' })
      .then(r => setAgendas((r.data || []).slice(0, 4)))
      .catch(() => setAgendas([]))
      .finally(() => setLoading(p => ({ ...p, agendas: false })));

    faqsAPI.getAll()
      .then(r => setFaqs((r.data || []).slice(0, 6)))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(p => ({ ...p, faqs: false })));

    announcementsAPI.getAll({ home: 'true' })
      .then(r => setAnnouncements((r.data || []).slice(0, 2)))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(p => ({ ...p, announcements: false })));
  }, [settings.site_short_name]);

  return (
    <div>
      <HeroSection settings={settings} />
      <ServiceCards />
      <WelcomeSection settings={settings} />
      <AnnouncementsSection announcements={announcements} loading={loading.announcements} />
      <LatestNews news={news} loading={loading.news} />
      <UpcomingAgendas agendas={agendas} loading={loading.agendas} />
      <FAQSection faqs={faqs} loading={loading.faqs} />
      <CTASection />
    </div>
  );
}
