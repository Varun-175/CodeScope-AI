import type { ReactNode } from 'react'

type DashboardCardProps = {
  title: string
  className?: string
  description?: string
  children?: ReactNode
}

export function DashboardCard({
  title,
  className = '',
  description,
  children,
}: DashboardCardProps) {
  return (
    <section
      className={[
        'surface-glass animate-fade-in-up relative overflow-hidden rounded-lg p-5 transition duration-200 hover:border-violet-400/50',
        className,
      ].join(' ')}
    >
      <div className="mb-4 flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
          )}
        </div>
      </div>
      <div className="relative">{children}</div>
    </section>
  )
}

export function CardSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      <div className="skeleton-shimmer h-8 w-24 rounded-md bg-zinc-900" />
      <div className="skeleton-shimmer h-3 w-full rounded-full bg-zinc-900" />
      <div className="skeleton-shimmer h-3 w-2/3 rounded-full bg-zinc-900" />
    </div>
  )
}
