import React, { useState, useEffect } from 'react';
import { faqsAPI } from '../../services/api';
import { LoadingSpinner, EmptyState, Modal, ConfirmModal, Badge } from '../../components/ui/index';
import { Plus, HelpCircle, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FAQManagePage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'umum',
    sort_order: 0,
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Manajemen FAQ - PLHUT Admin';
    fetchFaqs();
  }, [categoryFilter]);

  const fetchFaqs = () => {
    setLoading(true);
    const params = { all: 'true' };
    if (categoryFilter) params.category = categoryFilter;

    faqsAPI.getAll(params)
      .then((res) => setFaqs(res.data || []))
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil data FAQ.');
      })
      .finally(() => setLoading(false));
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      question: '',
      answer: '',
      category: 'umum',
      sort_order: 0,
      status: 'active',
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category || 'umum',
      sort_order: item.sort_order || 0,
      status: item.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Pertanyaan dan jawaban wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await faqsAPI.update(editingItem.id, formData);
        toast.success('FAQ berhasil diperbarui.');
      } else {
        await faqsAPI.create(formData);
        toast.success('FAQ baru berhasil ditambahkan.');
      }
      setFormOpen(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await faqsAPI.delete(deleteId);
      toast.success('FAQ berhasil dihapus.');
      setDeleteId(null);
      fetchFaqs();
    } catch (err) {
      toast.error('Gagal menghapus FAQ.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Manajemen Tanya Jawab (FAQ)</h1>
          <p className="text-xs text-gray-500">Kelola daftar pertanyaan yang sering diajukan masyarakat</p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus size={16} /> Tambah FAQ Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Kategori FAQ:</span>
          <select
            className="input-field py-1.5 text-xs w-44"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="umum">Umum</option>
            <option value="haji">Pelayanan Haji</option>
            <option value="umrah">Pelayanan Umrah</option>
            <option value="manasik">Manasik</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar FAQ..." />
        ) : faqs.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="Belum ada FAQ"
            description="Tambahkan pertanyaan dan jawaban yang sering ditanyakan masyarakat."
            action={
              <button onClick={openCreateForm} className="btn-primary text-xs py-2 px-4 mt-2">
                + Tambah FAQ
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pertanyaan</th>
                  <th>Kategori</th>
                  <th>Jawaban</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className="block text-black font-semibold text-xs">{item.question}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gold uppercase text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="text-xs text-gray-600 max-w-sm truncate">
                      {item.answer}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-gray'} text-[11px]`}>
                        {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                          title="Edit" aria-label="Edit FAQ"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Hapus" aria-label="Hapus FAQ"
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

      {/* Modal Form Tambah / Edit */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingItem ? 'Edit FAQ' : 'Tambah FAQ'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Pertanyaan *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Contoh: Berapa setoran awal pendaftaran haji?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
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
                <option value="umum">Umum</option>
                <option value="haji">Pelayanan Haji</option>
                <option value="umrah">Pelayanan Umrah</option>
                <option value="manasik">Manasik</option>
              </select>
            </div>

            <div>
              <label className="input-label">Status *</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Aktif (Tampil)</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Jawaban Lengkap *</label>
            <textarea
              rows={5}
              required
              className="input-field text-xs"
              placeholder="Tuliskan jawaban yang jelas dan informatif..."
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            />
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
              {saving ? 'Menyimpan...' : 'Simpan FAQ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        title="Hapus FAQ?"
        message="FAQ ini akan dihapus dari daftar tanya jawab."
        confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  );
}
