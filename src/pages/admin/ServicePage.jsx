import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../../services/api';
import { LoadingSpinner, EmptyState, Modal, ConfirmModal, Badge } from '../../components/ui/index';
import { Plus, BookOpen, Edit3, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'haji',
    description: '',
    requirements: '',
    procedure: '',
    official_url: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Manajemen Layanan - PLHUT Admin';
    fetchServices();
  }, [categoryFilter]);

  const fetchServices = () => {
    setLoading(true);
    const params = { all: 'true' };
    if (categoryFilter) params.category = categoryFilter;

    servicesAPI.getAll(params)
      .then((res) => setServices(res.data || []))
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil data layanan.');
      })
      .finally(() => setLoading(false));
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'haji',
      description: '',
      requirements: '',
      procedure: '',
      official_url: '',
      status: 'active',
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description || '',
      requirements: item.requirements || '',
      procedure: item.procedure || '',
      official_url: item.official_url || '',
      status: item.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Nama layanan wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await servicesAPI.update(editingItem.id, formData);
        toast.success('Layanan berhasil diperbarui.');
      } else {
        await servicesAPI.create(formData);
        toast.success('Layanan berhasil ditambahkan.');
      }
      setFormOpen(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan layanan.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await servicesAPI.delete(deleteId);
      toast.success('Layanan berhasil dihapus.');
      setDeleteId(null);
      fetchServices();
    } catch (err) {
      toast.error('Gagal menghapus layanan.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Manajemen Informasi Layanan</h1>
          <p className="text-xs text-gray-500">Kelola persyaratan, prosedur, dan regulasi layanan publik</p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus size={16} /> Tambah Layanan Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Kategori Layanan:</span>
          <select
            className="input-field py-1.5 text-xs w-48"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="haji">Pelayanan Haji</option>
            <option value="umrah">Pelayanan Umrah</option>
            <option value="manasik">Bimbingan Manasik</option>
            <option value="informasi">Informasi Umum</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar layanan..." />
        ) : services.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada data layanan"
            description="Tambahkan rincian persyaratan layanan publik haji atau umrah."
            action={
              <button onClick={openCreateForm} className="btn-primary text-xs py-2 px-4 mt-2">
                + Tambah Layanan
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Layanan</th>
                  <th>Kategori</th>
                  <th>Persyaratan</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className="block text-black font-semibold text-xs mb-0.5">{item.title}</strong>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{item.description}</span>
                    </td>
                    <td>
                      <span className="badge badge-gold uppercase text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="text-xs text-gray-600 max-w-xs truncate">
                      {item.requirements || '-'}
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
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Hapus"
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
        title={editingItem ? 'Edit Layanan' : 'Tambah Layanan'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nama Layanan *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Contoh: Pendaftaran dan Pembatalan Porsi Haji Reguler"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Kategori Layanan *</label>
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="haji">Pelayanan Haji</option>
                <option value="umrah">Pelayanan Umrah</option>
                <option value="manasik">Bimbingan Manasik</option>
                <option value="informasi">Informasi Umum</option>
              </select>
            </div>

            <div>
              <label className="input-label">Status *</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Aktif (Tampil di Halaman Publik)</option>
                <option value="inactive">Nonaktif (Disembunyikan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Deskripsi Singkat Layanan</label>
            <textarea
              rows={2}
              className="input-field text-xs"
              placeholder="Penjelasan umum fungsi layanan ini..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Persyaratan dan Berkas yang Wajib Dibawa</label>
            <textarea
              rows={4}
              className="input-field text-xs font-mono"
              placeholder="1. KTP elektronik&#10;2. Kartu Keluarga&#10;3. Buku Tabungan BPS BPIH..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Tahapan / Prosedur Alur Pelayanan</label>
            <textarea
              rows={4}
              className="input-field text-xs font-mono"
              placeholder="1. Mengambil nomor antrean loket&#10;2. Verifikasi berkas administrasi&#10;3. Pemindaian biometrik foto & sidik jari..."
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Tautan / Sumber Regulasi Resmi (Opsional)</label>
            <input
              type="url"
              className="input-field text-xs"
              placeholder="https://haji.kemenag.go.id"
              value={formData.official_url}
              onChange={(e) => setFormData({ ...formData, official_url: e.target.value })}
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
              {saving ? 'Menyimpan...' : 'Simpan Layanan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        title="Hapus Layanan?"
        message="Informasi layanan ini akan dihapus dari halaman publik."
        confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  );
}
