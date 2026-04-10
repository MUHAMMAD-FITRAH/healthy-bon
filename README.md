# 🥗 Healthy Bon — AI Nutrition Monitor

> **Struk Belanja Berbicara** — Sistem AI yang mengubah struk belanja menjadi laporan kesehatan personal.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/healthy-bon&env=ANTHROPIC_API_KEY&envDescription=Anthropic%20API%20Key%20for%20receipt%20analysis&project-name=healthy-bon)

## ✨ Fitur

- **📸 Pindai Struk** — Kamera real-time atau upload gambar struk belanja
- **🤖 AI Analysis** — OCR → NLP → Database Gizi → ML Scoring via Claude Vision
- **📊 Health Receipt** — Skor kesehatan 0-100, breakdown nutrisi, rekomendasi personal
- **📈 Rekap Mingguan** — Dashboard tren skor, distribusi kategori, highlight produk
- **🌓 Dual Theme** — Light & Dark mode
- **📱 PWA Ready** — Installable di smartphone
- **🔒 Privasi** — Data tersimpan lokal di browser (localStorage)

## 🚀 Deploy ke Vercel (5 Menit)

### Prasyarat
- Akun [GitHub](https://github.com)
- Akun [Vercel](https://vercel.com) (gratis, login dengan GitHub)
- API Key [Anthropic](https://console.anthropic.com/) (untuk Claude AI)

### Langkah-langkah

**1. Push ke GitHub**
```bash
# Clone atau download project ini
cd healthy-bon

# Inisialisasi git
git init
git add .
git commit -m "Initial commit: Healthy Bon v1.0"

# Buat repo baru di GitHub, lalu:
git remote add origin https://github.com/YOUR_USERNAME/healthy-bon.git
git branch -M main
git push -u origin main
```

**2. Deploy ke Vercel**
1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository `healthy-bon` dari GitHub
3. Di halaman konfigurasi:
   - Framework Preset: **Next.js** (otomatis terdeteksi)
   - Environment Variables: tambahkan `ANTHROPIC_API_KEY` dengan nilai API key kamu
4. Klik **Deploy**
5. Tunggu 1-2 menit → selesai! 🎉

**3. Akses Aplikasi**
- URL: `https://healthy-bon.vercel.app` (atau nama yang kamu pilih)
- Bisa langsung diakses dari browser HP maupun desktop

### Update Environment Variable
Jika perlu mengubah API key:
1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Update `ANTHROPIC_API_KEY`
3. Redeploy

## 🛠 Development Lokal

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local dan isi ANTHROPIC_API_KEY

# Jalankan development server
npm run dev

# Buka http://localhost:3000
```

## 📁 Struktur Project

```
healthy-bon/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js      # API endpoint (proxy ke Claude)
│   ├── globals.css            # Tailwind + custom animations
│   ├── layout.js              # Root layout + metadata + SEO
│   └── page.js                # Entry point
├── components/
│   └── HealthyBon.jsx         # Main app component (client-side)
├── lib/
│   └── utils.js               # Storage & helper functions
├── public/
│   └── manifest.json          # PWA manifest
├── .env.example               # Template environment variables
├── .gitignore
├── jsconfig.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 Arsitektur Teknis

```
User Device                          Vercel Server
┌─────────────┐                     ┌──────────────┐
│  Browser     │  POST /api/analyze │  Next.js API  │
│  Camera/     │ ──────────────────>│  Route        │
│  Upload      │  (base64 image)    │              │
│              │                    │  Claude SDK   │──> Anthropic API
│  localStorage│ <──────────────────│  (server-side)│     (Claude Vision)
│  (weekly     │  JSON response     │  API Key SAFE │
│   data)      │                    └──────────────┘
└─────────────┘

Privacy: Gambar dikirim ke server Vercel → Claude API → hasil kembali.
         Data mingguan tersimpan di localStorage browser (tidak di server).
```

## 📝 Konteks Kompetisi

Project ini dikembangkan untuk **ONTEL 2026** (Olimpiade Nasional Teknologi Laboratorium Medis) — Lomba Essay Argumentatif dengan tema "Innovation and Research in Health for a Better Future".

**Esai:** *Struk Belanja Berbicara: Healthy Bon sebagai Inovasi Kecerdasan Buatan untuk Transformasi Pemantauan Gizi Masyarakat Indonesia*

**Penulis:** Muhammad Fitrah — IPB University

## 📄 Lisensi

MIT License — Free to use, modify, and distribute.

---

> *"Struk belanja telah lama berbicara tentang siapa kita dan apa yang kita makan. Healthy Bon hadir untuk memastikan kita akhirnya belajar mendengarkannya."*
