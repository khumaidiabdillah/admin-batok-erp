'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { registerEmployee, fetchRegistryLogs } from './actions'
import type { EmployeeRegistryLog } from '@/lib/types'

const divisiOptions = ['Pembakaran', 'Sortir Batok', 'Pengemasan']

export default function RegistrasiPage() {
  const [logs, setLogs] = useState<EmployeeRegistryLog[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean
    success: boolean
    message: string
  }>({ show: false, success: false, message: '' })

  const loadLogs = useCallback(async () => {
    try {
      const data = await fetchRegistryLogs()
      setLogs(data)
    } catch (err) {
      console.error('Failed to load logs:', err)
    }
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(
        () => setToast((t) => ({ ...t, show: false })),
        4000
      )
      return () => clearTimeout(timer)
    }
  }, [toast.show])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await registerEmployee(formData)

    setToast({ show: true, success: result.success, message: result.message })

    if (result.success) {
      ;(e.target as HTMLFormElement).reset()
      await loadLogs()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
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
          Registrasi Karyawan Baru
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Daftarkan karyawan baru ke sistem (Dual-Write: DB User &amp; DB Admin)
        </p>
      </div>

      {/* Registration Form */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-brand" />
          <h2 className="text-sm font-semibold text-slate-900">
            Form Registrasi
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div>
              <label
                htmlFor="nama_lengkap"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama_lengkap"
                name="nama_lengkap"
                required
                placeholder="Masukkan nama lengkap"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors"
              />
            </div>

            {/* NIK */}
            <div>
              <label
                htmlFor="nik"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                NIK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nik"
                name="nik"
                required
                placeholder="Nomor Induk Kependudukan"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors"
              />
            </div>

            {/* Divisi */}
            <div>
              <label
                htmlFor="divisi"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Divisi / Tim <span className="text-red-500">*</span>
              </label>
              <select
                id="divisi"
                name="divisi"
                required
                defaultValue=""
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors bg-white"
              >
                <option value="" disabled>
                  Pilih divisi
                </option>
                {divisiOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* No HP */}
            <div>
              <label
                htmlFor="no_hp"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                No. HP <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="no_hp"
                name="no_hp"
                required
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors"
              />
            </div>

            {/* PIN Login */}
            <div>
              <label
                htmlFor="pin_login"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                PIN Login <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="pin_login"
                name="pin_login"
                required
                minLength={4}
                maxLength={6}
                placeholder="4-6 digit PIN"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-brand/20 focus:border-emerald-brand transition-colors"
              />
              <p className="text-xs text-slate-400 mt-1">
                PIN digunakan karyawan untuk login di aplikasi karyawan
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-brand text-white text-sm font-medium rounded-md hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Mendaftarkan...' : 'Daftarkan Karyawan'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Riwayat Registrasi Terbaru
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">
                  Nama Lengkap
                </th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">
                  NIK
                </th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">
                  Divisi
                </th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">
                  No. HP
                </th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">
                  Tanggal Registrasi
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-slate-400"
                  >
                    Belum ada data registrasi
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {log.nama_lengkap}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-700">
                      {log.nik}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {log.tim_divisi || (log as any).divisi}
                      </span>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-700">
                      {log.no_hp || '-'}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-500">
                      {new Date(log.created_at || (log as any).registered_at || Date.now()).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
