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

export function EmptyCardContent() {
  return (
    <div className="mt-6 flex min-h-16 items-center rounded-md border border-dashed border-zinc-800 px-4 text-sm text-zinc-600">
      Waiting for repository analysis
    </div>
  )
}
