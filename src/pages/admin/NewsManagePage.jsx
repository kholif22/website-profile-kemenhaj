import React, { useState, useEffect } from 'react';
import { newsAPI } from '../../services/api';
import { LoadingSpinner, EmptyState, Modal, ConfirmModal, Pagination, Badge } from '../../components/ui/index';
import { formatDate, truncate, stripHtml, categoryClass } from '../../utils/helpers';
import { Plus, Search, Edit3, Trash2, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Berita Instansi',
  'Pelayanan Haji',
  'Pelayanan Umrah',
  'Manasik',
  'Pengumuman',
  'Edukasi Masyarakat'
];

export default function NewsManagePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('all');

  // Modal Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Berita Instansi',
    excerpt: '',
    content: '',
    status: 'published',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Pratinjau gambar yang dipilih (ditampilkan utuh, tidak terpotong).
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Delete Confirm State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Manajemen Berita - PLHUT Admin';
    fetchNews();
  }, [page, category, status]);

  const fetchNews = () => {
    setLoading(true);
    const params = {
      page,
      limit: 10,
      status: status || 'all',
    };
    if (category) params.category = category;
    if (search.trim()) params.search = search.trim();

    newsAPI.getAll(params)
      .then((res) => {
        setNews(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil data berita.');
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Berita Instansi',
      excerpt: '',
      content: '',
      status: 'published',
    });
    setImageFile(null);
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      excerpt: item.excerpt || '',
      content: item.content,
      status: item.status,
    });
    setImageFile(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Judul dan konten berita wajib diisi.');
      return;
    }

    setSaving(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('excerpt', formData.excerpt);
    data.append('content', formData.content);
    data.append('status', formData.status);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingItem) {
        await newsAPI.update(editingItem.id, data);
        toast.success('Berita berhasil diperbarui.');
      } else {
        await newsAPI.create(data);
        toast.success('Berita baru berhasil ditambahkan.');
      }
      setFormOpen(false);
      fetchNews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan berita.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await newsAPI.delete(deleteId);
      toast.success('Berita berhasil dihapus.');
      setDeleteId(null);
      fetchNews();
    } catch (err) {
      toast.error('Gagal menghapus berita.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Manajemen Berita & Artikel</h1>
          <p className="text-xs text-gray-500">Kelola publikasi informasi resmi instansi</p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus size={16} /> Tambah Berita Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari judul berita..."
              className="input-field pl-9 pr-4 py-2 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              className="input-field py-2 text-xs w-full sm:w-44"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="input-field py-2 text-xs w-full sm:w-36"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="all">Semua Status</option>
              <option value="published">Diterbitkan</option>
              <option value="draft">Draft</option>
            </select>

            <button type="submit" className="btn-primary py-2 px-3 text-xs">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Table Data */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar berita..." />
        ) : news.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Belum ada berita"
            description="Tambahkan berita pertama Anda untuk ditampilkan ke masyarakat."
            action={
              <button onClick={openCreateForm} className="btn-primary text-xs py-2 px-4 mt-2">
                + Tulis Berita
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Gambar</th>
                  <th>Judul Berita</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.image ? (
                        <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-12 h-10 object-contain bg-stone-100 rounded-lg" />
                      ) : (
                        <div className="w-12 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-gray-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong className="block text-black font-semibold text-xs leading-snug line-clamp-1">{item.title}</strong>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{truncate(stripHtml(item.content), 80)}</span>
                    </td>
                    <td>
                      <span className={`badge ${categoryClass[item.category] || 'badge-gold'} text-[11px]`}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'published' ? 'badge-success' : 'badge-warning'} text-[11px]`}>
                        {item.status === 'published' ? 'Diterbitkan' : 'Draft'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(item.published_at || item.created_at)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                          title="Edit" aria-label="Edit berita"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Hapus" aria-label="Hapus berita"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* Modal Form Tambah / Edit */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingItem ? 'Edit Berita' : 'Tambah Berita Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Judul Berita *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Masukkan judul berita resmi"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Kategori *</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Status Publikasi *</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="published">Diterbitkan (Published)</option>
                <option value="draft">Draft (Disimpan Sementara)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Gambar Utama (Thumbnail)</label>
            <input
              type="file"
              accept="image/*"
              className="input-field text-xs"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
            />
            {(imagePreview || editingItem?.image) && (
              <div className="mt-2 rounded-xl border border-gray-200 bg-stone-100 overflow-hidden flex items-center justify-center">
                <img
                  src={imagePreview || editingItem.image}
                  alt="Pratinjau thumbnail"
                  className="w-full max-h-48 object-contain"
                />
              </div>
            )}
            {editingItem?.image && !imageFile && (
              <p className="text-[11px] text-gray-400 mt-1">
                Gambar tersimpan: <span className="font-mono">{editingItem.image}</span>
              </p>
            )}
          </div>

          <div>
            <label className="input-label">Ringkasan / Excerpt Singkat</label>
            <textarea
              rows={2}
              className="input-field text-xs"
              placeholder="Ringkasan 1-2 kalimat untuk kartu berita"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Konten Lengkap Berita (Mendukung HTML & Teks Paragraf) *</label>
            <textarea
              rows={8}
              required
              className="input-field font-sans text-xs"
              placeholder="Tuliskan isi berita di sini..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Tekan Enter untuk baris baru, dan Enter dua kali untuk memisahkan paragraf.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2 px-5"
            >
              {saving ? 'Menyimpan...' : 'Simpan Berita'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        title="Hapus Berita?"
        message="Artikel berita ini akan dihapus secara permanen dari database."
        confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  );
}
