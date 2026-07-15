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
        'animate-fade-in-up rounded-3xl border border-zinc-800/80 bg-zinc-950/95 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-zinc-950',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
          )}
        </div>
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
