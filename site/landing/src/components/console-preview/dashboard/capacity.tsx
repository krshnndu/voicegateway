"use client"
// Capacity chart from dashboard/src/features/agents/capacity.tsx, using its captured feasibility run.
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "./chart"
import raw from "./capacity.json"
export const capacityRun = raw
type Step = typeof raw.steps[number]
const JOIN_MS = 2000
const median = (xs: number[]) => xs.length ? [...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)] : null
const chartConfig = {
  inTime: { label: "Joined in time", color: "var(--primary)" },
  late: { label: `Joined after ${JOIN_MS / 1000} s`, color: "oklch(0.77 0.16 70)" },
  refused: { label: "Stayed pending", color: "var(--destructive)" },
  answer: { label: "Answer time (s)", color: "var(--foreground)" },
} satisfies ChartConfig

export function CapacityChart({ steps, all, ceiling }: { steps: Step[]; all: number[]; ceiling?: number | null }) {
  const rows = all.map((n) => {
    const s = steps.find((x) => x.step === n)
    if (!s) return { step: String(n) }
    const late = s.join_s.filter((j) => j * 1000 > JOIN_MS).length
    return { step: String(n), inTime: s.joined - late, late, refused: s.pending, answer: median(s.answer_s) }
  })
  const top = Math.max(...all)
  return (
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <ComposedChart data={rows} margin={{ top: 12, right: 4, left: -18, bottom: 0 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="step" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `${v}`} />
        <YAxis yAxisId="calls" tickLine={false} axisLine={false} allowDecimals={false} domain={[0, top]} width={40} />
        <YAxis yAxisId="answer" orientation="right" tickLine={false} axisLine={false} width={36} domain={[0, (max: number) => Math.max(2, Math.ceil(max + 0.5))]} tickFormatter={(v) => `${v}s`} />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent labelFormatter={(l) => `${l} calls at once`} />} />
        <Bar yAxisId="calls" dataKey="inTime" stackId="a" fill="var(--color-inTime)" radius={[0, 0, 4, 4]} isAnimationActive={false} />
        <Bar yAxisId="calls" dataKey="late" stackId="a" fill="var(--color-late)" isAnimationActive={false} />
        <Bar yAxisId="calls" dataKey="refused" stackId="a" fill="var(--color-refused)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        <Line yAxisId="answer" dataKey="answer" type="monotone" stroke="var(--color-answer)" strokeWidth={1.5} dot={{ r: 2.5, fill: "var(--background)", strokeWidth: 1.5 }} isAnimationActive={false} connectNulls />
        {ceiling ? <ReferenceLine yAxisId="calls" y={ceiling} stroke="var(--foreground)" strokeDasharray="4 4" label={{ value: `Observed joins: ${ceiling}`, position: "insideTopLeft", fontSize: 11, fill: "var(--foreground)" }} /> : null}
        <ChartLegend content={<ChartLegendContent />} />
      </ComposedChart>
    </ChartContainer>
  )
}
