import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  title: string
  value?: string
  detail?: string
  icon?: LucideIcon
  isLoading?: boolean
  tone?: 'violet' | 'emerald' | 'amber' | 'sky' | 'red'
  trend?: { value: number; label: string }
  delay?: number
}

const toneStyles = {
  violet: {
    dot: 'bg-violet-400',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    icon: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    bar: 'from-violet-600 to-violet-400',
  },
  emerald: {
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    bar: 'from-emerald-600 to-emerald-400',
  },
  amber: {
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    bar: 'from-amber-600 to-amber-400',
  },
  sky: {
    dot: 'bg-sky-400',
    glow: 'shadow-[0_0_20px_rgba(14,165,233,0.12)]',
    icon: 'text-sky-400',
    iconBg: 'bg-sky-500/10',
    bar: 'from-sky-600 to-sky-400',
  },
  red: {
    dot: 'bg-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.12)]',
    icon: 'text-red-400',
    iconBg: 'bg-red-500/10',
    bar: 'from-red-600 to-red-400',
  },
}

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  isLoading = false,
  tone = 'violet',
  trend,
  delay = 0,
}: MetricCardProps) {
  const numericValue = value?.match(/^\d+(?:\.\d+)?/)?.[0]
  const suffix = value && numericValue ? value.slice(numericValue.length) : ''
  const [displayValue, setDisplayValue] = useState(0)
  const styles = toneStyles[tone]

  useEffect(() => {
    if (!numericValue) return
    const target = Number(numericValue)
    const started = performance.now()
    const duration = 600
    let frame = 0
    const tick = (time: number) => {
      const progress = Math.min((time - started) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [numericValue])

  if (isLoading) {
    return (
      <div className="neo-flat xl:col-span-3 p-5 space-y-4 animate-pulse">
        <div className="h-3 w-24 skeleton-shimmer rounded" />
        <div className="h-9 w-20 skeleton-shimmer rounded" />
        <div className="h-3 w-32 skeleton-shimmer rounded" />
      </div>
    )
  }

  return (
    <div
      className={`neo-flat xl:col-span-3 p-5 flex flex-col justify-between ${styles.glow} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${styles.iconBg}`}>
            <Icon className={`size-4 ${styles.icon}`} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold tracking-tight text-white">
          {numericValue ? `${displayValue}${suffix}` : (value ?? '—')}
        </p>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {detail && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs text-zinc-500">{detail}</p>
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full bg-gradient-to-r ${styles.bar} transition-all duration-1000`}
              style={{ width: typeof numericValue === 'string' ? `${Math.min(Number(numericValue), 100)}%` : '60%' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
