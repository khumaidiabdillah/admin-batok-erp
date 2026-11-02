'use server'

import { supabaseAdminDB, supabaseUserDB } from '@/lib/supabase'
import type { WorkScan } from '@/lib/types'

export async function fetchPendingScans(): Promise<WorkScan[]> {
  try {
    const { data, error } = await supabaseUserDB
      .from('work_scans')
      .select('*')
      .eq('status_acc', 'Menunggu ACC')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending scans:', error)
      return []
    }

    return (data as WorkScan[]) || []
  } catch (err) {
    console.error('Catch fetching pending scans:', err)
    return []
  }
}

interface ApproveResult {
  success: boolean
  message: string
}

export async function approveWorkScan(formData: FormData): Promise<ApproveResult> {
  const workScanId = formData.get('work_scan_id') as string
  const employeeId = formData.get('employee_id') as string
  const namaKaryawan = formData.get('nama_karyawan') as string
  const divisi = formData.get('divisi') as string
  const shift = formData.get('shift') as string
  const tanggalProduksi = formData.get('tanggal_produksi') as string
  const tonaseBahanBaku = parseFloat(formData.get('tonase_bahan_baku_kg') as string)
  const hasilProduksi = parseFloat(formData.get('hasil_produksi_kg') as string)
  const jumlahKarung = parseInt(formData.get('jumlah_karung') as string, 10)
  const hargaPerKg = parseFloat(formData.get('harga_per_kg') as string)

  if (
    !workScanId ||
    !employeeId ||
    !tanggalProduksi ||
    isNaN(tonaseBahanBaku) ||
    isNaN(hasilProduksi) ||
    isNaN(jumlahKarung) ||
    isNaN(hargaPerKg)
  ) {
    return { success: false, message: 'Semua field validasi wajib diisi dengan benar.' }
  }

  const totalPendapatan = hasilProduksi * hargaPerKg

  try {
    // Step 1: Write verified production to DB_ADMIN
    const { error: insertError } = await supabaseAdminDB
      .from('verified_production')
      .insert({
        scan_submission_id: workScanId,
        employee_id: employeeId,
        nama_karyawan: namaKaryawan,
        tim_divisi: divisi,
        tanggal_produksi: tanggalProduksi,
        tonase_bahan_baku_kg: tonaseBahanBaku,
        hasil_produksi_kg: hasilProduksi,
        jumlah_karung: jumlahKarung,
        harga_per_kg: hargaPerKg,
        total_pendapatan: totalPendapatan,
      })

    if (insertError) {
      console.error('Error inserting verified production:', insertError)
      return {
        success: false,
        message: `Gagal menyimpan data produksi: ${insertError.message}`,
      }
    }

    // Step 2: Update status_acc & nominal_disetujui in DB_USER
    const { error: updateError } = await supabaseUserDB
      .from('work_scans')
      .update({
        status_acc: 'Disetujui',
        nominal_disetujui: totalPendapatan,
      })
      .eq('id', workScanId)

    if (updateError) {
      console.error('Error updating work scan status:', updateError)
      return {
        success: true,
        message: 'Produksi terverifikasi, namun status di DB User gagal diupdate.',
      }
    }

    return {
      success: true,
      message: `Catatan kerja "${namaKaryawan}" berhasil disetujui.`,
    }
  } catch (error: any) {
    console.error('Approve error:', error)
    return { success: false, message: error?.message || 'Terjadi kesalahan sistem. Coba lagi.' }
  }
}

export async function rejectWorkScan(workScanId: string): Promise<ApproveResult> {
  if (!workScanId) {
    return { success: false, message: 'ID work scan tidak valid.' }
  }

  try {
    const { error } = await supabaseUserDB
      .from('work_scans')
      .update({ status_acc: 'Ditolak' })
      .eq('id', workScanId)

    if (error) {
      console.error('Error rejecting work scan:', error)
      return { success: false, message: `Gagal menolak catatan: ${error.message}` }
    }

    return { success: true, message: 'Catatan kerja berhasil ditolak.' }
  } catch (error: any) {
    console.error('Reject error:', error)
    return { success: false, message: error?.message || 'Terjadi kesalahan sistem. Coba lagi.' }
  }
}
