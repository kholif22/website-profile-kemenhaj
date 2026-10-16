import React, { useState, Suspense } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageFallback from '../components/PageFallback';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Newspaper, Megaphone, CalendarDays, BookOpen,
  HelpCircle, MessageSquare, Users, Settings, Activity,
  LogOut, Menu, X, ChevronRight, Bell, User
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BookOpen, label: 'Profil Instansi', path: '/admin/profil', adminOnly: true },
  { icon: Newspaper, label: 'Manajemen Berita', path: '/admin/berita' },
  { icon: Megaphone, label: 'Pengumuman', path: '/admin/pengumuman' },
  { icon: CalendarDays, label: 'Agenda Manasik', path: '/admin/agenda' },
  { icon: BookOpen, label: 'Informasi Layanan', path: '/admin/layanan' },
  { icon: HelpCircle, label: 'Manajemen FAQ', path: '/admin/faq' },
  { icon: MessageSquare, label: 'Pengaduan', path: '/admin/pengaduan' },
  { icon: Activity, label: 'Riwayat Aktivitas', path: '/admin/aktivitas' },
  { icon: Users, label: 'Pengguna', path: '/admin/pengguna', adminOnly: true },
  { icon: Settings, label: 'Pengaturan Website', path: '/admin/pengaturan', adminOnly: true },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const visibleMenuItems = menuItems.filter((item) => !item.adminOnly || user?.role === 'admin');

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0" style={{ background: 'var(--color-gold)', color: 'var(--color-black)' }}>
            PL
          </div>
          {(sidebarOpen || mobileSidebar) && (
            <div>
              <div className="text-white font-bold text-sm leading-tight">PLHUT Admin</div>
              <div className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>Kab. Magetan</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleMenuItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/admin'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={() => setMobileSidebar(false)}
            title={!sidebarOpen && !mobileSidebar ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {(sidebarOpen || mobileSidebar) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {(sidebarOpen || mobileSidebar) && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm" style={{ background: 'rgba(212,175,55,0.2)', color: 'var(--color-gold)' }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs capitalize truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full"
          style={{ color: 'rgba(255,100,100,0.8)' }}
          title={!sidebarOpen && !mobileSidebar ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(sidebarOpen || mobileSidebar) && <span>Logout</span>}
        </button>
        <Link
          to="/"
          className="sidebar-link mt-1 text-xs"
          onClick={() => setMobileSidebar(false)}
          title={!sidebarOpen && !mobileSidebar ? 'Lihat Website' : undefined}
        >
          <ChevronRight size={16} className="flex-shrink-0" />
          {(sidebarOpen || mobileSidebar) && <span>Lihat Website Publik</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 transition-all duration-300"
        style={{
          width: sidebarOpen ? '240px' : '68px',
          background: 'var(--color-black)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebar(false)} />
          <aside className="relative z-50 flex flex-col h-full w-64" style={{ background: 'var(--color-black)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-14 shadow-sm" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3">
            {/* Desktop sidebar toggle */}
            <button
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileSidebar(true)}
              aria-label="Buka menu"
            >
              <Menu size={20} style={{ color: 'var(--color-text-secondary)' }} />
            </button>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Dashboard Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
              <User size={15} style={{ color: 'var(--color-gold)' }} />
              <span className="font-medium">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
