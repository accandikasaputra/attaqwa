# Konfigurasi Manual untuk Windows & MySQL

## 📝 File yang Perlu Anda Edit Manual

### 1. **package.json** - Fix Windows Compatibility

Buka file `package.json` dan ubah bagian `scripts`:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "cross-env NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

**Perubahan:** Tambahkan `cross-env` sebelum `NODE_ENV` di script `dev` dan `start`

---

### 2. **drizzle.config.ts** - Setup MySQL

Buka file `drizzle.config.ts` dan ubah `dialect`:

```typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",  // ← UBAH dari "postgresql" menjadi "mysql"
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

**Perubahan:** Ganti `dialect: "postgresql"` menjadi `dialect: "mysql"`

---

### 3. **server/db.ts** - Update Database Connection

Buka file `server/db.ts` dan ganti seluruh isinya dengan:

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Create MySQL connection pool
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(poolConnection, { schema, mode: 'default' });
```

**Perubahan:** Ganti dari PostgreSQL (Neon) ke MySQL2

---

### 4. **.env** - Environment Variables

Buat file `.env` di root project:

```env
# MySQL Database
DATABASE_URL=mysql://root:password@localhost:3306/masjid_attaqwa

# Session Secret (ganti dengan random string)
SESSION_SECRET=masjid-attaqwa-secret-2024-super-secure

# Environment
NODE_ENV=development

# Admin Default (untuk first time setup)
ADMIN_EMAIL=admin@masjidattaqwa.org
ADMIN_PASSWORD=admin123
```

**Sesuaikan:**
- Username MySQL Anda (default: `root`)
- Password MySQL Anda
- Nama database (contoh: `masjid_attaqwa`)
- Port MySQL (default: `3306`)

---

## 🚀 Langkah Setup Setelah Config

Setelah edit file-file di atas:

### 1. Buat Database MySQL

```sql
CREATE DATABASE masjid_attaqwa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Install Dependencies (jika belum)

```bash
npm install
```

### 3. Push Schema ke Database

```bash
npm run db:push
```

### 4. Jalankan Development Server

```bash
npm run dev
```

### 5. Akses Aplikasi

- **Website Publik:** http://localhost:5000
- **CMS Admin:** http://localhost:5000/admin/login

**Login default:**
- Email: admin@masjidattaqwa.org  
- Password: admin123

---

## 🔧 Troubleshooting

### Error: "NODE_ENV is not recognized"
✅ Update `package.json` dengan `cross-env`

### Error: "dialect is not supported"
✅ Update `drizzle.config.ts` dialect ke `mysql`

### Error: "Cannot connect to database"
✅ Check:
- MySQL service sudah running
- Username, password, database name di `.env` benar
- Port 3306 tidak terblokir

### Error: "Table doesn't exist"
✅ Jalankan: `npm run db:push`

---

## 📚 Database Schema

Schema sudah di-generate untuk MySQL dengan tabel:

- **users** - User accounts (admin, bendahara, ketua)
- **transactions** - Transaksi keuangan (pemasukan/pengeluaran)
- **transaction_approvals** - Workflow approval
- **news** - Berita dan update
- **donations** - Data donasi
- **feedback** - Saran dari jamaah

Lihat detail di `shared/schema.ts`
