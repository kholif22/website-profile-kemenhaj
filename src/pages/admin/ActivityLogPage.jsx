import React, { useState, useEffect } from 'react';
import { activityAPI } from '../../services/api';
import { LoadingSpinner, EmptyState, Pagination, Badge } from '../../components/ui/index';
import { formatDateTime } from '../../utils/helpers';
import { Activity, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    document.title = 'Riwayat Aktivitas Petugas - PLHUT Admin';
    fetchLogs(page);
  }, [page]);

  const fetchLogs = (p = 1) => {
    setLoading(true);
    activityAPI.getAll({ page: p, limit: 20 })
      .then((res) => {
        setLogs(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Gagal mengambil riwayat aktivitas.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-black">Audit Trail & Riwayat Aktivitas</h1>
        <p className="text-xs text-gray-500">Log pencatatan tindakan dan perubahan data oleh administrator</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Memuat riwayat log..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Belum ada riwayat aktivitas"
            description="Setiap tindakan penambahan, pengubahan, atau penghapusan data akan tercatat di sini."
          />
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Waktu (WIB)</th>
                  <th>Petugas / User</th>
                  <th>Aktivitas yang Dilakukan</th>
                  <th>Tipe Entitas</th>
                  <th>Judul / Ref</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item) => (
                  <tr key={item.id}>
                    <td className="text-xs text-gray-600 whitespace-nowrap">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-yellow-600" />
                        <span className="font-semibold text-xs text-black">{item.user_name || 'Petugas'}</span>
                      </div>
                    </td>
                    <td className="text-xs text-gray-800 font-medium">
                      {item.action}
                    </td>
                    <td>
                      <span className="badge badge-gray text-[10px] uppercase">
                        {item.entity_type || '-'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500 max-w-xs truncate">
                      {item.entity_title || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
