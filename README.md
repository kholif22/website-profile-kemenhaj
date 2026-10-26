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
Akses melalui `/admin/login`. Akun administrator dibuat otomatis saat pertama kali server dijalankan. Kredensial awal **wajib diganti** sebelum digunakan. Untuk mengatur akun, atur variabel lingkungan berikut sebelum menjalankan server:

```env
ADMIN_EMAIL=admin@plhut-magetan.go.id
ADMIN_PASSWORD=<ganti-dengan-sandi-kuat-minimal-12-karakter>
```

> Catatan keamanan: jangan pernah menampilkan atau menyimpan kredensial admin di kode maupun dokumentasi.

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
   - Filter status, pencarian, dan rentang tanggal.
   - **Ekspor Excel (.xlsx)** sebagai arsip lengkap atau **PDF** sebagai laporan rekap siap cetak. Ekspor mengikuti filter aktif, dibatasi `EXPORT_MAX_ROWS` (default 5.000 baris), dan dicatat di activity log.
8. **Riwayat Aktivitas (`/admin/aktivitas`):** Audit trail pencatatan setiap penambahan/pengubahan data.
9. **Manajemen Pengguna (`/admin/pengguna`):** Tambah akun petugas baru, atur role (Administrator / Editor), dan reset kata sandi.
10. **Profil Instansi (`/admin/profil`):** Perbarui sejarah, visi, misi, tugas/fungsi, dan unit layanan; unggah foto kantor, foto pimpinan, serta kelola data pegawai/karyawan beserta fotonya.
11. **Pengaturan Website (`/admin/pengaturan`):** Ubah nama instansi, nomor kontak, alamat, sambutan pimpinan, dan tautan media sosial secara instan.
12. **Ganti Kata Sandi:** tombol di sidebar dashboard untuk mengganti sandi akun yang sedang login (`PUT /api/users/me/password`).

---

## 3. Stack Teknologi & Arsitektur
- **Frontend:** React 18 + Vite + Tailwind CSS 4 (plugin `@tailwindcss/postcss`)
- **Routing:** React Router DOM v7
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

> **Catatan Tailwind CSS 4:** konfigurasi tema masih memakai `tailwind.config.js`, dimuat melalui direktif `@config` di `src/index.css` sehingga warna, font, dan radius kustom tetap berlaku. Beberapa utility Tailwind 3 sudah berganti nama di versi 4 dan telah disesuaikan agar tampilan identik: `shadow-sm` → `shadow-xs`, `outline-none` → `outline-hidden`. Warna border bawaan (yang di v4 berubah menjadi `currentColor`) dikembalikan ke `gray-200` melalui aturan kompatibilitas di `@layer base`.

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
   JWT_SECRET=<ganti-dengan-string-acak-minimal-32-karakter>
   NODE_ENV=development
   SITE_URL=
   TRUST_PROXY=
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   EXPORT_MAX_ROWS=5000
   # Opsional: kredensial admin awal (dipakai hanya saat seed pertama kali)
   ADMIN_EMAIL=admin@plhut-magetan.go.id
   ADMIN_USERNAME=
   ADMIN_PASSWORD=<sandi-kuat-minimal-8-karakter>
   ```

   > Server akan **menolak start** bila `JWT_SECRET` kosong atau kurang dari 32 karakter.

4. Jalankan aplikasi dalam mode pengembangan:
   - **Satu perintah (backend + frontend sekaligus):**
     ```bash
     npm run dev
     ```
     Perintah ini menjalankan API Express di `http://localhost:3000` **dan** Vite di
     `http://localhost:5173` (proxy `/api` diarahkan otomatis ke port backend).
     Akses melalui browser di: `http://localhost:5173`

   - **Terpisah (dua terminal), bila diinginkan:**
     Terminal 1: `npm run dev:api` &nbsp;•&nbsp; Terminal 2: `npm run dev:web`

5. **Mode Produksi (Build & Single Server):**
   ```bash
   npm run build
   npm start
   ```
   Akses melalui browser di: `http://localhost:3000`

### Deployment Produksi (VPS + Nginx + PM2)

