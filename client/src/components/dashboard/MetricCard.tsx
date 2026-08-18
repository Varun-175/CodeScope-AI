import { useEffect, useState } from 'react'
import { CardSkeleton, DashboardCard } from './DashboardCard'

type MetricCardProps = {
  title: string
  value?: string
  detail?: string
  isLoading?: boolean
  tone?: 'violet' | 'emerald' | 'amber' | 'blue'
}

export function MetricCard({
  title,
  value,
  detail,
  isLoading = false,
  tone = 'violet',
}: MetricCardProps) {
  const numericValue = value?.match(/^\d+/)?.[0]
  const suffix = value && numericValue ? value.slice(numericValue.length) : ''
  const [displayValue, setDisplayValue] = useState(numericValue ? 0 : null)

  useEffect(() => {
    if (!numericValue) {
      setDisplayValue(null)
      return
    }
    const target = Number(numericValue)
    const started = performance.now()
    const duration = 400
    let frame = 0
    const tick = (time: number) => {
      const progress = Math.min((time - started) / duration, 1)
      setDisplayValue(Math.round(target * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [numericValue])

  return (
    <DashboardCard title={title} className="min-h-32 xl:col-span-3">
      {isLoading && <CardSkeleton />}
      {!isLoading && value && (
        <>
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {displayValue !== null ? `${displayValue}${suffix}` : value}
            </p>
            <span className={['mb-1 size-2 rounded-full', { violet: 'bg-violet-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400', blue: 'bg-sky-400' }[tone]].join(' ')} />
          </div>
          {detail && <p className="mt-2 text-sm text-zinc-500">{detail}</p>}
        </>
      )}
    </DashboardCard>
  )
}
