import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, EmptyState, Modal, ConfirmModal, Badge } from '../../components/ui/index';
import { formatDate } from '../../utils/helpers';
import { Plus, Users, Edit3, Trash2, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagePage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor',
    is_active: 1,
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Manajemen Pengguna - PLHUT Admin';
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    usersAPI.getAll()
      .then((res) => setUsers(res.data || []))
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil daftar pengguna.');
      })
      .finally(() => setLoading(false));
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'editor',
      is_active: 1,
    });
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      email: item.email,
      password: '', // blank unless resetting
      role: item.role,
      is_active: item.is_active ? 1 : 0,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || (!editingItem && !formData.email.trim())) {
      toast.error('Nama dan email wajib diisi.');
      return;
    }

    if (!editingItem && (!formData.password || formData.password.length < 8)) {
      toast.error('Kata sandi awal wajib diisi minimal 8 karakter.');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await usersAPI.update(editingItem.id, formData);
        toast.success('Data pengguna berhasil diperbarui.');
      } else {
        await usersAPI.create(formData);
        toast.success('Pengguna baru berhasil ditambahkan.');
      }
      setFormOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan pengguna.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await usersAPI.delete(deleteId);
      toast.success('Pengguna berhasil dihapus.');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus pengguna.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Manajemen Akun Petugas & Administrator</h1>
          <p className="text-xs text-gray-500">Atur hak akses dan peran petugas pengelola sistem</p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus size={16} /> Tambah Petugas Baru
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar pengguna..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada pengguna"
            description="Tambahkan akun petugas untuk mengelola konten website."
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Petugas</th>
                  <th>Email Login</th>
                  <th>Peran (Role)</th>
                  <th>Status Akun</th>
                  <th>Tanggal Terdaftar</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className="block text-black font-semibold text-xs">{item.name}</strong>
                      {currentUser?.id === item.id && (
                        <span className="text-[10px] text-yellow-700 font-medium">(Akun Anda Sendiri)</span>
                      )}
                    </td>
                    <td className="text-xs font-mono text-gray-700">
                      {item.email}
                    </td>
                    <td>
                      <span className={`badge ${item.role === 'admin' ? 'badge-gold' : 'badge-info'} text-[11px] capitalize`}>
                        {item.role === 'admin' ? 'Administrator' : 'Editor Konten'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge-success' : 'badge-error'} text-[11px]`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                          title="Edit" aria-label="Edit pengguna"
                        >
                          <Edit3 size={15} />
                        </button>
                        {currentUser?.id !== item.id && (
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Hapus" aria-label="Hapus pengguna"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
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
        title={editingItem ? 'Edit Akun Petugas' : 'Tambah Petugas Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nama Lengkap Petugas *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Contoh: Ahmad Fauzi, S.Ag."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Email Akun (Digunakan untuk Login) *</label>
            <input
              type="email"
              required
              disabled={!!editingItem}
              className="input-field disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="petugas@plhut-magetan.go.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {editingItem && (
              <p className="text-[11px] text-gray-400 mt-1">Email login tidak dapat diubah setelah terdaftar.</p>
            )}
          </div>

          <div>
            <label className="input-label">
              {editingItem ? 'Reset Kata Sandi (Kosongkan jika tidak diubah)' : 'Kata Sandi Awal *'}
            </label>
            <input
              type="password"
              className="input-field"
              placeholder={editingItem ? 'Isi hanya jika ingin mengganti sandi' : 'Minimal 8 karakter'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Peran (Hak Akses) *</label>
              <select
                className="input-field text-xs"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="editor">Editor Konten (Berita, Agenda, FAQ)</option>
                <option value="admin">Administrator Penuh</option>
              </select>
            </div>

            <div>
              <label className="input-label">Status Akun *</label>
              <select
                className="input-field text-xs"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
              >
                <option value={1}>Aktif (Bisa Login)</option>
                <option value={0}>Nonaktif (Diblokir)</option>
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
              {saving ? 'Menyimpan...' : 'Simpan Petugas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        title="Hapus Akun Petugas?"
        message="Akun pengguna ini tidak akan dapat mengakses panel administrator lagi."
        confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  );
}
