import React, { useState, useEffect } from 'react';
import { agendasAPI } from '../../services/api';
import { LoadingSpinner, EmptyState, Modal, ConfirmModal, Badge } from '../../components/ui/index';
import { formatDate, agendaStatusLabel, agendaStatusClass } from '../../utils/helpers';
import { Plus, Calendar, Edit3, Trash2, Clock, MapPin, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AgendaPage() {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '08:00',
    end_time: '12:00',
    location: '',
    status: 'upcoming',
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = 'Agenda Manasik - PLHUT Admin';
    fetchAgendas();
  }, [statusFilter]);

  const fetchAgendas = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;

    agendasAPI.getAll(params)
      .then((res) => setAgendas(res.data || []))
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil agenda.');
      })
      .finally(() => setLoading(false));
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      event_date: '',
      start_time: '08:00',
      end_time: '12:00',
      location: 'Aula Gedung PLHUT Magetan',
      status: 'upcoming',
    });
    setImageFile(null);
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      event_date: item.event_date || '',
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      location: item.location || '',
      status: item.status,
    });
    setImageFile(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.event_date) {
      toast.error('Nama kegiatan dan tanggal kegiatan wajib diisi.');
      return;
    }

    setSaving(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('event_date', formData.event_date);
    data.append('start_time', formData.start_time);
    data.append('end_time', formData.end_time);
    data.append('location', formData.location);
    data.append('status', formData.status);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingItem) {
        await agendasAPI.update(editingItem.id, data);
        toast.success('Agenda berhasil diperbarui.');
      } else {
        await agendasAPI.create(data);
        toast.success('Agenda baru berhasil ditambahkan.');
      }
      setFormOpen(false);
      fetchAgendas();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan agenda.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await agendasAPI.delete(deleteId);
      toast.success('Agenda berhasil dihapus.');
      setDeleteId(null);
      fetchAgendas();
    } catch (err) {
      toast.error('Gagal menghapus agenda.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Manajemen Agenda Manasik & Acara</h1>
          <p className="text-xs text-gray-500">Kelola jadwal bimbingan dan kegiatan jemaah</p>
        </div>
        <button
          onClick={openCreateForm}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus size={16} /> Tambah Agenda Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status Agenda:</span>
          <select
            className="input-field py-1.5 text-xs w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="upcoming">Akan Datang (Upcoming)</option>
            <option value="ongoing">Sedang Berlangsung (Ongoing)</option>
            <option value="completed">Selesai (Completed)</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat jadwal agenda..." />
        ) : agendas.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Belum ada agenda"
            description="Tambahkan kegiatan bimbingan manasik atau sosialisasi haji."
            action={
              <button onClick={openCreateForm} className="btn-primary text-xs py-2 px-4 mt-2">
                + Tambah Agenda
              </button>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Kegiatan</th>
                  <th>Tanggal Pelaksanaan</th>
                  <th>Waktu</th>
                  <th>Lokasi</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {agendas.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong className="block text-black font-semibold text-xs mb-0.5">{item.title}</strong>
                      <span className="text-[11px] text-gray-500 line-clamp-1">{item.description}</span>
                    </td>
                    <td className="text-xs text-gray-700 whitespace-nowrap">
                      {formatDate(item.event_date)}
                    </td>
                    <td className="text-xs text-gray-600 whitespace-nowrap">
                      {item.start_time || '-'}{item.end_time ? ` - ${item.end_time}` : ''} WIB
                    </td>
                    <td className="text-xs text-gray-600">
                      {item.location || '-'}
                    </td>
                    <td>
                      <span className={`badge ${agendaStatusClass[item.status]} text-[11px]`}>
                        {agendaStatusLabel[item.status]}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                          title="Edit" aria-label="Edit agenda"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Hapus" aria-label="Hapus agenda"
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
        title={editingItem ? 'Edit Agenda Manasik' : 'Tambah Agenda Manasik'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nama Kegiatan *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Contoh: Bimbingan Manasik Haji Tahap I Kloter Reguler"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="input-label">Tanggal Acara *</label>
              <input
                type="date"
                required
                className="input-field text-xs"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Jam Mulai</label>
              <input
                type="text"
                className="input-field text-xs"
                placeholder="08:00"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Jam Selesai</label>
              <input
                type="text"
                className="input-field text-xs"
                placeholder="12:00"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Lokasi Kegiatan</label>
              <input
                type="text"
                className="input-field text-xs"
                placeholder="Contoh: Aula Kemenag Magetan / KUA Kec. Maospati"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label className="input-label">Status Kegiatan</label>
              <select
                className="input-field text-xs"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="upcoming">Akan Datang (Upcoming)</option>
                <option value="ongoing">Sedang Berlangsung (Ongoing)</option>
                <option value="completed">Selesai (Completed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Foto / Pamflet Acara (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              className="input-field text-xs"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div>
            <label className="input-label">Deskripsi Rincian Acara & Petunjuk Peserta</label>
            <textarea
              rows={4}
              className="input-field text-xs"
              placeholder="Rincian materi, pemateri, pakaian yang disarankan, atau barang bawaan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {saving ? 'Menyimpan...' : 'Simpan Agenda'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        title="Hapus Agenda?"
        message="Agenda kegiatan ini akan dihapus secara permanen."
        confirmText={deleting ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  );
}
