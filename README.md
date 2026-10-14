# PUSAT LAYANAN HAJI DAN UMRAH TERPADU (PLHUT) KABUPATEN MAGETAN
## Website Profil Resmi dan Dashboard Pelayanan Digital

Website resmi profil instansi, pusat informasi, dan dashboard pelayanan digital **Pusat Layanan Haji dan Umrah Terpadu (PLHUT) Kantor Kementerian Agama Kabupaten Magetan**.

---

## 1. Identitas & Konsep Desain
- **Konsep:** Modern Government Service Dashboard & Islamic Institutional Portal
- **Palet Warna Utama:**
  - Emas (`#D4AF37`): Aksen utama, ikon aktif, garis pemisah, tombol primer.
  - Kuning (`#F5C542`): Highlight, badge informasi, elemen interaktif.
  - Putih (`#FFFFFF`): Kartu konten, latar formulir, ruang visual bersih.
  - Hitam (`#171717`): Header, sidebar admin, footer, teks primer.
  - Latar Halaman: `#F8F7F2`
- **Tipografi:** Poppins & Inter
- **Ikon:** Lucide React

---

## 2. Struktur Navigasi & Halaman

### Halaman Publik (Tanpa Autentikasi)
1. **Beranda (`/`):**
   - Hero banner dengan identitas resmi instansi dan tombol navigasi utama.
   - Kartu ringkasan layanan (Haji, Umrah, Manasik, Pengaduan).
   - Sambutan resmi pimpinan kantor dengan identitas terverifikasi.
   - Berita dan pengumuman terbaru terintegrasi database.
   - Agenda kegiatan manasik terdekat.
   - Tanya jawab umum (FAQ) interaktif dalam bentuk accordion.
   - Footer informatif dengan alamat, jam layanan, dan tautan resmi.

2. **Profil Instansi (`/profil`):**
   - Sejarah singkat dan gambaran umum berdirinya PLHUT Magetan.
   - Visi dan Misi penyelenggaraan pelayanan ibadah haji.
   - Tugas dan fungsi pelayanan satu atap (One Stop Service).
   - Struktur penanggung jawab dan unit layanan aktif.
   - Jam operasional dan kontak verifikasi kantor.

3. **Layanan Haji (`/layanan-haji`):**
   - Informasi terpadu pendaftaran porsi haji reguler.
   - Persyaratan dokumen dan alur biometrik foto/sidik jari di lokasi.
   - Integrasi tautan pengecekan nomor porsi dan estimasi keberangkatan resmi Kementerian Agama RI.
   - FAQ seputar biaya setoran awal dan pembatalan/pelimpahan porsi.

4. **Layanan Umrah (`/layanan-umrah`):**
   - Edukasi masyarakat mengenai **Gerakan 5 Pasti Umrah** (Pasti Travelnya, Pasti Jadwalnya, Pasti Terbangnya, Pasti Hotelnya, Pasti Visanya).
   - Panduan kelengkapan dokumen paspor dan vaksinasi meningitis.
   - Tautan langsung ke portal **SIMPU / Siskopatuh Kemenag RI** untuk verifikasi legalitas izin PPIU.
   - Penjelasan resmi bahwa website ini bukan biro perjalanan melainkan instansi pengawas.

5. **Informasi Manasik (`/manasik`):**
   - Jadwal bimbingan manasik reguler tingkat kabupaten dan kecamatan.
   - Filter agenda: *Semua*, *Akan Datang*, *Sedang Berlangsung*, *Selesai*.
   - Rincian waktu, lokasi kegiatan, pamflet acara, dan petunjuk peserta.

6. **Berita dan Pengumuman (`/berita` & `/berita/:slug`):**
   - Daftar artikel kegiatan instansi dan edukasi masyarakat.
   - Fitur pencarian judul berita dan filter berdasarkan kategori.
   - Tab pengumuman resmi dan maklumat penting.
   - Halaman detail berita lengkap dengan gambar, tanggal, dan tombol bagikan.

7. **Pusat Informasi dan Pengaduan (`/pengaduan`):**
   - Formulir pengaduan masyarakat dengan validasi ketat dan persetujuan data.
   - Penerbitan **Nomor Referensi Unik (contoh: `PKD-...`)** otomatis sebagai bukti tindak lanjut.
   - Keamanan privasi: Nama dan kontak pelapor hanya dapat diakses internal petugas.
   - FAQ dan informasi jam operasional tatap muka.

8. **Kontak dan Lokasi (`/kontak`):**
   - Alamat kantor, nomor WhatsApp pelayanan, email resmi, dan jam kerja.
   - Integrasi peta Google Maps interaktif dan navigasi rute.

---

### Dashboard Administrator (Terproteksi Autentikasi)
Akses melalui `/admin/login`:
- **Akun Default Demo:**
  - Email: `admin@plhut-magetan.go.id`
  - Password: `Admin@PLHUT2025`

