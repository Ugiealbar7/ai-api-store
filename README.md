# 🚀 Nusantara AI — Platform SaaS Penjualan AI API Key

Platform lengkap untuk menjual akses API Key AI (OpenAI GPT-4o, Claude 3.7 Sonnet, DeepSeek R1/V3, Gemini) dengan pembayaran otomatis **QRIS & Rupiah** via Midtrans, terintegrasi database Supabase (PostgreSQL) dan siap di-hosting langsung ke **Vercel** (Zero Cost / Gratis untuk mulai!).

---

## ✨ Fitur Utama

1. **100% Kompatibel Format OpenAI (`/api/v1/chat/completions`)**:
   - Pembeli dapat langsung memasukkan API Key dan Base URL ke **Cursor IDE, VS Code (Cline/Roo Code), NextChat, Chatbox, Python, atau Node.js**.
   - Mendukung respon *streaming* (Server-Sent Events) secara real-time.
2. **Kalkulasi Biaya & Saldo Otomatis (Markup Profit Margin)**:
   - Menghitung token input & output secara akurat.
   - Otomatis memotong saldo pengguna dalam Rupiah (IDR) dengan margin keuntungan (20% – 40% profit).
3. **Sistem Pembayaran Instan QRIS (Midtrans)**:
   - Pengguna dapat melakukan top-up saldo mulai Rp 10.000 menggunakan QRIS (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay).
   - Saldo bertambah otomatis secara instan setelah pembayaran terdeteksi melalui webhook.
4. **Dashboard Pengguna Modern**:
   - **Kelola API Key**: Buat kunci baru (`sk-live-...`), salin, aktifkan/nonaktifkan, atau hapus.
   - **Tes API Langsung**: Widget interaktif di dashboard untuk mencoba prompt langsung.
   - **Riwayat Penggunaan**: Tabel detail pemakaian token dan rupiah per request.
   - **Dokumentasi Terintegrasi**: Panduan setup cepat untuk developer.

---

## 🛠️ Langkah Menghubungkan Database & Hosting ke Vercel

### Langkah 1: Buat Database PostgreSQL Gratis di Supabase
1. Buka [Supabase.com](https://supabase.com) lalu login / daftar gratis.
2. Klik **New Project**, beri nama proyek (contoh: `ai-api-store`), pilih region terdekat (misal: **Singapore**), lalu buat password database.
3. Setelah database siap, buka menu **Project Settings** (ikon gear di kiri bawah) ➔ **Database**.
4. Gulir ke bagian **Connection string**, pilih mode **URI**:
   - Salin URI **Session Pooler** (port 5432) dan masukkan ke `DATABASE_URL` di `.env`.
   - Salin URI **Direct Connection** (port 5432) dan masukkan ke `DIRECT_URL` di `.env`.

### Langkah 2: Jalankan Migrasi Database
Buka terminal di folder proyek ini dan jalankan:
```bash
npx prisma db push
```
*Perintah ini akan secara otomatis membuat seluruh tabel (`User`, `ApiKey`, `Transaction`, `UsageLog`) di database Supabase Anda.*

---

### Langkah 3: Siapkan Master AI Upstream Key
Pilih sumber AI yang akan Anda jual kembali:
* **Rekomendasi Terbaik:** Daftarkan akun di [OpenRouter.ai](https://openrouter.ai), isi saldo $5 atau $10, lalu buat API key.
* Masukkan konfigurasi ke `.env`:
  ```env
  UPSTREAM_BASE_URL="https://openrouter.ai/api/v1"
  UPSTREAM_API_KEY="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
  ```

---

### Langkah 4: Hosting Langsung ke Vercel (Gratis)

#### Cara A: Melalui GitHub (Paling Mudah)
1. Buat repository baru di [GitHub](https://github.com/new) (misal: `ai-api-store`).
2. Di folder proyek ini, jalankan perintah:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit AI API store"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/ai-api-store.git
   git push -u origin main
   ```
3. Buka [Vercel.com](https://vercel.com), klik **Add New** ➔ **Project**.
4. Pilih repository `ai-api-store` yang baru Anda buat, lalu klik **Import**.
5. Di bagian **Environment Variables**, tambahkan variabel berikut:
   * `DATABASE_URL` : (URL Supabase Pooler)
   * `DIRECT_URL` : (URL Supabase Direct)
   * `JWT_SECRET` : (String rahasia acak)
   * `UPSTREAM_BASE_URL` : `https://openrouter.ai/api/v1`
   * `UPSTREAM_API_KEY` : (API key OpenRouter master Anda)
   * `MIDTRANS_SERVER_KEY` : (Server key Midtrans Anda)
   * `MIDTRANS_CLIENT_KEY` : (Client key Midtrans Anda)
   * `MIDTRANS_IS_PRODUCTION` : `false` (atau `true` jika sudah live)
6. Klik **Deploy**! Dalam 1-2 menit website Anda sudah aktif dan live dengan domain HTTPS gratis (contoh: `ai-api-store.vercel.app`).

---

## 💳 Pengaturan Webhook Midtrans (Agar Saldo Masuk Otomatis)
1. Buka [Dashboard Midtrans](https://dashboard.midtrans.com) ➔ Masuk menu **Settings** ➔ **Configuration**.
2. Di kolom **Payment Notification URL**, isi dengan URL website Vercel Anda:
   ```
   https://NAMA-PROJECT-ANDA.vercel.app/api/webhooks/midtrans
   ```
3. Klik **Save**. Sekarang, setiap kali pembeli scan QRIS dan berhasil bayar, saldo mereka akan langsung otomatis bertambah!

---

## 💻 Menjalankan di Komputer Lokal (Development)

1. Jalankan development server:
   ```bash
   npm run dev
   ```
2. Buka browser di [http://localhost:3000](http://localhost:3000).
3. Anda bisa langsung mendaftar akun baru dan mendapatkan saldo gratis Rp 10.000 untuk pengujian.
