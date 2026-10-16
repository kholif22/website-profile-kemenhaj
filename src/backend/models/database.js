import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../../database');
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

let db;

export async function getDatabase() {
  if (!db) {
    db = await open({ filename: path.join(dbDir, 'plhut.db'), driver: sqlite3.Database });
    await db.run('PRAGMA journal_mode = WAL');
    await db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  // Users table
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor' CHECK(role IN ('admin','editor')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migration: database lama belum punya kolom `username`
  const userColumns = await db.all(`PRAGMA table_info(users)`);
  if (!userColumns.some((c) => c.name === 'username')) {
    await db.run(`ALTER TABLE users ADD COLUMN username TEXT`);
    console.log('Migrasi: kolom `username` ditambahkan ke tabel users.');
  }
  await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)`);

  // News table
  await db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image TEXT,
    category TEXT NOT NULL DEFAULT 'Berita Instansi',
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
    published_at DATETIME,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_news_status ON news(status)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)`);

  // Announcements table
  await db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
    show_on_home INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Agendas table
  await db.run(`CREATE TABLE IF NOT EXISTS agendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming','ongoing','completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_agendas_date ON agendas(event_date)`);

  // Services table
  await db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('haji','umrah','manasik','informasi')),
    description TEXT,
    requirements TEXT,
    procedure TEXT,
    official_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // FAQs table
  await db.run(`CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'umum',
    sort_order INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Complaints table
  await db.run(`CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_number TEXT UNIQUE NOT NULL,
    reporter_name TEXT NOT NULL,
    contact TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    data_consent INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'baru' CHECK(status IN ('baru','diproses','menunggu_informasi','selesai','ditolak')),
    internal_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)`);

  // Activity logs table
  await db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    entity_title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at)`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at)`);

  // Site settings table
  await db.run(`CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed default admin (credentials sourced from environment; no hardcoded password)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@plhut-magetan.go.id';
  const adminUsername = process.env.ADMIN_USERNAME || null;
  const adminExists = await db.get(`SELECT id FROM users WHERE email = ?`, [adminEmail]);
  if (!adminExists) {
    let adminPassword = process.env.ADMIN_PASSWORD;
    let generated = false;
    if (!adminPassword || adminPassword.length < 8) {
      if (adminPassword) {
        console.warn('ADMIN_PASSWORD terlalu pendek (minimal 8 karakter). Membuat sandi acak sementara.');
      }
      adminPassword = crypto.randomBytes(12).toString('base64url');
      generated = true;
    }
    const hash = await bcrypt.hash(adminPassword, 12);
    await db.run(`INSERT INTO users (name, username, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`,
      ['Administrator PLHUT', adminUsername, adminEmail, hash]);
    console.log(`Akun admin awal dibuat (email: ${adminEmail}${adminUsername ? `, username: ${adminUsername}` : ''}).`);
    if (generated) {
      console.warn('=== SANDI ADMIN AWAL (hanya ditampilkan sekali) ===');
      console.warn(`    ${adminPassword}`);
      console.warn('    Simpan segera dan WAJIB diganti setelah login pertama.');
      console.warn('    Atau set ADMIN_PASSWORD di .env sebelum menjalankan server.');
    }
  }

  // Seed default site settings
  const defaultSettings = [
    ['site_name', 'Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan'],
    ['site_short_name', 'PLHUT Magetan'],
    ['site_description', 'Pusat informasi resmi pelayanan haji dan umrah Kabupaten Magetan'],
    ['site_address', '[Alamat kantor akan diisi setelah verifikasi]'],
    ['site_phone', '[Nomor telepon akan diisi setelah verifikasi]'],
    ['site_email', '[Email resmi akan diisi setelah verifikasi]'],
    ['site_hours', 'Senin - Jumat: 08.00 - 16.00 WIB'],
    ['site_hero_title', 'Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan'],
    ['site_hero_subtitle', 'Melayani masyarakat Kabupaten Magetan dalam urusan ibadah haji dan umrah dengan profesional, transparan, dan amanah.'],
    ['site_welcome_name', '[Nama Pimpinan — akan diisi setelah verifikasi]'],
    ['site_welcome_title', '[Jabatan Pimpinan — akan diisi setelah verifikasi]'],
    ['site_welcome_text', 'Selamat datang di website resmi Pusat Layanan Haji dan Umrah Terpadu Kabupaten Magetan. Website ini hadir untuk memberikan kemudahan akses informasi pelayanan haji dan umrah bagi masyarakat Kabupaten Magetan.'],
    ['site_footer_text', '© 2025 PLHUT Kabupaten Magetan. Seluruh informasi bersifat resmi dan akurat.'],
    ['site_facebook', ''],
    ['site_instagram', ''],
    ['site_youtube', ''],
    ['site_twitter', ''],
  ];
  for (const [key, value] of defaultSettings) {
    await db.run(`INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)`, [key, value]);
  }

  // Seed demo news (labeled as demo)
  const demoNews = await db.get(`SELECT id FROM news LIMIT 1`);
  if (!demoNews) {
    const admin = await db.get(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    const adminId = admin?.id || 1;
    const demoArticles = [
      { title: '[DEMO] Sosialisasi Pelayanan Haji Tahun 2025', slug: 'demo-sosialisasi-haji-2025', excerpt: 'Konten demonstrasi. Kantor Kementerian Agama Kabupaten Magetan menggelar sosialisasi pelayanan haji untuk masyarakat.', content: '<p><em>Ini adalah konten demonstrasi. Harap ganti dengan berita resmi.</em></p><p>Kantor Kementerian Agama Kabupaten Magetan menggelar kegiatan sosialisasi pelayanan haji kepada masyarakat sebagai upaya meningkatkan pemahaman terkait prosedur dan persyaratan ibadah haji.</p>', category: 'Pelayanan Haji', status: 'published', published_at: new Date().toISOString() },
      { title: '[DEMO] Jadwal Manasik Haji Kabupaten Magetan', slug: 'demo-jadwal-manasik-haji', excerpt: 'Konten demonstrasi. Informasi jadwal manasik haji untuk jemaah Kabupaten Magetan.', content: '<p><em>Ini adalah konten demonstrasi. Harap ganti dengan informasi resmi.</em></p><p>Berikut adalah informasi jadwal pelaksanaan manasik haji untuk jemaah calon haji Kabupaten Magetan.</p>', category: 'Manasik', status: 'published', published_at: new Date().toISOString() },
      { title: '[DEMO] Panduan Pemilihan PPIU Berizin', slug: 'demo-panduan-ppiu-berizin', excerpt: 'Konten demonstrasi. Panduan bagi masyarakat dalam memilih Penyelenggara Perjalanan Ibadah Umrah yang memiliki izin resmi.', content: '<p><em>Ini adalah konten demonstrasi. Harap ganti dengan informasi resmi.</em></p><p>Masyarakat diimbau untuk selalu memilih PPIU yang telah memiliki izin resmi dari Kementerian Agama Republik Indonesia.</p>', category: 'Pelayanan Umrah', status: 'published', published_at: new Date().toISOString() },
    ];
    for (const article of demoArticles) {
      await db.run(`INSERT INTO news (title, slug, excerpt, content, category, status, published_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [article.title, article.slug, article.excerpt, article.content, article.category, article.status, article.published_at, adminId]);
    }
  }

  // Seed demo announcements
  const demoAnn = await db.get(`SELECT id FROM announcements LIMIT 1`);
  if (!demoAnn) {
    await db.run(`INSERT INTO announcements (title, content, priority, status, show_on_home) VALUES (?, ?, ?, ?, ?)`,
      ['[DEMO] Pengumuman Resmi', 'Ini adalah konten pengumuman demonstrasi. Harap ganti dengan pengumuman resmi instansi.', 1, 'active', 1]);
  }

  // Seed demo agendas
  const demoAgenda = await db.get(`SELECT id FROM agendas LIMIT 1`);
  if (!demoAgenda) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    await db.run(`INSERT INTO agendas (title, description, event_date, start_time, end_time, location, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['[DEMO] Manasik Haji Reguler', 'Agenda demonstrasi. Harap ganti dengan agenda resmi.', futureDate.toISOString().split('T')[0], '08:00', '12:00', '[Lokasi akan diisi]', 'upcoming']);
  }

  // Seed demo FAQs
  const demoFaq = await db.get(`SELECT id FROM faqs LIMIT 1`);
  if (!demoFaq) {
    const faqs = [
      ['Bagaimana cara mendaftar haji?', 'Pendaftaran haji dilakukan melalui Bank Penerima Setoran (BPS) BPIH yang ditunjuk oleh pemerintah. Calon jemaah haji harus memenuhi persyaratan yang ditetapkan dan membayar setoran awal BPIH.', 'haji'],
      ['Berapa lama estimasi tunggu haji?', 'Estimasi waktu tunggu haji berbeda-beda tergantung kuota dan jumlah pendaftar di setiap kabupaten/kota. Informasi lebih lanjut dapat dilihat melalui aplikasi atau website resmi Kemenag RI.', 'haji'],
      ['Apa persyaratan dokumen untuk umrah?', 'Persyaratan dokumen umrah meliputi paspor yang masih berlaku minimal 6 bulan, visa umrah, sertifikat vaksin meningitis, dan dokumen pendukung lainnya sesuai ketentuan yang berlaku.', 'umrah'],
      ['Bagaimana memilih PPIU yang terpercaya?', 'Pilih PPIU yang telah memiliki izin resmi dari Kementerian Agama RI. Legalitas PPIU dapat diperiksa melalui website resmi Kemenag RI atau Simpu Umrah.', 'umrah'],
      ['Apa itu manasik haji?', 'Manasik haji adalah pelatihan dan bimbingan tata cara pelaksanaan ibadah haji yang diberikan kepada calon jemaah haji sebelum keberangkatan ke Tanah Suci.', 'manasik'],
    ];
    for (const [question, answer, category] of faqs) {
      await db.run(`INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)`, [question, answer, category]);
    }
  }

  // Seed demo services
  const demoService = await db.get(`SELECT id FROM services LIMIT 1`);
  if (!demoService) {
    const services = [
      {
        title: 'Pendaftaran dan Pembatalan Porsi Haji Reguler',
        category: 'haji',
        description: 'Pelayanan administrasi pendaftaran porsi haji baru dan pengajuan pembatalan atau pelimpahan porsi sesuai regulasi.',
        requirements: '1. KTP elektronik domisili Kabupaten Magetan\n2. Kartu Keluarga (KK)\n3. Akta Kelahiran / Buku Nikah / Ijazah\n4. Buku Tabungan Haji dari BPS BPIH yang ditunjuk\n5. Pasfoto berwarna latar belakang putih 3x4 dan 4x6',
        procedure: '1. Calon jemaah membuka rekening tabungan haji di BPS BPIH dan menyetor setoran awal BPIH.\n2. Calon jemaah mendatangi kantor PLHUT Magetan dengan membawa berkas lengkap.\n3. Petugas melakukan verifikasi berkas, pemindaian biometrik, dan penginputan data.\n4. Calon jemaah menerima Surat Pendaftaran Pergi Haji (SPPH) dan nomor porsi resmi.',
        official_url: 'https://haji.kemenag.go.id',
        status: 'active'
      },
      {
        title: 'Konsultasi dan Pembinaan Manasik Haji',
        category: 'haji',
        description: 'Bimbingan berkala dan konsultasi tata cara pelaksanaan ibadah haji reguler tingkat kecamatan dan kabupaten.',
        requirements: '1. Terdaftar sebagai jemaah berhak berangkat tahun berjalan\n2. Membawa bukti SPPH atau bukti pelunasan',
        procedure: '1. Menerima undangan jadwal manasik dari KUA / PLHUT.\n2. Mengikuti sesi pembinaan di tingkat KUA kecamatan dan tingkat kabupaten.',
        official_url: 'https://haji.kemenag.go.id',
        status: 'active'
      },
      {
        title: 'Informasi dan Edukasi Penyelenggara Perjalanan Ibadah Umrah (PPIU)',
        category: 'umrah',
        description: 'Layanan konsultasi legalitas travel umrah berizin resmi Kemenag serta advokasi perlindungan jemaah umrah.',
        requirements: '1. Konsultasi langsung ke petugas PLHUT atau secara daring melalui sistem pengaduan/informasi.',
        procedure: '1. Cek legalitas izin PPIU melalui aplikasi Siskopatuh / portal resmi Kemenag.\n2. Pastikan program 5 Pasti Umrah terpenuhi (Pasti Travelnya, Pasti Jadwalnya, Pasti Terbangnya, Pasti Hotelnya, Pasti Visanya).',
        official_url: 'https://simpu.kemenag.go.id',
        status: 'active'
      }
    ];

    for (const s of services) {
      await db.run(
        `INSERT INTO services (title, category, description, requirements, procedure, official_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [s.title, s.category, s.description, s.requirements, s.procedure, s.official_url, s.status]
      );
    }
  }

  console.log('Database PLHUT Magetan berhasil diinisialisasi.');
}
