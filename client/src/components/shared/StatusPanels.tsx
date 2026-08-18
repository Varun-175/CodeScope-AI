import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react'

export function LoadingState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-6">
      <div className="flex items-center gap-3">
        <Loader2 className="size-4 animate-spin text-violet-400" />
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon = Sparkles }: { title: string; description: string; icon?: typeof Sparkles }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50 px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  )
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-4 text-sm text-red-300">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0" />
        <span className="font-medium">{title}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-red-300/80">{description}</p>
    </div>
  )
}

export function SuccessToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-emerald-900/50 bg-emerald-950/80 px-4 py-3 text-sm text-emerald-300 shadow-lg">
      <CheckCircle2 className="size-4" />
      {message}
    </div>
  )
}
