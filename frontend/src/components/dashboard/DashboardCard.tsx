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
        'animate-fade-in-up rounded-lg border border-zinc-800/90 bg-zinc-950/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.045)] transition duration-200 hover:border-zinc-700/90 hover:bg-zinc-950',
        className,
      ].join(' ')}
    >
      <div>
        <h2 className="text-sm font-semibold tracking-normal text-zinc-100">{title}</h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        )}
      </div>
      {children}
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
