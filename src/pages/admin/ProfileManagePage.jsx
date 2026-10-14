import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { LoadingSpinner, FormGroup } from '../../components/ui/index';
import { BookOpen, Save, Target, ShieldCheck, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileManagePage() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Kelola Profil Instansi - PLHUT Admin';
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    settingsAPI.getAll()
      .then((res) => {
        setFormData(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil data profil.');
      })
      .finally(() => setLoading(false));
  };

  const handleChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(formData);
      toast.success('Informasi profil instansi berhasil disimpan.');
    } catch (err) {
      toast.error('Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat profil instansi..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-black">Kelola Informasi Profil Instansi</h1>
        <p className="text-xs text-gray-500">Sesuaikan deskripsi sejarah, visi, misi, dan pimpinan kantor</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building2 size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Sejarah & Gambaran Singkat Kantor</h2>
          </div>

          <FormGroup label="Nama Pimpinan Kantor">
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

          <FormGroup label="Pernyataan Sambutan Resmi Pimpinan">
            <textarea
              rows={5}
              className="input-field text-xs leading-relaxed"
              value={formData.site_welcome_text || ''}
              onChange={(e) => handleChange('site_welcome_text', e.target.value)}
            />
          </FormGroup>
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
    </div>
  );
}
