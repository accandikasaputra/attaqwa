# Setup untuk Windows

## Fix Error NODE_ENV di Windows

Package `cross-env` sudah terinstall, sekarang Anda perlu update script di `package.json`:

### Buka file `package.json` dan ubah bagian scripts:

**DARI:**
```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "start": "NODE_ENV=production node dist/index.js",
  ...
}
```

**MENJADI:**
```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts",
  "start": "cross-env NODE_ENV=production node dist/index.js",
  ...
}
```

Tambahkan `cross-env` di depan setiap command yang menggunakan `NODE_ENV`.

## Setup MySQL untuk Lokal

### 1. Buat Database MySQL

```sql
CREATE DATABASE masjid_attaqwa;
CREATE USER 'masjid_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON masjid_attaqwa.* TO 'masjid_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Update File `.env`

Buat file `.env` di root project dengan isi:

```env
# MySQL Connection
DATABASE_URL=mysql://masjid_user:password123@localhost:3306/masjid_attaqwa

# Session Secret (ganti dengan random string)
SESSION_SECRET=your-super-secret-key-here-change-this

# Environment
NODE_ENV=development
```

### 3. Update Drizzle Config

File `drizzle.config.ts` akan otomatis menggunakan DATABASE_URL dari `.env`

### 4. Jalankan Migration

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## Troubleshooting

### Jika masih error NODE_ENV:
- Pastikan sudah update `package.json` dengan `cross-env`
- Restart terminal/command prompt
- Jalankan `npm install` lagi jika perlu

### Jika error database connection:
- Pastikan MySQL service berjalan
- Check username, password, dan database name di `.env`
- Pastikan port MySQL (default 3306) tidak terblokir

### Jika port 5000 sudah digunakan:
Ubah port di `server/index.ts` atau set environment variable:
```bash
PORT=3000 npm run dev
```
