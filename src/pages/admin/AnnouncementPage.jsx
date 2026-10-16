import React, { useState, useEffect } from 'react';
import { announcementsAPI } from '../../services/api';
import { LoadingSpinner, EmptyState, Modal, ConfirmModal, Badge } from '../../components/ui/index';
import { formatDate } from '../../utils/helpers';
import { Plus, Megaphone, Edit3, Trash2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 1,
    start_date: '',
    end_date: '',
    status: 'active',
    show_on_home: 1,
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Manajemen Pengumuman - PLHUT Admin';
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    setLoading(true);
    announcementsAPI.getAll({ all: 'true' })
      .then((res) => setAnnouncements(res.data || []))
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil pengumuman.');
      })
      .finally(() => setLoading(false));
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      priority: 1,
      start_date: '',
      end_date: '',
      status: 'active',
      show_on_home: 1,
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      priority: item.priority || 1,
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      status: item.status,
      show_on_home: item.show_on_home ? 1 : 0,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await announcementsAPI.update(editingItem.id, formData);
        toast.success('Pengumuman berhasil diperbarui.');
      } else {
        await announcementsAPI.create(formData);
        toast.success('Pengumuman berhasil ditambahkan.');
      }
      setFormOpen(false);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan pengumuman.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await announcementsAPI.delete(deleteId);
      toast.success('Pengumuman berhasil dihapus.');
      setDeleteId(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error('Gagal menghapus pengumuman.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Manajemen Pengumuman Resmi</h1>
          <p className="text-xs text-gray-500">Kelola maklumat penting dan pengumuman instansi</p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus size={16} /> Tambah Pengumuman
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar pengumuman..." />
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Belum ada pengumuman"
            description="Buat pengumuman resmi pertama untuk masyarakat."
            action={
              <button onClick={openCreateForm} className="btn-primary text-xs py-2 px-4 mt-2">
                + Tambah Pengumuman
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul Pengumuman</th>
                  <th>Periode Tayang</th>
                  <th>Status</th>
                  <th>Prioritas</th>
                  <th>Tampil di Beranda</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className="block text-black font-semibold text-xs mb-0.5">{item.title}</strong>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{item.content}</span>
                    </td>
                    <td className="text-xs text-gray-600 whitespace-nowrap">
                      {item.start_date || item.end_date ? (
                        <span>{formatDate(item.start_date)} s.d {formatDate(item.end_date)}</span>
                      ) : (
                        <span className="text-gray-400">Selamanya</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-gray'} text-[11px]`}>
                        {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-700">
                      Tingkat {item.priority || 1}
                    </td>
                    <td>
                      <span className={`badge ${item.show_on_home ? 'badge-info' : 'badge-gray'} text-[11px]`}>
                        {item.show_on_home ? 'Ya' : 'Tidak'}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                          title="Edit" aria-label="Edit pengumuman"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Hapus" aria-label="Hapus pengumuman"
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
        title={editingItem ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Judul Pengumuman *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Contoh: Pengumuman Pembukaan Layanan Biometrik Haji"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Isi Pengumuman *</label>
            <textarea
              rows={5}
              required
              className="input-field text-xs"
              placeholder="Tuliskan isi pengumuman lengkap..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Tanggal Mulai (Opsional)</label>
              <input
                type="date"
                className="input-field text-xs"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Tanggal Berakhir (Opsional)</label>
              <input
                type="date"
                className="input-field text-xs"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Prioritas</label>
              <select
                className="input-field text-xs"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              >
                <option value={1}>1 (Standar)</option>
                <option value={2}>2 (Menengah)</option>
                <option value={3}>3 (Sangat Penting)</option>
              </select>
            </div>

            <div>
              <label className="input-label">Status</label>
              <select
                className="input-field text-xs"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            <div>
              <label className="input-label">Tampil di Beranda</label>
              <select
                className="input-field text-xs"
                value={formData.show_on_home}
                onChange={(e) => setFormData({ ...formData, show_on_home: parseInt(e.target.value) })}
              >
                <option value={1}>Ya (Tampilkan)</option>
                <option value={0}>Tidak</option>
              </select>
            </div>
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
              {saving ? 'Menyimpan...' : 'Simpan Pengumuman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        title="Hapus Pengumuman?"
        message="Pengumuman ini akan dihapus secara permanen."
        confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  );
}
