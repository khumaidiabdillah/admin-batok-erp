'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scale, Package, Banknote, Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import KPICard from '@/components/KPICard'
import { fetchDashboardData } from './actions'
import type { DashboardData, PeriodFilter } from '@/lib/types'

function formatCurrency(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID')
}

function formatNumber(value: number): string {
  return value.toLocaleString('id-ID')
}

const periodLabels: { key: PeriodFilter; label: string }[] = [
  { key: 'harian', label: 'Harian' },
  { key: 'mingguan', label: 'Mingguan' },
  { key: 'bulanan', label: 'Bulanan' },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>('bulanan')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchDashboardData(period)
      setData(result)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Dashboard Analitik Produksi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ringkasan produksi dan keuangan PT Batok Kelapa
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
          {periodLabels.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p.key
                  ? 'bg-emerald-brand text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Hasil Produksi (Kg)"
          value={loading ? '...' : formatNumber(data?.totalProduksiKg ?? 0)}
          icon={Scale}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
        />
        <KPICard
          label="Total Karung Terkumpul"
          value={loading ? '...' : formatNumber(data?.totalKarung ?? 0)}
          icon={Package}
          iconColor="text-slate-700"
          iconBg="bg-slate-100"
        />
        <KPICard
          label="Total Pendapatan / Omzet"
          value={loading ? '...' : formatCurrency(data?.totalPendapatan ?? 0)}
          icon={Banknote}
          iconColor="text-amber-700"
          iconBg="bg-amber-50"
        />
        <KPICard
          label="Catatan Menunggu ACC"
          value={loading ? '...' : formatNumber(data?.pendingCount ?? 0)}
          icon={Clock}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Divisi Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Rekapitulasi Produksi per Tim/Divisi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-5 py-3 font-semibold text-slate-600">
                  Divisi
                </th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">
                  Jumlah Karyawan
                </th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">
                  Total Produksi (Kg)
                </th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">
                  Total Karung
                </th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">
                  Total Pendapatan
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : !data?.divisiSummaries.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Belum ada data produksi untuk periode ini
                  </td>
                </tr>
              ) : (
                data.divisiSummaries.map((d) => (
                  <tr
                    key={d.divisi}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {d.divisi}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(d.jumlah_karyawan)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(d.total_produksi_kg)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                      {formatNumber(d.total_karung)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-900">
                      {formatCurrency(d.total_pendapatan)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Grafik Produksi per Divisi
        </h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            Memuat grafik...
          </div>
        ) : !data?.divisiSummaries.length ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            Belum ada data untuk ditampilkan
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data.divisiSummaries.map((d) => ({
                divisi: d.divisi,
                'Produksi (Kg)': d.total_produksi_kg,
                Karung: d.total_karung,
              }))}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="divisi"
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Bar
                dataKey="Produksi (Kg)"
                fill="#047857"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                dataKey="Karung"
                fill="#D97706"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
