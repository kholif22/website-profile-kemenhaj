import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../../services/api';
import { LoadingSpinner, EmptyState, Modal, Pagination } from '../../components/ui/index';
import { formatDate, formatDateTime, complaintStatusLabel, complaintStatusClass } from '../../utils/helpers';
import {
  MessageSquare, Search, Eye, ShieldCheck, Download, FileSpreadsheet, FileText, RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintManagePage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Detail & Tindak Lanjut Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Export Modal
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeMessage, setIncludeMessage] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    document.title = 'Pengaduan Masyarakat - PLHUT Admin';
    fetchComplaints();
  }, [page, statusFilter, dateFrom, dateTo, appliedSearch, refreshKey]);

  const fetchComplaints = () => {
    setLoading(true);
    const params = {
      page,
      limit: 15,
    };
    if (statusFilter) params.status = statusFilter;
    if (appliedSearch) params.search = appliedSearch;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    complaintsAPI.getAll(params)
      .then((res) => {
        setComplaints(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil data pengaduan.');
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
    setRefreshKey((key) => key + 1);
  };

  const resetFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    setRefreshKey((key) => key + 1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { format: exportFormat };
      if (statusFilter) params.status = statusFilter;
      if (appliedSearch) params.search = appliedSearch;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (includeNotes) params.include_internal_notes = '1';
      if (exportFormat === 'pdf' && includeMessage) params.include_message = '1';

      const response = await complaintsAPI.exportData(params);
      const blob = response.data;
      const disposition = response.headers?.['content-disposition'] || '';
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
      const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
      const filename = filenameMatch?.[1]
        || `${exportFormat === 'xlsx' ? 'pengaduan' : 'laporan-pengaduan'}-plhut-${stamp}.${exportFormat}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(`File ${exportFormat.toUpperCase()} berhasil diunduh.`);
      setExportOpen(false);
    } catch (err) {
      let message = 'Gagal membuat file ekspor pengaduan.';
      const data = err.response?.data;
      if (data instanceof Blob) {
        try {
          const parsed = JSON.parse(await data.text());
          message = parsed.error || parsed.errors?.[0]?.msg || message;
        } catch {
          // Biarkan pesan default bila body bukan JSON.
        }
      } else if (data?.error) {
        message = data.error;
      }
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await complaintsAPI.getById(id);
      setSelectedItem(res.data);
      setStatusUpdate(res.data.status);
      setInternalNotes(res.data.internal_notes || '');
      setModalOpen(true);
    } catch (err) {
      toast.error('Gagal memuat rincian laporan.');
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setUpdating(true);
    try {
      await complaintsAPI.updateStatus(selectedItem.id, {
        status: statusUpdate,
        internal_notes: internalNotes,
      });
      toast.success('Status pengaduan berhasil diperbarui.');
      setModalOpen(false);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      toast.error('Gagal memperbarui status pengaduan.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-black">Pusat Pengaduan & Pertanyaan Masyarakat</h1>
        <p className="text-xs text-gray-500">Tindak lanjuti aspirasi dan pengaduan layanan secara terpadu</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Cari nomor ref, nama, atau subjek..."
                className="input-field pl-9 pr-4 py-2 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                className="input-field py-2 text-xs w-full sm:w-44"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">Semua Status Laporan</option>
                <option value="baru">Baru</option>
                <option value="diproses">Dalam Proses</option>
                <option value="menunggu_informasi">Menunggu Informasi</option>
                <option value="selesai">Selesai Ditindaklanjuti</option>
                <option value="ditolak">Ditolak</option>
              </select>

              <button type="submit" className="btn-primary py-2 px-3 text-xs">
                Cari / Filter
              </button>

              <button
                type="button"
                onClick={() => setExportOpen(true)}
                disabled={loading || total === 0}
                className="btn-secondary py-2 px-3 text-xs inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={14} /> Ekspor
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-3 border-t border-gray-100 pt-3">
            <div className="w-full sm:w-44">
              <label htmlFor="complaint-date-from" className="input-label">Dari Tanggal</label>
              <input
                id="complaint-date-from"
                type="date"
                className="input-field py-2 text-xs"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              />
            </div>
            <div className="w-full sm:w-44">
              <label htmlFor="complaint-date-to" className="input-label">Sampai Tanggal</label>
              <input
                id="complaint-date-to"
                type="date"
                className="input-field py-2 text-xs"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
              <button
                type="button"
                onClick={resetFilters}
                className="btn-secondary py-2 px-3 text-xs inline-flex items-center gap-1.5"
              >
                <RotateCcw size={13} /> Reset
              </button>
              <span className="text-[11px] font-medium text-gray-500">
                {loading ? 'Menghitung...' : `${total} laporan sesuai filter`}
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Table Data */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat daftar pengaduan..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Tidak ada laporan pengaduan"
            description="Laporan yang dikirimkan masyarakat akan muncul di halaman ini."
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No. Referensi</th>
                  <th>Tanggal Masuk</th>
                  <th>Pelapor & Kontak</th>
                  <th>Kategori</th>
                  <th>Subjek Laporan</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="font-mono font-bold text-xs text-black">{item.reference_number}</span>
                    </td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td>
                      <strong className="block text-black font-semibold text-xs">{item.reporter_name}</strong>
                      <span className="text-[11px] text-gray-500">{item.contact}</span>
                    </td>
                    <td>
                      <span className="badge badge-gold text-[10px]">{item.category}</span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-800 line-clamp-1 font-medium">{item.subject}</span>
                    </td>
                    <td>
                      <span className={`badge ${complaintStatusClass[item.status]} text-[11px]`}>
                        {complaintStatusLabel[item.status]}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => openDetail(item.id)}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 inline-flex"
                      >
                        <Eye size={13} /> Tindak Lanjut
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* Modal Detail & Tindak Lanjut */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Rincian & Tindak Lanjut Pengaduan"
        size="lg"
      >
        {selectedItem && (
          <form onSubmit={handleStatusSubmit} className="space-y-5">
            {/* Header Laporan */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-gray-500 block">Nomor Referensi:</span>
                <strong className="font-mono text-sm text-black">{selectedItem.reference_number}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Waktu Masuk:</span>
                <span className="font-medium text-black">{formatDateTime(selectedItem.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Kategori:</span>
                <span className="badge badge-gold">{selectedItem.category}</span>
              </div>
            </div>

            {/* Identitas Pelapor (Rahasia) */}
            <div className="p-4 rounded-xl bg-yellow-50/60 border border-yellow-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-yellow-900 mb-2">
                <ShieldCheck size={16} /> Identitas Pelapor (Data Terlindungi)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                <div><strong>Nama:</strong> {selectedItem.reporter_name}</div>
                <div><strong>Kontak:</strong> {selectedItem.contact}</div>
              </div>
            </div>

            {/* Isi Pesan */}
            <div>
              <label className="text-xs font-bold text-black uppercase tracking-wider block mb-1">
                Subjek Laporan:
              </label>
              <p className="text-sm font-semibold text-black mb-3">{selectedItem.subject}</p>

              <label className="text-xs font-bold text-black uppercase tracking-wider block mb-1">
                Isi Lengkap Pesan / Aduan:
              </label>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs md:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedItem.message}
              </div>
            </div>

            {/* Form Perubahan Status & Catatan Petugas */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h4 className="font-bold text-xs uppercase text-black">Formulir Tindak Lanjut Petugas:</h4>

              <div>
                <label className="input-label">Perbarui Status Laporan *</label>
                <select
                  className="input-field text-xs"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <option value="baru">Baru</option>
                  <option value="diproses">Dalam Proses Penanganan</option>
                  <option value="menunggu_informasi">Menunggu Informasi Tambahan</option>
                  <option value="selesai">Selesai (Sudah Ditindaklanjuti)</option>
                  <option value="ditolak">Ditolak / Tidak Memenuhi Syarat</option>
                </select>
              </div>

              <div>
                <label className="input-label">Catatan Internal Petugas (Hanya untuk Tim PLHUT)</label>
                <textarea
                  rows={3}
                  className="input-field text-xs font-sans"
                  placeholder="Contoh: Sudah dikonfirmasi melalui telepon, berkas pelimpahan telah diproses..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={updating}
                className="btn-primary text-xs py-2 px-5"
              >
                {updating ? 'Menyimpan...' : 'Perbarui Status & Simpan Catatan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Export */}
      <Modal
        isOpen={exportOpen}
        onClose={() => { if (!exporting) setExportOpen(false); }}
        title="Ekspor Data Pengaduan"
        size="lg"
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs">
            <p className="font-semibold text-black">{total} pengaduan akan diekspor</p>
            <p className="text-gray-500 mt-1">
              Data mengikuti status, pencarian, dan rentang tanggal yang sedang aktif.
            </p>
          </div>

          <div>
            <p className="input-label">Format File</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                exportFormat === 'xlsx' ? 'border-yellow-500 bg-yellow-50/60' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <span className="flex items-center gap-2 text-sm font-semibold text-black">
                  <input
                    type="radio"
                    name="export-format"
                    value="xlsx"
                    checked={exportFormat === 'xlsx'}
                    onChange={() => setExportFormat('xlsx')}
                    className="accent-amber-600"
                  />
                  <FileSpreadsheet size={18} /> Excel (.xlsx)
                </span>
                <span className="block mt-2 text-[11px] text-gray-500">
                  Arsip lengkap: seluruh kolom pengaduan, isi pesan, dan rekap status.
                </span>
              </label>

              <label className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                exportFormat === 'pdf' ? 'border-yellow-500 bg-yellow-50/60' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <span className="flex items-center gap-2 text-sm font-semibold text-black">
                  <input
                    type="radio"
                    name="export-format"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={() => {
                      setExportFormat('pdf');
                      if (includeNotes) setIncludeMessage(true);
                    }}
                    className="accent-amber-600"
                  />
                  <FileText size={18} /> PDF (.pdf)
                </span>
                <span className="block mt-2 text-[11px] text-gray-500">
                  Laporan rekap siap cetak dengan kop instansi dan nomor halaman.
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-stone-200 p-4">
            <label className="flex items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => {
                  setIncludeNotes(e.target.checked);
                  if (e.target.checked && exportFormat === 'pdf') setIncludeMessage(true);
                }}
                className="mt-0.5 accent-amber-600"
              />
              <span>
                <strong className="text-black">Sertakan catatan internal petugas</strong>
                <span className="block text-[11px] text-gray-500 mt-0.5">
                  Data sensitif; hanya untuk kepentingan tim internal PLHUT.
                </span>
              </span>
            </label>

            {exportFormat === 'pdf' && (
              <label className="flex items-start gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={includeMessage}
                  onChange={(e) => {
                    setIncludeMessage(e.target.checked);
                    if (!e.target.checked && exportFormat === 'pdf') setIncludeNotes(false);
                  }}
                  className="mt-0.5 accent-amber-600"
                />
                <span>
                  <strong className="text-black">Sertakan lampiran isi pesan lengkap</strong>
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    Menambah halaman lampiran berisi isi pengaduan.
                  </span>
                </span>
              </label>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] leading-relaxed text-amber-900">
            File ekspor memuat data pribadi pelapor. Simpan dan bagikan hanya untuk
            kepentingan pelayanan. Setiap aktivitas ekspor dicatat di log sistem.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setExportOpen(false)}
              disabled={exporting}
              className="btn-secondary text-xs py-2 px-4"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || total === 0}
              className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              {exporting ? 'Menyiapkan...' : `Unduh ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
