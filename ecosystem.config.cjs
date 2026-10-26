/**
 * Konfigurasi PM2 untuk produksi.
 *
 * Catatan: jalankan SATU instance (fork) karena aplikasi memakai SQLite dan
 * rate limiter in-memory. Untuk multi-instance, pindahkan rate limiter ke Redis
 * dan database ke server terpusat terlebih dahulu.
 */
module.exports = {
  apps: [
    {
      name: 'plhut-magetan',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      time: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
