import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { newsAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { PageHeader, LoadingSpinner, Badge, EmptyState } from '../../components/ui/index';
import { formatDate, categoryClass } from '../../utils/helpers';
import { Calendar, User, ArrowLeft, Share2, Tag, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    newsAPI.getBySlug(slug)
      .then((res) => {
        setArticle(res.data);
        document.title = `${res.data.title} - ${settings.site_short_name || 'PLHUT Magetan'}`;
      })
      .catch((err) => {
        console.error(err);
        setArticle(null);
      })
      .finally(() => setLoading(false));
  }, [slug, settings.site_short_name]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Tautan artikel berhasil disalin!');
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner text="Memuat artikel berita..." />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
        <EmptyState
          icon={BookOpen}
          title="Berita Tidak Ditemukan"
          description="Artikel yang Anda cari mungkin telah dihapus atau tautan tidak valid."
          action={
            <Link to="/berita" className="btn-primary mt-4">
              ← Kembali ke Berita
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title={article.title}
        subtitle={`Diterbitkan pada ${formatDate(article.published_at || article.created_at)}`}
        breadcrumbs={['Beranda', 'Berita', article.category]}
      />

      <div className="container mx-auto px-4 mt-10 max-w-4xl">
        <div className="mb-6">
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Semua Berita
          </Link>
        </div>

        <article className="card p-6 md:p-10">
          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100 text-xs text-gray-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`badge ${categoryClass[article.category] || 'badge-gold'}`}>
                {article.category}
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{article.author_name || 'Petugas PLHUT'}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={13} /> Bagikan
            </button>
          </div>

          {/* Featured Image */}
          {article.image && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-xs">
              <img
                src={article.image}
                alt={article.title}
                className="w-full max-h-[460px] object-cover"
              />
            </div>
          )}

          {/* Excerpt if available */}
          {article.excerpt && (
            <div className="p-4 mb-8 rounded-xl bg-stone-50 border-l-4 border-yellow-600 text-sm font-medium text-gray-800 italic leading-relaxed">
              {article.excerpt}
            </div>
          )}

          {/* Article Body */}
          <div
            className="prose-plhut text-sm md:text-base leading-relaxed text-gray-800"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Footer of article */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Tag size={14} /> Kategori: <strong>{article.category}</strong>
            </div>
            <span>PLHUT Kabupaten Magetan</span>
          </div>
        </article>
      </div>
    </div>
  );
}
