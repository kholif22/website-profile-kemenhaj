import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Jika sebuah chunk (halaman yang di-lazy-load) gagal diunduh -- biasanya karena
// deploy/rebuild baru telah mengganti berkas ber-hash sementara tab ini masih
// terbuka -- muat ulang halaman sekali agar tab kembali sinkron dengan versi server.
// Tanpa ini, dynamic import yang gagal membuat aplikasi berhenti (layar putih).
window.addEventListener('vite:preloadError', () => {
  const KEY = 'plhut:chunkReloadAt';
  const last = Number(sessionStorage.getItem(KEY) || 0);
  if (Date.now() - last > 10000) {
    sessionStorage.setItem(KEY, String(Date.now()));
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
