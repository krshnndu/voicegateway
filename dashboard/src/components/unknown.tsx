import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// The one way the console shows a value nothing reported. Never 0.
export function Unknown({ why }: { why: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help text-muted-foreground underline decoration-dotted underline-offset-4">Unknown</span>
      </TooltipTrigger>
      <TooltipContent>{why}</TooltipContent>
    </Tooltip>
  )
}

export function Value({ v, unit, why }: { v: number | null | undefined; unit?: string; why: string }) {
  if (v === null || v === undefined) return <Unknown why={why} />
  return (
    <span className="font-mono tabular-nums">
      {v}
      {unit && <span className="text-muted-foreground"> {unit}</span>}
    </span>
  )
}
