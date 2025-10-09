# Sistem Transparansi Keuangan Masjid At-Taqwa

Website transparansi keuangan untuk proyek pembangunan Masjid At-Taqwa dengan dashboard admin dan tampilan publik.

## 📋 Deskripsi

Sistem ini dirancang untuk memberikan transparansi penuh terhadap arus kas proyek pembangunan masjid, dengan fitur:
- **Website Publik**: Menampilkan informasi cash flow, berita, dan informasi donasi
- **CMS Admin** (dalam pengembangan): Pengelolaan konten dan approval workflow
- **Backend API** (dalam pengembangan): REST API untuk manajemen data

## 🚀 Cara Menjalankan di Local Device

### Prerequisites
Pastikan Anda sudah menginstall:
- **Node.js** (versi 18 atau lebih baru)
- **PostgreSQL** (untuk database)
- **npm** atau **yarn**

### Langkah Instalasi

1. **Clone atau Download Source Code**
   ```bash
   # Jika menggunakan git
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   - Buat database PostgreSQL baru
   - Copy file `.env.example` menjadi `.env` (jika ada), atau buat file `.env` baru
   - Tambahkan database URL ke file `.env`:
     ```env
     DATABASE_URL=postgresql://username:password@localhost:5432/masjid_attaqwa
     SESSION_SECRET=your-secret-key-here
     ```

4. **Jalankan Database Migration**
   ```bash
   npm run db:push
   ```

5. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   
   Server akan berjalan di `http://localhost:5000`

## 🏗️ Cara Build untuk Production

### Build Frontend dan Backend

```bash
npm run build
```

### Menjalankan Production Build

```bash
npm run start
```

## 📦 Struktur Project

```
.
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/    # Komponen UI
│   │   ├── pages/         # Halaman aplikasi
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Root component
│   └── index.html
├── server/                # Backend Express
│   ├── db.ts             # Database setup
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data layer
│   └── index.ts          # Server entry point
├── shared/               # Shared types & schemas
│   └── schema.ts         # Database schema
└── package.json

```

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL dengan Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: Wouter

## 📱 Halaman yang Tersedia

1. **Home** (`/`) - Halaman utama dengan hero, tentang, cash flow summary
2. **Berita** (`/berita`) - Listing berita dan update proyek
3. **Informasi Donasi** (`/informasi-donasi`) - Detail cara berdonasi dan rekening
4. **Saran** (`/saran`) - Form feedback dan kontak

## 🎨 Design System

- **Primary Color**: Emerald Green (Islamic aesthetic)
- **Typography**: Plus Jakarta Sans
- **Responsive**: Mobile-first approach
- **Currency**: Format Rupiah Indonesia
- **Date Format**: Indonesia locale

## 📝 Environment Variables

Buat file `.env` di root project dengan variabel berikut:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SESSION_SECRET=your-random-secret-key
NODE_ENV=development
```

## 🔧 Scripts yang Tersedia

```bash
npm run dev          # Menjalankan development server
npm run build        # Build untuk production
npm run start        # Menjalankan production server
npm run db:push      # Push schema ke database
npm run db:studio    # Buka Drizzle Studio (database GUI)
```

## 🚧 Fitur dalam Pengembangan

- [ ] CMS Admin dengan approval workflow
- [ ] Backend API lengkap untuk transaksi
- [ ] Multi-level approval system
- [ ] Dashboard analytics
- [ ] Export laporan keuangan

## 📞 Kontak

**Masjid At-Taqwa**
- Alamat: Perum. Ciomashills Blok H-J, Ciapus Kab. Bogor
- Telepon: 081212707907
- Email: info@masjidattaqwa.org

## 📄 License

Copyright © 2024 Masjid At-Taqwa
