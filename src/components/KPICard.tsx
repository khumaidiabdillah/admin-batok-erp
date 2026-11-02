import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  delta?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
}

export default function KPICard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  delta,
  deltaType = 'neutral',
}: KPICardProps) {
  const deltaColorMap = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-slate-500',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          {delta && (
            <p className={`text-xs font-medium ${deltaColorMap[deltaType]}`}>
              {delta}
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}