**Fitur Dashboard:**
1. **Ringkasan Statistik Aktual (`/admin`):**
   - Metrik real-time dari database: Total berita publikasi, pengumuman aktif, agenda mendatang, dan jumlah pengaduan masuk.
   - Grafik Recharts: Publikasi berita 6 bulan terakhir dan distribusi status pengaduan.
   - Daftar pintasan aktivitas dan pengaduan terbaru.
2. **Manajemen Berita (`/admin/berita`):** Tambah, edit, hapus, unggah gambar thumbnail, atur kategori, status draft/published.
3. **Manajemen Pengumuman (`/admin/pengumuman`):** Kelola tanggal mulai/selesai tayang, tingkat prioritas, dan opsi tampil di beranda.
4. **Manajemen Agenda Manasik (`/admin/agenda`):** Atur nama kegiatan, tanggal, waktu mulai/selesai, lokasi, dan status kegiatan.
5. **Manajemen Informasi Layanan (`/admin/layanan`):** Kelola rincian persyaratan dan prosedur layanan publik.
6. **Manajemen FAQ (`/admin/faq`):** Tambah dan perbarui tanya jawab masyarakat.
7. **Pengaduan Masyarakat (`/admin/pengaduan`):**
   - Periksa rincian laporan dan nomor referensi.
   - Perbarui status: *Baru*, *Dalam Proses*, *Menunggu Informasi*, *Selesai*, *Ditolak*.
   - Input catatan internal penanganan petugas.
8. **Riwayat Aktivitas (`/admin/aktivitas`):** Audit trail pencatatan setiap penambahan/pengubahan data.
9. **Manajemen Pengguna (`/admin/pengguna`):** Tambah akun petugas baru, atur role (Administrator / Editor), dan reset kata sandi.
10. **Pengaturan Website (`/admin/pengaturan`):** Ubah nama instansi, nomor kontak, alamat, sambutan pimpinan, dan tautan media sosial secara instan.

---

## 3. Stack Teknologi & Arsitektur
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Routing:** React Router DOM v6
- **Animasi & Notifikasi:** Framer Motion + React Hot Toast
- **Chart / Visualisasi:** Recharts
- **Backend:** Node.js + Express.js (ES Module)
- **Database:** SQLite3 terstruktur via package `sqlite` (file database otomatis diinisialisasi di `database/plhut.db`)
- **Autentikasi & Keamanan:**
  - JSON Web Tokens (JWT) dengan durasi kedaluwarsa 8 jam
  - Enkripsi kata sandi menggunakan `bcryptjs` (salt round 12)
  - HTTP Security Headers dengan `helmet`
  - Pembatasan laju permintaan (*Rate Limiting*) pada login dan formulir publik
  - Validasi ketat payload menggunakan `express-validator`
  - Sanitasi file upload menggunakan `multer` dengan penamaan acak unik

---

## 4. Panduan Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js versi 18 ke atas
- NPM terpasang

### Langkah Instalasi
1. Buka terminal pada folder proyek:
   ```bash
   cd "d:\MAGANG\KEMENHAJ\KEMENHAJ MAGETAN"
   ```

2. Pasang seluruh dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi file environment:
   Salin `.env.example` menjadi `.env` (sudah disediakan default):
   ```env
   PORT=3000
   JWT_SECRET=plhut_magetan_secure_jwt_token_secret_key_2025_kemenag
   NODE_ENV=development
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

4. Jalankan aplikasi dalam mode pengembangan:
   - **Mode Fullstack Sekaligus (Vite Dev Server dengan Proxy API):**
     Jalankan backend:
     ```bash
     npm run server
     ```
     Buka terminal kedua dan jalankan frontend:
     ```bash
     npm run dev
     ```
     Akses melalui browser di: `http://localhost:5173`

5. **Mode Produksi (Build & Single Server):**
   ```bash
   npm run build
   npm start
   ```
   Akses melalui browser di: `http://localhost:3000`

---

## 5. Konfigurasi Database & Seed Data
Database SQLite akan dibuat otomatis di `database/plhut.db` saat backend pertama kali dijalankan.
Inisialisasi tabel meliputi:
- `users`
- `news`
- `announcements`
- `agendas`
- `services`
- `faqs`
- `complaints`
- `activity_logs`
- `site_settings`

Setiap data demonstrasi awal telah diberi label `[DEMO]` yang jelas dan dapat diganti atau dihapus kapan saja melalui panel admin.

---

## 6. Hak Akses & Keamanan
1. **Administrator:** Memiliki akses penuh termasuk pengelolaan pengguna (`/admin/pengguna`), pengaturan instansi (`/admin/pengaturan`), dan audit aktivitas (`/admin/aktivitas`).
2. **Editor:** Petugas operasional untuk memperbarui berita, pengumuman, agenda manasik, dan menindaklanjuti pengaduan masyarakat.
