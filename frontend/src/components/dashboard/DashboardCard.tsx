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
        'rounded-lg border border-zinc-800 bg-zinc-950/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        className,
      ].join(' ')}
    >
      <div>
        <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
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
      <div className="h-8 w-24 animate-pulse rounded-md bg-zinc-900" />
      <div className="h-3 w-full animate-pulse rounded-full bg-zinc-900" />
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-zinc-900" />
    </div>
  )
}
