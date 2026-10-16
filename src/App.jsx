import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts (needed on every page → keep eager)
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SiteSettingsProvider } from './hooks/useSiteSettings';

// Fallback UI used by route-level Suspense boundaries
import PageFallback from './components/PageFallback';

// Layouts & pages are code-split per route so the initial bundle stays small.
const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));

// Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ProfilePage = lazy(() => import('./pages/public/ProfilePage'));
const HajjPage = lazy(() => import('./pages/public/HajjPage'));
const UmrahPage = lazy(() => import('./pages/public/UmrahPage'));
const ManasikPage = lazy(() => import('./pages/public/ManasikPage'));
const NewsPage = lazy(() => import('./pages/public/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/public/NewsDetailPage'));
const ComplaintPage = lazy(() => import('./pages/public/ComplaintPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

// Auth & Admin Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const NewsManagePage = lazy(() => import('./pages/admin/NewsManagePage'));
const AnnouncementPage = lazy(() => import('./pages/admin/AnnouncementPage'));
const AgendaPage = lazy(() => import('./pages/admin/AgendaPage'));
const ServicePage = lazy(() => import('./pages/admin/ServicePage'));
const FAQManagePage = lazy(() => import('./pages/admin/FAQManagePage'));
const ComplaintManagePage = lazy(() => import('./pages/admin/ComplaintManagePage'));
const ActivityLogPage = lazy(() => import('./pages/admin/ActivityLogPage'));
const UserManagePage = lazy(() => import('./pages/admin/UserManagePage'));
const SiteSettingsPage = lazy(() => import('./pages/admin/SiteSettingsPage'));
const ProfileManagePage = lazy(() => import('./pages/admin/ProfileManagePage'));

// Protected Route Component
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Memeriksa hak akses administrator...</span>
        </div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// Admin-only route guard (role === 'admin')
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-xs text-gray-400">
        Memeriksa hak akses...
      </div>
    );
  }
  return user?.role === 'admin' ? children : <Navigate to="/admin" replace />;
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

          <Suspense fallback={<PageFallback />}>
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
                <Route path="profil" element={<RequireAdmin><ProfileManagePage /></RequireAdmin>} />
                <Route path="berita" element={<NewsManagePage />} />
                <Route path="pengumuman" element={<AnnouncementPage />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="layanan" element={<ServicePage />} />
                <Route path="faq" element={<FAQManagePage />} />
                <Route path="pengaduan" element={<ComplaintManagePage />} />
                <Route path="aktivitas" element={<ActivityLogPage />} />
                <Route path="pengguna" element={<RequireAdmin><UserManagePage /></RequireAdmin>} />
                <Route path="pengaturan" element={<RequireAdmin><SiteSettingsPage /></RequireAdmin>} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}
