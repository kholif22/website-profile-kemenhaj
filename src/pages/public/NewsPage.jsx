import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI, announcementsAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { PageHeader, SectionHeader, LoadingSpinner, EmptyState, Pagination, Badge } from '../../components/ui/index';
import { formatDate, truncate, stripHtml, categoryClass } from '../../utils/helpers';
import { Search, Filter, Newspaper, Megaphone, Calendar, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  'Semua Kategori',
  'Berita Instansi',
  'Pelayanan Haji',
  'Pelayanan Umrah',
  'Manasik',
  'Pengumuman',
  'Edukasi Masyarakat'
];

export default function NewsPage() {
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('news'); // 'news' or 'announcements'
  const [newsList, setNewsList] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua Kategori');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    document.title = `Berita & Pengumuman - ${settings.site_short_name || 'PLHUT Magetan'}`;
    window.scrollTo(0, 0);
  }, [settings.site_short_name]);

  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews(page, category, search);
    } else {
      fetchAnnouncements();
    }
  }, [activeTab, page, category]);

  const fetchNews = (p = 1, cat = category, q = search) => {
    setLoading(true);
    const params = {
      page: p,
      limit: 9,
      status: 'published'
    };
    if (cat !== 'Semua Kategori') params.category = cat;
    if (q.trim()) params.search = q.trim();

    newsAPI.getAll(params)
      .then((res) => {
        setNewsList(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchAnnouncements = () => {
    setLoading(true);
    announcementsAPI.getAll({ all: 'false' })
      .then((res) => setAnnouncements(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNews(1, category, search);
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Berita & Pengumuman"
        subtitle="Pusat informasi kegiatan resmi, siaran pers, dan pengumuman PLHUT Kabupaten Magetan"
        breadcrumbs={['Beranda', 'Berita & Pengumuman']}
      />

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => { setActiveTab('news'); setPage(1); }}
            className={`flex items-center gap-2 pb-3 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'news'
                ? 'border-yellow-600 text-yellow-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Newspaper size={18} /> Berita & Artikel
          </button>
          <button
            onClick={() => { setActiveTab('announcements'); }}
            className={`flex items-center gap-2 pb-3 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'announcements'
                ? 'border-yellow-600 text-yellow-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Megaphone size={18} /> Pengumuman Resmi
          </button>
        </div>

        {activeTab === 'news' ? (
          <div>
            {/* Search & Category Filter Bar */}
            <div className="card p-4 md:p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                  <input
                    type="text"
                    placeholder="Cari judul berita..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-10 pr-4 py-2 text-xs"
                  />
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                </form>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-gray-500 flex-shrink-0">Kategori:</span>
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="input-field py-2 text-xs w-full md:w-56"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* News Cards Grid */}
            {loading ? (
              <LoadingSpinner text="Memuat berita..." />
            ) : newsList.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title="Tidak ada berita yang ditemukan"
                description={search ? `Tidak ada hasil untuk kata kunci "${search}".` : 'Belum ada artikel berita yang dipublikasikan.'}
              />
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsList.map((item) => (
                    <Link
                      key={item.id}
                      to={`/berita/${item.slug}`}
                      className="card block overflow-hidden hover:-translate-y-1 transition-transform group flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-44 w-full bg-stone-100 overflow-hidden relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-100 text-yellow-600">
                              <Newspaper size={40} className="opacity-40" />
                            </div>
                          )}
                          <span className={`absolute top-3 left-3 badge ${categoryClass[item.category] || 'badge-gold'}`}>
                            {item.category}
                          </span>
                        </div>

                        <div className="p-5">
                          <div className="text-[11px] text-gray-400 mb-2 flex items-center gap-1.5">
                            <Calendar size={13} /> {formatDate(item.published_at || item.created_at)}
                          </div>
                          <h3 className="font-bold text-sm text-black group-hover:text-yellow-700 transition-colors line-clamp-2 mb-2 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                            {truncate(item.excerpt || stripHtml(item.content), 120)}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between text-xs font-semibold text-yellow-700">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight size={14} />
                      </div>
                    </Link>
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        ) : (
          /* Announcements Tab */
          <div>
            {loading ? (
              <LoadingSpinner text="Memuat pengumuman..." />
            ) : announcements.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="Tidak ada pengumuman aktif"
                description="Semua informasi resmi yang aktif akan ditampilkan di bagian ini."
              />
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="card p-6 border-l-4" style={{ borderLeftColor: 'var(--color-gold)' }}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-warning text-xs">Penting</span>
                        <h3 className="font-bold text-base text-black">{ann.title}</h3>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(ann.created_at)}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-1">
                      {ann.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