1. **Siapkan `.env` produksi** (jangan commit file ini):
   ```env
   NODE_ENV=production
   PORT=3000
   SITE_URL=https://plhutmagetan.go.id
   TRUST_PROXY=1
   JWT_SECRET=<string-acak-minimal-32-karakter>
   ADMIN_EMAIL=admin@plhut-magetan.go.id
   ADMIN_PASSWORD=<sandi-kuat>
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   BACKUP_KEEP=30
   EXPORT_MAX_ROWS=5000
   ```
   - `SITE_URL` dipakai untuk canonical, Open Graph, `robots.txt`, dan `sitemap.xml`.
   - `TRUST_PROXY=1` diperlukan bila berada di belakang **satu** Nginx/Cloudflare
     agar IP klien dan rate limit benar. Jangan memakai `true`.
   - Setelah mengubah kredensial admin, jalankan sekali: `npm run admin:setup`.

2. **Build dan jalankan dengan PM2:**
   ```bash
   npm ci
   npm run build
   npm install -g pm2
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```
   Gunakan **satu instance** karena aplikasi memakai SQLite dan rate limiter
   in-memory. Jangan memakai mode cluster sebelum memindahkan keduanya.

3. **Contoh konfigurasi Nginx** (HTTPS diatur dengan Certbot/Let's Encrypt):
   ```nginx
   server {
     listen 80;
     server_name plhutmagetan.go.id www.plhutmagetan.go.id;
     return 301 https://$host$request_uri;
   }

   server {
     listen 443 ssl http2;
     server_name plhutmagetan.go.id www.plhutmagetan.go.id;

     client_max_body_size 10m;

     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       # Beri waktu untuk ekspor Excel/PDF berukuran besar
       proxy_read_timeout 120s;
       proxy_send_timeout 120s;
     }
   }
   ```
   Port `3000` tidak perlu dibuka ke internet; hanya Nginx yang mengaksesnya.

4. **Backup database** (aman dilakukan saat server berjalan):
   ```bash
   npm run db:backup
   ```
   Simpan juga salinan ke storage eksternal. Contoh cron harian pukul 02.00:
   ```cron
   0 2 * * * cd /var/www/plhut-magetan && /usr/bin/node scripts/backup-db.mjs >> backups/backup.log 2>&1
   ```
   `BACKUP_KEEP` mengatur jumlah backup lokal yang disimpan (default 30).

5. **Verifikasi setelah deploy:**
   - `https://domain-anda/api/health` harus mengembalikan `{"status":"ok"}`.
   - `https://domain-anda/sitemap.xml` dan `/robots.txt` dapat diakses.
   - Folder `uploads/`, `database/`, dan `backups/` harus writable oleh user
     yang menjalankan PM2, tetapi tidak boleh disajikan sebagai file statis
     selain `uploads/`.

### Jika login admin gagal
1. **Pastikan backend benar-benar berjalan.** Membuka `http://localhost:5173` tanpa
   backend hanya menampilkan pesan "Tidak dapat terhubung ke server". Gunakan
   `npm run dev` (bukan `npm run dev:web` saja), lalu cek
   `http://localhost:3000/api/health` harus mengembalikan `{"status":"ok"}`.
2. **Kredensial awal hanya di-seed sekali.** Mengubah `ADMIN_EMAIL` /
   `ADMIN_USERNAME` / `ADMIN_PASSWORD` di `.env` **tidak** mengubah akun yang sudah
   ada di database. Untuk menyamakan akun admin dengan isi `.env`, jalankan:
   ```bash
   npm run admin:setup
   ```
   Server juga mencetak peringatan saat start bila `ADMIN_PASSWORD` di `.env`
   berbeda dengan sandi akun admin yang tersimpan.
3. **Perhatikan batas percobaan login.** Lebih dari 20 percobaan gagal dalam 15
   menit akan menghasilkan HTTP 429. Tunggu 15 menit atau restart server.
4. Bila perlu mengulang dari nol, hentikan server lalu hapus `database/plhut.db*`
   (data akan dibuat ulang saat server dijalankan).

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
