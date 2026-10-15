"use client"
// Adapted from VoiceGateway dashboard/src/features/overview/visuals.tsx.
import { Gauge } from "./gauge/gauge"
import { GaugeZones } from "./gauge/arcs"
import { GaugeHub, GaugeNeedle } from "./gauge/needle"
import { GaugeTickLabels, GaugeTicks } from "./gauge/ticks"
import { motion } from "motion/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { cn } from "@/lib/utils"
const fmtMs = (ms: number) => ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`
// The Overview's own visuals. Each draws measured values only; a stage nobody reports is drawn as a
// hatched block that says so, never as a short bar.


// Median answer on a gauge-ui dial: green under two thirds of the budget, amber up to it, red past it.
// The needle sits on the measured median; the value is printed under the dial, outside the SVG.
export function AnswerGauge({ p50, budget, max = 5000 }: { p50: number | null; budget: number; max?: number }) {
  return (
    <Gauge transition={{ type: "tween", duration: 0.55, ease: [0.16, 1, 0.3, 1] }} value={p50 === null ? 0 : Math.min(p50, max)} min={0} max={max} startAngle={90} endAngle={270} padding={30} fit="content" className="w-full max-w-72">
      <GaugeZones
        width={14}
        gap={2}
        zones={[
          { to: budget * 0.67, color: "var(--good)" },
          { to: budget, color: "oklch(0.78 0.15 75)" },
          { to: max, color: "var(--destructive)" },
        ]}
      />
      <GaugeTicks count={10} length={6} width={1.5} offset={-16} opacity={0.35} />
      <GaugeTickLabels count={5} fontSize={15} offset={-38} color="var(--muted-foreground)" format={(v: number) => `${Math.round(v / 1000)}s`} />
      {p50 !== null && <GaugeNeedle length={0.66} width={5} color="var(--foreground)" />}
      <GaugeHub radius={9} color="var(--foreground)" />
    </Gauge>
  )
}

// Every turn as a dot on one 0 to 5 s line, stacked where they collide, red past the budget.
export type TurnDot = { ms: number; room: string; turn: number; agent: string }
export function TurnStrip({ dots, budget, max = 5000, onPick }: { dots: TurnDot[]; budget: number; max?: number; onPick?: (dot: TurnDot) => void }) {
  const bin = 120
  const stacks = new Map<number, number>()
  const placed = [...dots]
    .sort((a, b) => a.ms - b.ms)
    .map((d) => {
      const b = Math.floor(Math.min(d.ms, max) / bin)
      const level = stacks.get(b) ?? 0
      stacks.set(b, level + 1)
      return { ...d, level }
    })
  const top = Math.max(1, ...placed.map((p) => p.level + 1))
  const x = (ms: number) => `${(Math.min(ms, max) / max) * 100}%`
  return (
    <div className="space-y-2">
      <div className="relative" style={{ height: Math.max(64, top * 12 + 12) }}>
        <div className="absolute inset-y-0 right-0 rounded-r-lg bg-destructive/[0.06]" style={{ left: x(budget) }} />
        <div className="absolute inset-y-0 border-l border-dashed border-foreground/40" style={{ left: x(budget) }}>
          <span className="absolute -top-0.5 left-1.5 text-[10px] text-muted-foreground">{`${budget / 1000} s budget`}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
        {placed.map((d, k) => (
          <Tooltip key={k}>
            <TooltipTrigger asChild>
              <motion.button type="button" aria-label={`${fmtMs(d.ms)} · session ${d.room} · turn ${d.turn}`} onClick={() => onPick?.(d)}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: k * 0.015, duration: 0.3 }}
                className={cn("absolute size-2.5 -translate-x-1/2 rounded-full ring-2 ring-background", d.ms > budget ? "bg-destructive" : "bg-primary")}
                style={{ left: x(d.ms), bottom: 4 + d.level * 12 }}
              />
            </TooltipTrigger>
            <TooltipContent className="text-xs">{`${fmtMs(d.ms)} · turn ${d.turn} · ${d.room} · ${d.agent}`}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="relative h-3 text-[10px] text-muted-foreground tnum">
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <span key={v} className="absolute -translate-x-1/2" style={{ left: x(v * 1000) }}>{`${v}s`}</span>
        ))}
      </div>
    </div>
  )
}
