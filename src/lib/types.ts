// ==========================================
// DB_ADMIN - schema_batok tables
// ==========================================

export interface AdminUser {
  id: string
  username: string
  password_hash: string
  nama_lengkap?: string
  role: string
  created_at: string
}

export interface EmployeeRegistryLog {
  id: string
  employee_user_id?: string
  employee_id?: string
  nama_lengkap: string
  nik: string
  tim_divisi?: string
  divisi?: string
  no_hp?: string
  registered_by?: string | null
  created_at?: string
  registered_at?: string
}

export interface VerifiedProduction {
  id: string
  scan_submission_id?: string
  work_scan_id?: string
  employee_id: string
  nama_karyawan: string
  tim_divisi?: string
  divisi?: string
  shift?: string
  tanggal_produksi: string
  tonase_bahan_baku_kg: number
  hasil_produksi_kg: number
  jumlah_karung: number
  harga_per_kg: number
  total_pendapatan: number
  verified_by?: string | null
  verified_at: string
}

// ==========================================
// DB_USER - schema_batok tables
// ==========================================

export interface Employee {
  id: string
  nama_lengkap: string
  nik: string
  tim_divisi: string
  divisi?: string
  no_hp: string
  pin_login: string
  is_active: boolean
  created_at: string
}

export interface WorkScan {
  id: string
  employee_id: string
  nama_karyawan: string
  tim_divisi?: string
  divisi?: string
  shift: string
  foto_catatan_url: string
  catatan_tambahan?: string
  catatan_text?: string
  status_acc: 'Menunggu ACC' | 'Disetujui' | 'Ditolak'
  nominal_disetujui?: number | null
  created_at?: string
  scanned_at?: string
}

// ==========================================
// UI Helper Types
// ==========================================

export type PeriodFilter = 'harian' | 'mingguan' | 'bulanan'

export interface DivisiSummary {
  divisi: string
  jumlah_karyawan: number
  total_produksi_kg: number
  total_karung: number
  total_pendapatan: number
}

export interface DashboardData {
  totalProduksiKg: number
  totalKarung: number
  totalPendapatan: number
  pendingCount: number
  divisiSummaries: DivisiSummary[]
}
