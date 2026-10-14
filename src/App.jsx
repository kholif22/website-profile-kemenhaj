import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SiteSettingsProvider } from './hooks/useSiteSettings';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProfilePage from './pages/public/ProfilePage';
import HajjPage from './pages/public/HajjPage';
import UmrahPage from './pages/public/UmrahPage';
import ManasikPage from './pages/public/ManasikPage';
import NewsPage from './pages/public/NewsPage';
import NewsDetailPage from './pages/public/NewsDetailPage';
import ComplaintPage from './pages/public/ComplaintPage';
import ContactPage from './pages/public/ContactPage';

// Auth & Admin Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import NewsManagePage from './pages/admin/NewsManagePage';
import AnnouncementPage from './pages/admin/AnnouncementPage';
import AgendaPage from './pages/admin/AgendaPage';
import ServicePage from './pages/admin/ServicePage';
import FAQManagePage from './pages/admin/FAQManagePage';
import ComplaintManagePage from './pages/admin/ComplaintManagePage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import UserManagePage from './pages/admin/UserManagePage';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';
import ProfileManagePage from './pages/admin/ProfileManagePage';

// Protected Route Component
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Memeriksa hak akses administrator...</span>
        </div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// 404 Not Found Component
function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-black font-black text-2xl" style={{ background: 'var(--color-gold)' }}>
        404
      </div>
      <h1 className="text-2xl font-bold text-black mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-xs md:text-sm text-gray-500 max-w-md mb-6">
        Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau alamat URL yang Anda masukkan keliru.
      </p>
      <a href="/" className="btn-primary text-xs py-2.5 px-6">
        Kembali ke Beranda
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1c1917',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '12px',
                border: '1px solid #44403c',
              },
              success: {
                iconTheme: { primary: '#D4AF37', secondary: '#000' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* Public Layout and Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="profil" element={<ProfilePage />} />
              <Route path="layanan-haji" element={<HajjPage />} />
              <Route path="layanan-umrah" element={<UmrahPage />} />
              <Route path="manasik" element={<ManasikPage />} />
              <Route path="berita" element={<NewsPage />} />
              <Route path="berita/:slug" element={<NewsDetailPage />} />
              <Route path="pengaduan" element={<ComplaintPage />} />
              <Route path="kontak" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected Admin Dashboard Layout and Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="profil" element={<ProfileManagePage />} />
              <Route path="berita" element={<NewsManagePage />} />
              <Route path="pengumuman" element={<AnnouncementPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="layanan" element={<ServicePage />} />
              <Route path="faq" element={<FAQManagePage />} />
              <Route path="pengaduan" element={<ComplaintManagePage />} />
              <Route path="aktivitas" element={<ActivityLogPage />} />
              <Route path="pengguna" element={<UserManagePage />} />
              <Route path="pengaturan" element={<SiteSettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}
