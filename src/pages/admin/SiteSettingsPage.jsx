import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { LoadingSpinner, FormGroup } from '../../components/ui/index';
import { Settings, Save, Building, Phone, Globe, MessageSquare, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SiteSettingsPage() {
  const { settings: globalSettings, setSettings: updateGlobalSettings } = useSiteSettings();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Pengaturan Website - PLHUT Admin';
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
        toast.error('Gagal mengambil pengaturan website.');
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
      updateGlobalSettings((prev) => ({ ...prev, ...formData }));
      toast.success('Pengaturan website berhasil disimpan dan diperbarui.');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat konfigurasi website..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black">Pengaturan Umum Website</h1>
          <p className="text-xs text-gray-500">Konfigurasi identitas kantor, kontak resmi, dan teks beranda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Instansi */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Identitas & Nomenklatur Instansi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Nama Lengkap Instansi">
              <input
                type="text"
                className="input-field"
                value={formData.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Nama Singkat / Brand">
              <input
                type="text"
                className="input-field"
                value={formData.site_short_name || ''}
                onChange={(e) => handleChange('site_short_name', e.target.value)}
              />
            </FormGroup>
          </div>

          <FormGroup label="Deskripsi Profil Instansi Singkat">
            <textarea
              rows={2}
              className="input-field text-xs"
              value={formData.site_description || ''}
              onChange={(e) => handleChange('site_description', e.target.value)}
            />
          </FormGroup>
        </div>

        {/* Hero Banner Beranda */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Globe size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Teks Hero Banner (Halaman Beranda)</h2>
          </div>

          <FormGroup label="Judul Utama Hero">
            <input
              type="text"
              className="input-field"
              value={formData.site_hero_title || ''}
              onChange={(e) => handleChange('site_hero_title', e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Subjudul / Slogan Pelayanan Hero">
            <textarea
              rows={2}
              className="input-field text-xs"
              value={formData.site_hero_subtitle || ''}
              onChange={(e) => handleChange('site_hero_subtitle', e.target.value)}
            />
          </FormGroup>
        </div>

        {/* Sambutan Pimpinan */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MessageSquare size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Sambutan Pimpinan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Nama Pejabat Pimpinan" hint="Gunakan placeholder bila data pejabat belum terverifikasi">
              <input
                type="text"
                className="input-field"
                value={formData.site_welcome_name || ''}
                onChange={(e) => handleChange('site_welcome_name', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Jabatan Resmi">
              <input
                type="text"
                className="input-field"
                value={formData.site_welcome_title || ''}
                onChange={(e) => handleChange('site_welcome_title', e.target.value)}
              />
            </FormGroup>
          </div>

          <FormGroup label="Pesan Sambutan">
            <textarea
              rows={4}
              className="input-field text-xs leading-relaxed"
              value={formData.site_welcome_text || ''}
              onChange={(e) => handleChange('site_welcome_text', e.target.value)}
            />
          </FormGroup>
        </div>

        {/* Kontak & Jam Operasional */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Phone size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Kontak & Jam Kerja Pelayanan</h2>
          </div>

          <FormGroup label="Alamat Kantor Resmi">
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

            <FormGroup label="Jam Pelayanan">
              <input
                type="text"
                className="input-field"
                value={formData.site_hours || ''}
                onChange={(e) => handleChange('site_hours', e.target.value)}
              />
            </FormGroup>
          </div>
        </div>

        {/* Media Sosial & Footer */}
        <div className="card p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Share2 size={18} className="text-yellow-600" />
            <h2 className="font-bold text-sm text-black">Tautan Media Sosial & Teks Footer</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="URL Facebook">
              <input
                type="url"
                className="input-field text-xs"
                placeholder="https://facebook.com/..."
                value={formData.site_facebook || ''}
                onChange={(e) => handleChange('site_facebook', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="URL Instagram">
              <input
                type="url"
                className="input-field text-xs"
                placeholder="https://instagram.com/..."
                value={formData.site_instagram || ''}
                onChange={(e) => handleChange('site_instagram', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="URL YouTube">
              <input
                type="url"
                className="input-field text-xs"
                placeholder="https://youtube.com/..."
                value={formData.site_youtube || ''}
                onChange={(e) => handleChange('site_youtube', e.target.value)}
              />
            </FormGroup>

            <FormGroup label="URL Twitter / X">
              <input
                type="url"
                className="input-field text-xs"
                placeholder="https://twitter.com/..."
                value={formData.site_twitter || ''}
                onChange={(e) => handleChange('site_twitter', e.target.value)}
              />
            </FormGroup>
          </div>

          <FormGroup label="Teks Hak Cipta Footer">
            <input
              type="text"
              className="input-field text-xs"
              value={formData.site_footer_text || ''}
              onChange={(e) => handleChange('site_footer_text', e.target.value)}
            />
          </FormGroup>
        </div>

        {/* Tombol Simpan */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-8 text-xs font-bold flex items-center gap-2"
          >
            <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
