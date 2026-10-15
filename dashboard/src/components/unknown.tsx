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
