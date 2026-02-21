# Walet Jaya - Sistem Manajemen Penjualan 🏪

Aplikasi web untuk manajemen penjualan sarang burung walet. Dibangun dengan MERN Stack (MongoDB, Express.js, React, Node.js).

## Tech Stack 🛠

### Frontend

- React 19 + Vite
- React Router DOM
- Tailwind CSS
- Recharts (grafik & chart)
- Lucide React (ikon)
- jsPDF + jspdf-autotable (export PDF)
- SheetJS / XLSX (export Excel)

### Backend

- Node.js & Express.js
- MongoDB dengan Mongoose
- JWT untuk autentikasi
- Bcrypt untuk enkripsi password
- Multer (upload file)
- Express Rate Limit

## Fitur Utama ✨

- **Autentikasi** — Login dengan JWT, role Owner & Admin
- **Kelola Produk** — CRUD produk sarang walet dengan kalkulasi susut otomatis
- **Transaksi Penjualan** — Input transaksi, upload foto nota, kalkulasi laba otomatis
- **Laporan Penjualan** — Filter periode, export PDF & Excel
- **Dashboard** — Statistik & grafik tren penjualan
- **Kelola Pengguna** — Manajemen akun (khusus Owner)
- **Kelola Profil** — Update profil & foto dengan kompresi Base64

## Cara Install & Setup 🔧

### Prasyarat

- Node.js v18+
- MongoDB (lokal atau Atlas)

### 1. Clone Repository

```bash
git clone <url-repo-ini>
cd website-waletjaya
```

### 2. Setup Backend

```bash
cd backend-waletjaya
npm install
```

Buat file `.env` di folder `backend-waletjaya`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/waletjaya
JWT_SECRET=secret_key_kamu_yang_aman
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

### 3. Setup Frontend

```bash
cd frontend-waletjaya
npm install
```

Buat file `.env` di folder `frontend-waletjaya`:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Jalanin Seeder (Opsional)

Untuk membuat data awal owner:

```bash
cd backend-waletjaya
node seedUsers.js
```

### 5. Jalankan Aplikasi

```bash
# Terminal 1 - Backend
cd backend-waletjaya
npm run dev

# Terminal 2 - Frontend
cd frontend-waletjaya
npm run dev
```

Buka browser: `http://localhost:5173`

## Struktur Folder 📁

```
website-waletjaya/
├── backend-waletjaya/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── logs/
│   └── server.js
└── frontend-waletjaya/
    └── src/
        ├── components/
        ├── pages/
        └── assets/
```

## Endpoints API 🚀

### Auth

- `POST /api/auth/login` — Login

### Users

- `GET /api/users` — List pengguna (Owner only)
- `POST /api/users` — Tambah pengguna
- `PUT /api/users/:id` — Edit pengguna
- `DELETE /api/users/:id` — Hapus pengguna

### Produk

- `GET /api/products` — List produk
- `POST /api/products` — Tambah produk
- `PUT /api/products/:id` — Edit produk
- `DELETE /api/products/:id` — Hapus produk
- `GET /api/products/stats/summary` — Statistik produk

### Transaksi

- `GET /api/transactions` — List transaksi
- `POST /api/transactions` — Tambah transaksi
- `PUT /api/transactions/:id` — Edit transaksi
- `DELETE /api/transactions/:id` — Hapus transaksi
- `GET /api/transactions/stats/summary` — Statistik transaksi

### Laporan

- `GET /api/laporan/laporan` — Data laporan dengan filter periode

## Role & Akses 🔐

| Fitur               | Owner | Admin |
| ------------------- | ----- | ----- |
| Dashboard           | ✅    | ✅    |
| Kelola Produk       | ✅    | ❌    |
| Transaksi Penjualan | ✅    | ✅    |
| Laporan Penjualan   | ✅    | ✅    |
| Kelola Pengguna     | ✅    | ❌    |
| Kelola Profil       | ✅    | ✅    |

---

Dibuat oleh nazwaaap
