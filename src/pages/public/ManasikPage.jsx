import React, { useState, useEffect } from 'react';
import { agendasAPI } from '../../services/api';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { PageHeader, SectionHeader, LoadingSpinner, EmptyState, Modal, Badge } from '../../components/ui/index';
import { formatDate, agendaStatusLabel, agendaStatusClass } from '../../utils/helpers';
import { Calendar, Clock, MapPin, BookOpen, Search, Filter, Info } from 'lucide-react';

export default function ManasikPage() {
  const { settings } = useSiteSettings();
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAgenda, setSelectedAgenda] = useState(null);

  useEffect(() => {
    document.title = `Informasi Manasik - ${settings.site_short_name || 'PLHUT Magetan'}`;
    window.scrollTo(0, 0);

    fetchAgendas();
  }, [settings.site_short_name]);

  const fetchAgendas = (status = statusFilter) => {
    setLoading(true);
    const params = status === 'all' ? {} : { status };
    agendasAPI.getAll(params)
      .then((res) => setAgendas(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchAgendas(status);
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Informasi & Jadwal Manasik"
        subtitle="Jadwal pembinaan, simulasi, dan tata cara pelaksanaan ibadah haji Kabupaten Magetan"
        breadcrumbs={['Beranda', 'Layanan', 'Informasi Manasik']}
      />

      <div className="container mx-auto px-4 mt-12 max-w-5xl">
        {/* Info Box */}
        <div className="card p-6 md:p-8 mb-10 border-l-4" style={{ borderLeftColor: 'var(--color-gold)' }}>
          <h2 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
            <BookOpen size={20} className="text-yellow-600" /> Mengenai Manasik Haji
          </h2>
          <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
            Bimbingan manasik haji diselenggarakan secara bertahap baik di tingkat Kantor Urusan Agama (KUA) Kecamatan maupun di tingkat Kabupaten oleh Kantor Kementerian Agama Kabupaten Magetan. Calon jemaah diharapkan mengikuti seluruh sesi bimbingan agar memahami rukun, wajib, dan sunnah haji serta kesiapan fisik dan mental.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Filter size={18} className="text-yellow-600" /> Filter Status:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua Agenda' },
              { id: 'upcoming', label: 'Akan Datang' },
              { id: 'ongoing', label: 'Sedang Berlangsung' },
              { id: 'completed', label: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agendas List */}
        {loading ? (
          <LoadingSpinner text="Memuat jadwal manasik..." />
        ) : agendas.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Tidak ada agenda yang ditemukan"
            description="Belum ada jadwal manasik untuk filter yang dipilih."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agendas.map((item) => (
              <div key={item.id} className="card p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`badge ${agendaStatusClass[item.status]} text-xs`}>
                      {agendaStatusLabel[item.status]}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {formatDate(item.event_date)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-black mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 mb-4 text-xs text-gray-600">
                    {item.start_time && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-yellow-600" />
                        <span>{item.start_time}{item.end_time ? ` - ${item.end_time}` : ''} WIB</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-yellow-600" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-700 line-clamp-3 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedAgenda(item)}
                    className="text-xs font-semibold text-yellow-700 hover:underline"
                  >
                    Lihat Detail & Petunjuk →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={!!selectedAgenda}
          onClose={() => setSelectedAgenda(null)}
          title="Detail Kegiatan Manasik"
        >
          {selectedAgenda && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`badge ${agendaStatusClass[selectedAgenda.status]}`}>
                  {agendaStatusLabel[selectedAgenda.status]}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(selectedAgenda.event_date)}
                </span>
              </div>

              <h4 className="text-lg font-bold text-black">{selectedAgenda.title}</h4>

              {selectedAgenda.image && (
                <img
                  src={selectedAgenda.image}
                  alt={selectedAgenda.title}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-yellow-600" />
                  <strong>Waktu:</strong> {selectedAgenda.start_time || '-'}{selectedAgenda.end_time ? ` - ${selectedAgenda.end_time}` : ''} WIB
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-yellow-600" />
                  <strong>Lokasi:</strong> {selectedAgenda.location || 'Ditentukan kemudian'}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-xs text-black uppercase tracking-wider mb-1">
                  Deskripsi Kegiatan:
                </h5>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedAgenda.description || 'Tidak ada deskripsi rincian.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 text-right">
                <button
                  onClick={() => setSelectedAgenda(null)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
