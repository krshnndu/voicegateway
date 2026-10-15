import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Product page header: a plain title, one line of context, actions on the right.
export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// The one container on a page, built on shadcn Card. Never nested.
export function Panel({ title, description, actions, children, className, flush }: {
  title?: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <Card className={cn("gap-0 rounded-xl py-0 shadow-none", className)}>
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b px-5 py-3.5 [.border-b]:pb-3.5">
          <div className="space-y-0.5">
            {title && <CardTitle className="text-sm">{title}</CardTitle>}
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          {actions}
        </CardHeader>
      )}
      <CardContent className={flush ? "px-0" : "p-5"}>{children}</CardContent>
    </Card>
  )
}

// A row of measurements in one panel, divided by hairlines (not a grid of hero cards).
export function StatStrip({ stats }: { stats: { label: string; value: ReactNode; note?: ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border bg-card md:grid-cols-4 md:divide-x [&>*]:border-border">
      {stats.map((s, i) => (
        <div key={s.label} className={cn("space-y-1 px-5 py-4", i > 1 && "border-t md:border-t-0", i % 2 === 1 && "border-l md:border-l-0")}>
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className="text-2xl font-semibold tracking-[-0.02em] tnum">{s.value}</p>
          {s.note && <p className="text-xs text-muted-foreground">{s.note}</p>}
        </div>
      ))}
    </div>
  )
}

// Status as a dot plus a word, never color alone.
export function Status({ tone, children }: { tone: "good" | "bad" | "neutral" | "live"; children: ReactNode }) {
  const dot = { good: "bg-good", bad: "bg-destructive", neutral: "bg-muted-foreground/50", live: "bg-primary" }[tone]
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={cn("size-1.5 rounded-full", dot)} />
      {children}
    </span>
  )
}
