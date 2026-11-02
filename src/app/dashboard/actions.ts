'use server'

import { supabaseAdminDB, supabaseUserDB } from '@/lib/supabase'
import type { DashboardData, DivisiSummary, PeriodFilter } from '@/lib/types'

export async function fetchDashboardData(period: PeriodFilter): Promise<DashboardData> {
  const now = new Date()
  let startDateStr = ''

  if (period === 'harian') {
    startDateStr = now.toISOString().split('T')[0]
  } else if (period === 'mingguan') {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    startDateStr = weekStart.toISOString().split('T')[0]
  } else {
    // bulanan
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    startDateStr = monthStart.toISOString().split('T')[0]
  }

  // 1. Fetch verified production from DB_ADMIN
  const { data: productions, error: prodError } = await supabaseAdminDB
    .from('verified_production')
    .select('*')
    .gte('tanggal_produksi', startDateStr)

  if (prodError) {
    console.error('Error fetching productions:', prodError)
  }

  const prodData = productions || []

  // 2. Fetch pending work scans count from DB_USER
  let pendingCount = 0
  try {
    const { count, error: pendingError } = await supabaseUserDB
      .from('work_scans')
      .select('*', { count: 'exact', head: true })
      .eq('status_acc', 'Menunggu ACC')

    if (pendingError) {
      console.error('Error fetching pending count:', pendingError)
    } else {
      pendingCount = count || 0
    }
  } catch (err) {
    console.error('Catch pending count:', err)
  }

  // Calculate totals
  const totalProduksiKg = prodData.reduce(
    (sum, p) => sum + (Number(p.hasil_produksi_kg) || 0),
    0
  )
  const totalKarung = prodData.reduce(
    (sum, p) => sum + (Number(p.jumlah_karung) || 0),
    0
  )
  const totalPendapatan = prodData.reduce(
    (sum, p) => sum + (Number(p.total_pendapatan) || 0),
    0
  )

  // Group by divisi
  const divisiNames = ['Pembakaran', 'Sortir Batok', 'Pengemasan']
  const divisiSummaries: DivisiSummary[] = divisiNames.map((divisi) => {
    const divisiProds = prodData.filter(
      (p) => (p.tim_divisi || (p as any).divisi) === divisi
    )
    const uniqueEmployees = new Set(divisiProds.map((p) => p.employee_id))

    return {
      divisi,
      jumlah_karyawan: uniqueEmployees.size,
      total_produksi_kg: divisiProds.reduce(
        (s, p) => s + (Number(p.hasil_produksi_kg) || 0),
        0
      ),
      total_karung: divisiProds.reduce(
        (s, p) => s + (Number(p.jumlah_karung) || 0),
        0
      ),
      total_pendapatan: divisiProds.reduce(
        (s, p) => s + (Number(p.total_pendapatan) || 0),
        0
      ),
    }
  })

  return {
    totalProduksiKg,
    totalKarung,
    totalPendapatan,
    pendingCount,
    divisiSummaries,
  }
}
