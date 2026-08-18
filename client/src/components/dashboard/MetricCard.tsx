import { useEffect, useState } from 'react'
import { CardSkeleton, DashboardCard } from './DashboardCard'

type MetricCardProps = {
  title: string
  value?: string
  detail?: string
  isLoading?: boolean
}

export function MetricCard({
  title,
  value,
  detail,
  isLoading = false,
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
        <div className="mt-5">
          <p className="font-mono text-3xl font-semibold tracking-tight text-white">
            {displayValue !== null ? `${displayValue}${suffix}` : value}
          </p>
          {detail && <p className="mt-2 text-sm text-zinc-500">{detail}</p>}
        </div>
      )}
    </DashboardCard>
  )
}
