# Admin PT Batok Kelapa (Control Plane & ERP Portal)

Portal Owner & Manajemen PT Produksi Batok Kelapa berbasis Next.js App Router, Tailwind CSS, TypeScript, dan Supabase.

## ✨ Fitur Utama
- **Dashboard Analitik**: Filter periode (Harian, Mingguan, Bulanan), KPI hasil produksi (Kg), total karung, omzet rupiah, dan rekapitulasi per tim divisi.
- **Registrasi Karyawan (Dual-Write)**: Menulis akun ke `DB_USER` sekaligus mencatat log ke `DB_ADMIN`.
- **ACC Catatan Kerja**: Split-view foto scan dokumen dari karyawan & form validasi kalkulasi omzet produksi.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Enterprise Light Theme)
- **Database**: Supabase PostgreSQL (Dual-Database Topology)

## 🚀 Menjalankan Project
```bash
npm install
npm run dev
```
Buka browser di `http://localhost:3001`.
