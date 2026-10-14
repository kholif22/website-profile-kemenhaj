import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner, Badge } from '../../components/ui/index';
import { formatDate, formatDateTime, complaintStatusLabel, complaintStatusClass, agendaStatusLabel, agendaStatusClass } from '../../utils/helpers';
import {
  Newspaper, Megaphone, CalendarDays, MessageSquare,
  Activity, ArrowUpRight, PlusCircle, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  baru: '#3b82f6',
  diproses: '#eab308',
  menunggu_informasi: '#f97316',
  selesai: '#22c55e',
  ditolak: '#ef4444'
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard Administrator - PLHUT Magetan';
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    statsAPI.get()
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return <LoadingSpinner text="Memuat data statistik aktual..." />;
  }

  const statCards = [
    { title: 'Berita Publikasi', value: stats?.newsCount ?? 0, icon: Newspaper, link: '/admin/berita', color: '#D4AF37' },
    { title: 'Pengumuman Aktif', value: stats?.announcementCount ?? 0, icon: Megaphone, link: '/admin/pengumuman', color: '#B88A24' },
    { title: 'Agenda Mendatang', value: stats?.agendaCount ?? 0, icon: CalendarDays, link: '/admin/agenda', color: '#F5C542' },
    { title: 'Pengaduan Masuk', value: stats?.complaintTotal ?? 0, icon: MessageSquare, link: '/admin/pengaduan', color: '#3b82f6' },
    { title: 'Pengaduan Belum Tuntas', value: stats?.complaintPending ?? 0, icon: Clock, link: '/admin/pengaduan', color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Action Buttons */}
      <div className="card p-6 md:p-8 bg-stone-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-yellow-500 font-semibold">Selamat Datang</span>
          <h1 className="text-xl md:text-2xl font-bold mt-1 text-white">{user?.name}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Ringkasan data aktual sistem Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/berita" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <PlusCircle size={15} /> Tulis Berita
          </Link>
          <Link to="/admin/agenda" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <PlusCircle size={15} /> Tambah Agenda
          </Link>
          <Link to="/admin/pengumuman" className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <PlusCircle size={15} /> Pengumuman
          </Link>
        </div>
      </div>

      {/* Actual Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="card p-5 hover:-translate-y-1 transition-transform group flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black" style={{ background: `${card.color}22`, color: card.color }}>
                  <Icon size={20} />
                </div>
                <ArrowUpRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">{card.title}</span>
                <span className="text-2xl font-bold text-black">{card.value}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News Publication Chart */}
        <div className="lg:col-span-7 card p-6">
          <h2 className="font-bold text-base text-black mb-1">Publikasi Berita (6 Bulan Terakhir)</h2>
          <p className="text-xs text-gray-500 mb-6">Jumlah artikel berita yang diterbitkan per bulan</p>
          <div className="h-64 w-full">
            {stats?.monthlyNews && stats.monthlyNews.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyNews}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} name="Berita" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Belum ada data publikasi bulanan.
              </div>
            )}
          </div>
        </div>

        {/* Complaints by Status Chart */}
        <div className="lg:col-span-5 card p-6">
          <h2 className="font-bold text-base text-black mb-1">Status Pengaduan Masyarakat</h2>
          <p className="text-xs text-gray-500 mb-6">Distribusi status tindak lanjut pengaduan</p>
          <div className="h-64 w-full flex items-center justify-center">
            {stats?.complaintByStatus && stats.complaintByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.complaintByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${complaintStatusLabel[entry.status] || entry.status}: ${entry.count}`}
                  >
                    {stats.complaintByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, complaintStatusLabel[name] || name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-400">
                Belum ada pengaduan tercatat.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recents Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pengaduan Terbaru */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-black flex items-center gap-2">
              <MessageSquare size={16} className="text-yellow-600" /> Pengaduan Terbaru Masuk
            </h3>
            <Link to="/admin/pengaduan" className="text-xs font-semibold text-yellow-700 hover:underline">
              Semua →
            </Link>
          </div>

          {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
            <div className="space-y-3">
              {stats.recentComplaints.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-semibold text-black">{c.reference_number}</span>
                      <span className={`badge ${complaintStatusClass[c.status]} text-[10px]`}>
                        {complaintStatusLabel[c.status]}
                      </span>
                    </div>
                    <p className="text-gray-700 truncate max-w-xs">{c.subject}</p>
                    <span className="text-[10px] text-gray-400">{c.reporter_name} • {formatDate(c.created_at)}</span>
                  </div>
                  <Link to="/admin/pengaduan" className="btn-primary text-[10px] py-1 px-2.5">
                    Tindak Lanjut
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">Belum ada pengaduan masuk.</p>
          )}
        </div>

        {/* Agenda Terdekat & Aktivitas */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="font-bold text-sm text-black flex items-center gap-2">
              <CalendarDays size={16} className="text-yellow-600" /> Agenda Manasik Terdekat
            </h3>
            <Link to="/admin/agenda" className="text-xs font-semibold text-yellow-700 hover:underline">
              Semua →
            </Link>
          </div>

          {stats?.upcomingAgendas && stats.upcomingAgendas.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingAgendas.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="block text-black font-semibold">{a.title}</strong>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      📅 {formatDate(a.event_date)} {a.start_time ? `• ⏰ ${a.start_time} WIB` : ''}
                    </div>
                    {a.location && <span className="text-[11px] text-gray-400">📍 {a.location}</span>}
                  </div>
                  <span className={`badge ${agendaStatusClass[a.status]} text-[10px]`}>
                    {agendaStatusLabel[a.status]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">Belum ada agenda mendatang.</p>
          )}
        </div>
      </div>

      {/* Activity Logs Strip */}
      <div className="card p-6">
        <h3 className="font-bold text-sm text-black mb-4 flex items-center gap-2">
          <Activity size={16} className="text-yellow-600" /> Riwayat Aktivitas Petugas Terbaru
        </h3>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100 text-xs">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-black">{log.user_name || 'Petugas'}</span>
                  <span className="text-gray-600 ml-2">{log.action}</span>
                </div>
                <span className="text-[11px] text-gray-400">{formatDateTime(log.created_at)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-2">Belum ada riwayat aktivitas tercatat.</p>
        )}
      </div>
    </div>
  );
}
