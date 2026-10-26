import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { settingsAPI, staffAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { LoadingSpinner, FormGroup, Modal, ConfirmModal } from '../../components/ui/index';
import {
  Save, Target, ShieldCheck, Building2, ImagePlus, Trash2, Edit3, Plus,
  Users, UserRound, ExternalLink, Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_STAFF = {
  name: '',
  position: '',
  unit: '',
  sort_order: 0,
  status: 'active',
};

// Membuat URL pratinjau lokal untuk file yang baru dipilih.
function useFilePreview(file) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return preview;
}

export default function ProfileManagePage() {
  const { setSettings } = useSiteSettings();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Foto kantor & pimpinan
  const [officePhotoFile, setOfficePhotoFile] = useState(null);
  const [leaderPhotoFile, setLeaderPhotoFile] = useState(null);
  const [photoDeleteKey, setPhotoDeleteKey] = useState(null);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  const officePhotoPreview = useFilePreview(officePhotoFile);
  const leaderPhotoPreview = useFilePreview(leaderPhotoFile);

  // Data pegawai & karyawan
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffFormOpen, setStaffFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF);
  const [staffPhotoFile, setStaffPhotoFile] = useState(null);
  const [staffSaving, setStaffSaving] = useState(false);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(false);

  const staffPhotoPreview = useFilePreview(staffPhotoFile);

  useEffect(() => {
    document.title = 'Kelola Profil Instansi - PLHUT Admin';
    fetchSettings();
    fetchStaff();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    settingsAPI.getAll()
      .then((res) => setFormData(res.data))
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil data profil.');
      })
      .finally(() => setLoading(false));
  };

  const fetchStaff = () => {
    setStaffLoading(true);
    staffAPI.getAll({ status: 'all' })
      .then((res) => setStaff(res.data || []))
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil data pegawai.');
      })
      .finally(() => setStaffLoading(false));
  };

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const nextData = { ...formData };

      // Unggah foto terlebih dahulu, lalu simpan seluruh teks profil.
      if (officePhotoFile) {
        const res = await settingsAPI.uploadPhoto('profile_office_photo', officePhotoFile);
        nextData.profile_office_photo = res.data.url;
        setFormData((prev) => ({ ...prev, profile_office_photo: res.data.url }));
        setSettings((prev) => ({ ...prev, profile_office_photo: res.data.url }));
        setOfficePhotoFile(null);
      }
      if (leaderPhotoFile) {
        const res = await settingsAPI.uploadPhoto('site_welcome_photo', leaderPhotoFile);
        nextData.site_welcome_photo = res.data.url;
        setFormData((prev) => ({ ...prev, site_welcome_photo: res.data.url }));
        setSettings((prev) => ({ ...prev, site_welcome_photo: res.data.url }));
        setLeaderPhotoFile(null);
      }

      await settingsAPI.update(nextData);
      setFormData(nextData);
      setSettings((prev) => ({ ...prev, ...nextData }));
      toast.success('Informasi profil instansi berhasil disimpan.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!photoDeleteKey) return;
    setDeletingPhoto(true);
    try {
      await settingsAPI.deletePhoto(photoDeleteKey);
      setFormData((prev) => ({ ...prev, [photoDeleteKey]: '' }));
      setSettings((prev) => ({ ...prev, [photoDeleteKey]: '' }));
      if (photoDeleteKey === 'profile_office_photo') setOfficePhotoFile(null);
      if (photoDeleteKey === 'site_welcome_photo') setLeaderPhotoFile(null);
      toast.success('Foto berhasil dihapus.');
      setPhotoDeleteKey(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus foto.');
    } finally {
      setDeletingPhoto(false);
    }
  };

  const openStaffForm = (item = null) => {
    setEditingStaff(item);
    setStaffForm(item ? {
      name: item.name || '',
      position: item.position || '',
      unit: item.unit || '',
      sort_order: item.sort_order ?? 0,
      status: item.status || 'active',
    } : EMPTY_STAFF);
    setStaffPhotoFile(null);
    setStaffFormOpen(true);
  };

  const closeStaffForm = () => {
    setStaffFormOpen(false);
    setEditingStaff(null);
    setStaffForm(EMPTY_STAFF);
    setStaffPhotoFile(null);
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.position.trim()) {
      toast.error('Nama dan jabatan pegawai wajib diisi.');
      return;
    }

    setStaffSaving(true);
    const data = new FormData();
    data.append('name', staffForm.name);
    data.append('position', staffForm.position);
    data.append('unit', staffForm.unit || '');
    data.append('sort_order', String(staffForm.sort_order ?? 0));
    data.append('status', staffForm.status || 'active');
    if (staffPhotoFile) data.append('photo', staffPhotoFile);

    try {
      if (editingStaff) {
        await staffAPI.update(editingStaff.id, data);
        toast.success('Data pegawai berhasil diperbarui.');
      } else {
        await staffAPI.create(data);
        toast.success('Pegawai baru berhasil ditambahkan.');
      }
      closeStaffForm();
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Gagal menyimpan data pegawai.');
    } finally {
      setStaffSaving(false);
    }
  };

  const confirmDeleteStaff = async () => {
    if (!deleteStaffId) return;
    setDeletingStaff(true);
    try {
      await staffAPI.delete(deleteStaffId);
      toast.success('Data pegawai berhasil dihapus.');
      setDeleteStaffId(null);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal menghapus data pegawai.');
    } finally {
      setDeletingStaff(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat profil instansi..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Kelola Informasi Profil Instansi</h1>
          <p className="text-xs text-gray-500">Perbarui sejarah, visi, misi, tugas, foto kantor, pimpinan, serta data pegawai.</p>
        </div>
        <Link to="/profil" target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-2.5 px-4 inline-flex items-center justify-center gap-1.5">
          Lihat Halaman Profil <ExternalLink size={14} />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi teks profil */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building2 size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Sejarah & Gambaran Umum</h2>
          </div>

          <FormGroup
            label="Sejarah / Gambaran Umum Instansi"
            hint="Tekan Enter dua kali untuk memisahkan paragraf."
          >
            <textarea
              rows={6}
              className="input-field text-xs leading-relaxed"
              value={formData.profile_history || ''}
              onChange={(e) => handleChange('profile_history', e.target.value)}
            />
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Target size={16} className="text-yellow-600" />
                <h3 className="font-semibold text-xs text-black">Visi & Misi</h3>
              </div>

              <FormGroup label="Visi">
                <textarea
                  rows={3}
                  className="input-field text-xs leading-relaxed"
                  value={formData.profile_vision || ''}
                  onChange={(e) => handleChange('profile_vision', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Misi" hint="Satu baris = satu poin misi.">
                <textarea
                  rows={5}
                  className="input-field text-xs leading-relaxed"
                  value={formData.profile_mission || ''}
                  onChange={(e) => handleChange('profile_mission', e.target.value)}
                />
              </FormGroup>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <ShieldCheck size={16} className="text-yellow-600" />
                <h3 className="font-semibold text-xs text-black">Tugas, Fungsi & Unit Layanan</h3>
              </div>

              <FormGroup label="Tugas dan Fungsi" hint="Satu baris = satu poin. Format: Judul|Deskripsi">
                <textarea
                  rows={5}
                  className="input-field text-xs leading-relaxed"
                  value={formData.profile_duties || ''}
                  onChange={(e) => handleChange('profile_duties', e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Unit Layanan Aktif" hint="Satu baris = satu unit layanan.">
                <textarea
                  rows={4}
                  className="input-field text-xs leading-relaxed"
                  value={formData.profile_units || ''}
                  onChange={(e) => handleChange('profile_units', e.target.value)}
                />
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Foto kantor */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <ImagePlus size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Foto Kantor / Gedung PLHUT</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="w-full h-52 rounded-xl border border-gray-200 bg-stone-100 overflow-hidden flex items-center justify-center">
                {(officePhotoPreview || formData.profile_office_photo) ? (
                  <img
                    src={officePhotoPreview || formData.profile_office_photo}
                    alt="Pratinjau foto kantor"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400 px-4">
                    <ImagePlus size={36} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Belum ada foto kantor</p>
                  </div>
                )}
              </div>
              {formData.profile_office_photo && !officePhotoFile && (
                <button
                  type="button"
                  onClick={() => setPhotoDeleteKey('profile_office_photo')}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
                >
                  <Trash2 size={12} /> Hapus foto kantor
                </button>
              )}
            </div>

            <div className="space-y-4">
              <FormGroup label="Unggah Foto Kantor" hint="JPG, PNG, WEBP, atau GIF. Maksimal 5 MB.">
                <input
                  type="file"
                  accept="image/*"
                  className="input-field text-xs"
                  onChange={(e) => setOfficePhotoFile(e.target.files[0] || null)}
                />
              </FormGroup>

              <FormGroup label="Keterangan Foto">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Contoh: Gedung PLHUT Kabupaten Magetan"
                  value={formData.profile_office_photo_caption || ''}
                  onChange={(e) => handleChange('profile_office_photo_caption', e.target.value)}
                />
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Pimpinan */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <UserRound size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Foto & Informasi Pimpinan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-40 h-40 rounded-2xl border border-gray-200 bg-stone-100 overflow-hidden flex items-center justify-center mx-auto">
                {(leaderPhotoPreview || formData.site_welcome_photo) ? (
                  <img
                    src={leaderPhotoPreview || formData.site_welcome_photo}
                    alt="Pratinjau foto pimpinan"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound size={56} className="text-gray-300" />
                )}
              </div>
              {formData.site_welcome_photo && !leaderPhotoFile && (
                <button
                  type="button"
                  onClick={() => setPhotoDeleteKey('site_welcome_photo')}
                  className="mt-3 w-full inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
                >
                  <Trash2 size={12} /> Hapus foto pimpinan
                </button>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <FormGroup label="Unggah Foto Pimpinan" hint="JPG, PNG, WEBP, atau GIF. Maksimal 5 MB.">
                <input
                  type="file"
                  accept="image/*"
                  className="input-field text-xs"
                  onChange={(e) => setLeaderPhotoFile(e.target.files[0] || null)}
                />
              </FormGroup>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormGroup label="Nama Pimpinan">
                  <input
                    type="text"
                    className="input-field"
                    value={formData.site_welcome_name || ''}
                    onChange={(e) => handleChange('site_welcome_name', e.target.value)}
                  />
                </FormGroup>
                <FormGroup label="Jabatan Pimpinan">
                  <input
                    type="text"
                    className="input-field"
                    value={formData.site_welcome_title || ''}
                    onChange={(e) => handleChange('site_welcome_title', e.target.value)}
                  />
                </FormGroup>
              </div>

              <FormGroup label="Pernyataan Sambutan Resmi Pimpinan">
                <textarea
                  rows={4}
                  className="input-field text-xs leading-relaxed"
                  value={formData.site_welcome_text || ''}
                  onChange={(e) => handleChange('site_welcome_text', e.target.value)}
                />
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Kontak & jam layanan */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Phone size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Kontak & Jam Layanan</h2>
          </div>

          <FormGroup label="Alamat Kantor">
            <input
              type="text"
              className="input-field"
              value={formData.site_address || ''}
              onChange={(e) => handleChange('site_address', e.target.value)}
            />
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormGroup label="Telepon / WhatsApp">
              <input
                type="text"
                className="input-field"
                value={formData.site_phone || ''}
                onChange={(e) => handleChange('site_phone', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Email Resmi">
              <input
                type="email"
                className="input-field"
                value={formData.site_email || ''}
                onChange={(e) => handleChange('site_email', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Jam Operasional">
              <input
                type="text"
                className="input-field"
                value={formData.site_hours || ''}
                onChange={(e) => handleChange('site_hours', e.target.value)}
              />
            </FormGroup>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-8 text-xs font-bold flex items-center gap-2"
          >
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Profil Instansi'}
          </button>
        </div>
      </form>

      {/* Pegawai & Karyawan */}
      <div className="card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-yellow-600" />
            <div>
              <h2 className="font-bold text-sm text-black">Pegawai & Karyawan</h2>
              <p className="text-[11px] text-gray-500">Data ini tampil pada halaman Profil Instansi.</p>
            </div>
          </div>
          <button type="button" onClick={() => openStaffForm()} className="btn-primary text-xs py-2.5 px-4 inline-flex items-center justify-center gap-1.5">
            <Plus size={15} /> Tambah Pegawai
          </button>
        </div>

        {staffLoading ? (
          <LoadingSpinner text="Memuat data pegawai..." size="sm" />
        ) : staff.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium text-gray-700">Belum ada data pegawai</p>
            <p className="text-xs mt-1">Tambahkan pegawai beserta foto agar tampil di profil instansi.</p>
          </div>
        ) : (
          <div className="table-responsive mt-2">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '72px' }}>Foto</th>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Unit / Bagian</th>
                  <th style={{ width: '90px' }}>Urutan</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} loading="lazy" className="w-12 h-12 object-cover rounded-xl bg-stone-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-gray-400">
                          <UserRound size={20} />
                        </div>
                      )}
                    </td>
                    <td><strong className="block text-black font-semibold text-xs">{item.name}</strong></td>
                    <td className="text-xs text-gray-600">{item.position}</td>
                    <td className="text-xs text-gray-500">{item.unit || '-'}</td>
                    <td className="text-xs text-gray-500">{item.sort_order ?? 0}</td>
                    <td>
                      <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-gray'} text-[11px]`}>
                        {item.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openStaffForm(item)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 transition-colors"
                          title="Edit" aria-label={`Edit ${item.name}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteStaffId(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Hapus" aria-label={`Hapus ${item.name}`}
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

      {/* Modal tambah/edit pegawai */}
      <Modal
        isOpen={staffFormOpen}
        onClose={closeStaffForm}
        title={editingStaff ? 'Edit Data Pegawai' : 'Tambah Pegawai & Karyawan'}
        size="md"
      >
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-stone-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {(staffPhotoPreview || editingStaff?.photo) ? (
                <img src={staffPhotoPreview || editingStaff.photo} alt="Pratinjau foto pegawai" className="w-full h-full object-cover" />
              ) : (
                <UserRound size={34} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <label className="input-label">Foto Pegawai</label>
              <input
                type="file"
                accept="image/*"
                className="input-field text-xs"
                onChange={(e) => setStaffPhotoFile(e.target.files[0] || null)}
              />
              <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, WEBP, atau GIF. Maksimal 5 MB.</p>
            </div>
          </div>

          <FormGroup label="Nama Lengkap" required>
            <input
              type="text"
              required
              className="input-field"
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Jabatan" required>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Contoh: Kepala Kantor / Staf Pelayanan"
              value={staffForm.position}
              onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Unit / Bagian">
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Seksi PHU / Loket Pendaftaran"
              value={staffForm.unit}
              onChange={(e) => setStaffForm({ ...staffForm, unit: e.target.value })}
            />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Urutan Tampil">
              <input
                type="number"
                min="0"
                className="input-field"
                value={staffForm.sort_order}
                onChange={(e) => setStaffForm({ ...staffForm, sort_order: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Status">
              <select
                className="input-field"
                value={staffForm.status}
                onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
              >
                <option value="active">Aktif (tampil di profil)</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </FormGroup>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={closeStaffForm} className="btn-secondary text-xs py-2 px-4">
              Batal
            </button>
            <button type="submit" disabled={staffSaving} className="btn-primary text-xs py-2 px-5">
              {staffSaving ? 'Menyimpan...' : 'Simpan Data Pegawai'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!photoDeleteKey}
        onConfirm={handleDeletePhoto}
        onCancel={() => setPhotoDeleteKey(null)}
        title="Hapus Foto?"
        message="Foto akan dihapus dari halaman profil instansi. Tindakan ini tidak dapat dibatalkan."
        confirmText={deletingPhoto ? 'Menghapus...' : 'Ya, Hapus'}
      />

      <ConfirmModal
        isOpen={!!deleteStaffId}
        onConfirm={confirmDeleteStaff}
        onCancel={() => setDeleteStaffId(null)}
        title="Hapus Data Pegawai?"
        message="Data pegawai dan fotonya akan dihapus permanen dari profil instansi."
        confirmText={deletingStaff ? 'Menghapus...' : 'Ya, Hapus'}
      />
    </div>
  );
}
