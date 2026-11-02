'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ImageIcon,
} from 'lucide-react'
import { fetchPendingScans, approveWorkScan, rejectWorkScan } from './actions'
import type { WorkScan } from '@/lib/types'

function formatCurrency(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID')
}

export default function AccCatatanPage() {
  const [scans, setScans] = useState<WorkScan[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean
    success: boolean
    message: string
  }>({ show: false, success: false, message: '' })

  // Form state
  const [tanggalProduksi, setTanggalProduksi] = useState('')
  const [tonaseBahanBaku, setTonaseBahanBaku] = useState('')
  const [hasilProduksi, setHasilProduksi] = useState('')
  const [jumlahKarung, setJumlahKarung] = useState('')
  const [hargaPerKg, setHargaPerKg] = useState('')

  const selectedScan = useMemo(
    () => scans.find((s) => s.id === selectedId) || null,
    [scans, selectedId]
  )

  const totalPendapatan = useMemo(() => {
    const hasil = parseFloat(hasilProduksi) || 0
    const harga = parseFloat(hargaPerKg) || 0
    return hasil * harga
  }, [hasilProduksi, hargaPerKg])

  const loadScans = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPendingScans()
      setScans(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load scans:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    loadScans()
  }, [loadScans])

  useEffect(() => {
    if (selectedScan) {
      const rawDate = selectedScan.created_at || (selectedScan as any).scanned_at || new Date().toISOString()
      try {
        setTanggalProduksi(new Date(rawDate).toISOString().split('T')[0])
      } catch {
        setTanggalProduksi(new Date().toISOString().split('T')[0])
      }
      setTonaseBahanBaku('')
      setHasilProduksi('')
      setJumlahKarung('')
      setHargaPerKg('')
    }
  }, [selectedScan])

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(
        () => setToast((t) => ({ ...t, show: false })),
        4000
      )
      return () => clearTimeout(timer)
    }
  }, [toast.show])

  function resetFormAndSelect() {
    setSelectedId(null)
    setTanggalProduksi('')
    setTonaseBahanBaku('')
    setHasilProduksi('')
    setJumlahKarung('')
    setHargaPerKg('')
  }

  async function handleApprove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedScan) return
    setSubmitting(true)

    const formData = new FormData()
    formData.set('work_scan_id', selectedScan.id)
    formData.set('employee_id', selectedScan.employee_id)
    formData.set('nama_karyawan', selectedScan.nama_karyawan)
    formData.set('divisi', selectedScan.tim_divisi || (selectedScan as any).divisi || 'Pembakaran')
    formData.set('shift', selectedScan.shift)
    formData.set('tanggal_produksi', tanggalProduksi)
    formData.set('tonase_bahan_baku_kg', tonaseBahanBaku)
    formData.set('hasil_produksi_kg', hasilProduksi)
    formData.set('jumlah_karung', jumlahKarung)
    formData.set('harga_per_kg', hargaPerKg)

    const result = await approveWorkScan(formData)
    setToast({ show: true, success: result.success, message: result.message })

    if (result.success) {
      resetFormAndSelect()
      await loadScans()
    }

    setSubmitting(false)
  }

  async function handleReject() {
    if (!selectedScan) return
    if (!confirm('Apakah Anda yakin ingin menolak catatan ini?')) return
    setSubmitting(true)

    const result = await rejectWorkScan(selectedScan.id)
    setToast({ show: true, success: result.success, message: result.message })

    if (result.success) {
      resetFormAndSelect()
      await loadScans()
    }

    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
            toast.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toast.success ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          ACC Hasil Scan Catatan Kerja
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Validasi dan verifikasi catatan produksi dari karyawan (Cross-DB Read
          &amp; Dual-Write)
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-12 text-center text-slate-400 text-sm">
          Memuat data catatan kerja...
        </div>
      ) : scans.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Tidak Ada Catatan Pending
          </h3>
          <p className="text-sm text-slate-500">
            Semua catatan kerja sudah diverifikasi. Catatan baru akan muncul di
            sini setelah karyawan melakukan scan.
          </p>
        </div>
      ) : (
        /* Split View */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT Panel - Pending List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Menunggu ACC
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 rounded">
                <Clock className="w-3 h-3" />
                {scans.length} pending
              </span>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {scans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => setSelectedId(scan.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedId === scan.id
                      ? 'border-emerald-brand bg-emerald-50/50 ring-1 ring-emerald-brand/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {scan.foto_catatan_url ? (
                        <img
                          src={scan.foto_catatan_url}
                          alt="Foto catatan"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {scan.nama_karyawan}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {scan.tim_divisi || (scan as any).divisi} &middot; Shift {scan.shift}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 tabular-nums">
                        {new Date(scan.created_at || (scan as any).scanned_at || Date.now()).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT Panel - Validation Form */}
          <div className="lg:col-span-3">
            {!selectedScan ? (
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-12 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Pilih catatan kerja di panel kiri untuk memvalidasi
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs">
                {/* Scan Detail Header */}
                <div className="px-5 py-4 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Detail Catatan: {selectedScan.nama_karyawan}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedScan.tim_divisi || (selectedScan as any).divisi} &middot; Shift {selectedScan.shift}
                  </p>
                </div>

                {/* Image Preview */}
                <div className="px-5 pt-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Foto Catatan Kerja
                  </p>
                  <div className="w-full h-64 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                    {selectedScan.foto_catatan_url ? (
                      <img
                        src={selectedScan.foto_catatan_url}
                        alt="Foto catatan kerja"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">
                          Tidak ada foto
                        </p>
                      </div>
                    )}
                  </div>
                  {(selectedScan.catatan_tambahan || (selectedScan as any).catatan_text) && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-100">
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        Catatan Karyawan:
                      </p>
                      <p className="text-sm text-slate-700">
                        {selectedScan.catatan_tambahan || (selectedScan as any).catatan_text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Validation Form */}
                <form onSubmit={handleApprove} className="p-5 space-y-4">
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                      Form Validasi Produksi
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Tanggal Produksi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={tanggalProduksi}
                        onChange={(e) => setTanggalProduksi(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Tonase Bahan Baku (Kg){' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tonaseBahanBaku}
                        onChange={(e) => setTonaseBahanBaku(e.target.value)}
                        required
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Hasil Produksi (Kg){' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={hasilProduksi}
                        onChange={(e) => setHasilProduksi(e.target.value)}
                        required
                        placeholder="0.00"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Jumlah Karung <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={jumlahKarung}
                        onChange={(e) => setJumlahKarung(e.target.value)}
                        required
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Harga per Kg (Rp){' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={hargaPerKg}
                        onChange={(e) => setHargaPerKg(e.target.value)}
                        required
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Total Pendapatan
                      </label>
                      <div className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md font-semibold text-emerald-brand tabular-nums">
                        {formatCurrency(totalPendapatan)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-brand text-white text-sm font-medium rounded-md hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {submitting ? 'Memproses...' : 'Setujui / ACC'}
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 text-sm font-medium rounded-md border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
