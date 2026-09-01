# Ecobrick Virtual Research Laboratory (EVRL) & KTI Jury Simulator

Platform riset virtual interaktif, manajemen data KTI, asisten LAB AI (RAG), dan simulator sidang juri LKTI untuk penelitian ecobrick ramah lingkungan.

---

## 🚀 Fitur Utama

1. **Laboratorium Interaktif 2D (*Virtual Workbench*)**:
   - Simulasi densitas ecobrick ($\rho = m/V$), uji tekan beban bertingkat (*compression load test*), dan evaluasi kepatuhan standar BRIDA/GEA ($\ge 0.33\text{ g/cm}^3$).
2. **KTI Research Workspace**:
   - Struktur naskah KTI resmi lengkap (Bab I - V), anotasi metodologi, bank data eksperimen, katalog referensi ilmiah (`[REF-001]` - `[REF-044]`), dan logbook riset.
3. **LAB AI (Academic RAG Assistant)**:
   - Konsultasi ilmiah langsung dengan grounding literatur empiris (PjBL, ESLF, TPB, VBN).
4. **Simulator Sidang Juri LKTI**:
   - 4 Persona juri realistis (*Metodologis Kritis, Penguji TPB & Teori Perilaku, Penguji Teknis & Material, serta Penguji Aplikasi & Skalabilitas*).
   - Penilaian rubrik LKTI nasional bertingkat dan generator laporan evaluasi komprehensif.

---

## 🛠️ Persiapan & Menjalankan di Lokal

### Prasyarat
- **Node.js**: Versi 20.x atau lebih baru
- **NPM**: Versi 9.x atau lebih baru

### 1. Kloning Repositori & Instalasi Dependensi
```bash
# Clone repositori dari GitHub
git clone https://github.com/USERNAME/ecobrick-virtual-research-lab.git
cd ecobrick-virtual-research-lab

# Instal seluruh dependensi
npm install
```

### 2. Konfigurasi Variabel Lingkungan (.env)
Salin `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel yang diperlukan di dalam berkas `.env`:
```env
# Kunci API Penyedia AI (Pilih salah satu atau keduanya)
MISTRAL_API_KEY="kunci_api_mistral_anda"
MISTRAL_MODEL="open-mistral-nemo"

GEMINI_API_KEY="kunci_api_gemini_anda"

# Kunci rahasia sesi workspace
SESSION_SIGNING_SECRET="buat_string_rahasia_acak_minimal_32_karakter"
```

### 3. Menjalankan Server Pengembangan (Dev Mode)
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

---

## 📦 Panduan Upload ke GitHub

Jika Anda mengunduh proyek ini atau mengekspornya dari Google AI Studio:

```bash
# 1. Inisialisasi git (jika belum)
git init

# 2. Tambahkan semua berkas ke git staging
git add .

# 3. Buat commit pertama
git commit -m "feat: initial release of Ecobrick Virtual Research Lab"

# 4. Buat repositori baru di GitHub (misal: ecobrick-virtual-research-lab)

# 5. Hubungkan remote repository GitHub
git remote add origin https://github.com/USERNAME_GITHUB_ANDA/ecobrick-virtual-research-lab.git

# 6. Set branch utama ke 'main' dan push
git branch -M main
git push -u origin main
```

---

## 🌐 Panduan Deploy ke Render

Aplikasi ini telah dilengkapi dengan konfigurasi `render.yaml` untuk kemudahan deploy otomatis.

### Cara 1: Deploy Otomatis (Menggunakan Blueprint `render.yaml`)
1. Masuk ke dashboard [Render](https://dashboard.render.com/).
2. Klik tombol **New +** lalu pilih **Blueprint**.
3. Hubungkan akun GitHub Anda dan pilih repositori `ecobrick-virtual-research-lab`.
4. Render akan membaca `render.yaml` secara otomatis dan menyiapkan layanan web.
5. Masukkan `MISTRAL_API_KEY` atau `GEMINI_API_KEY` pada kolom *Environment Variables*.
6. Klik **Apply**. Render akan menjalankan build dan aplikasi siap digunakan dalam 2–3 menit!

---

### Cara 2: Deploy Manual (Web Service)
Jika ingin membuat *Web Service* secara manual di Render:
1. Klik **New +** $\rightarrow$ **Web Service**.
2. Pilih repositori GitHub Anda.
3. Atur konfigurasi berikut:
   - **Name**: `ecobrick-virtual-research-lab`
   - **Language / Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
4. Di bagian **Environment Variables**, tambahkan:
   - `NODE_ENV` = `production`
   - `SESSION_SIGNING_SECRET` = *(klik Generate atau masukkan string acak)*
   - `MISTRAL_API_KEY` = *(API key Mistral Anda)*
   - `MISTRAL_MODEL` = `open-mistral-nemo`
   - `GEMINI_API_KEY` = *(Opsional: API key Google Gemini)*
5. Klik **Create Web Service**.

---

## 📁 Struktur Direktori Penting

```
├── server.ts                 # Backend Express & Vite production static middleware
├── server/
│   ├── aiProvider.ts         # Layanan AI (Mistral & Gemini SDK, fallback logic)
│   ├── researchCorpus.ts     # Sistem RAG naskah KTI, metodologi & katalog sitasi
│   └── workspaceStore.ts     # Penyimpanan dan isolasi sesi workspace
├── src/
│   ├── components/
│   │   ├── ai/               # Antarmuka LAB AI (RAG Assistant)
│   │   ├── experiments/      # Workbench 2D simulasi laboratorium
│   │   ├── jury/             # Simulator sidang juri LKTI
│   │   └── research/         # Naskah KTI, viewer referensi & catatan riset
│   ├── types/                # Definisi tipe TypeScript
│   └── utils/sampleData.ts   # Preset data riset autentik MA Plus Abu Hurairah
├── research/                 # Korpus naskah KTI & berkas sintesis literatur ilmiah
├── render.yaml               # Spesifikasi deployment Render Blueprint
└── package.json              # Dependensi dan skrip build/start
```

---

## 📄 Lisensi
Hak Cipta (c) 2026 Tim Peneliti MA Plus Abu Hurairah Mataram.
Dikembangkan untuk Kompetisi Karya Tulis Ilmiah & Laboratorium Riset Berkelanjutan.
