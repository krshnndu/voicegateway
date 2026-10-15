import { useState } from "react"
import { CalendarBlank } from "@phosphor-icons/react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

// One time range control for every page that lists things over time: preset buttons plus a custom
// range picker. Times are unix seconds.
// `now` is passed in so fixture pages anchor "last 15 minutes" to when they were captured.

export type TimeRange = { from: number; to: number; preset?: string }

const presets = [
  { id: "15m", label: "Last 15 minutes", s: 15 * 60 },
  { id: "1h", label: "Last hour", s: 3600 },
  { id: "6h", label: "Last 6 hours", s: 6 * 3600 },
  { id: "24h", label: "Last 24 hours", s: 24 * 3600 },
  { id: "7d", label: "Last 7 days", s: 7 * 86400 },
  { id: "30d", label: "Last 30 days", s: 30 * 86400 },
]

export const presetRange = (id: string, now: number): TimeRange => {
  const p = presets.find((x) => x.id === id) ?? presets[0]
  return { from: now - p.s, to: now, preset: p.id }
}

const pad = (n: number) => String(n).padStart(2, "0")
const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const at = (day: Date, time: string) => {
  const [h, m] = time.split(":").map(Number)
  const d = new Date(day)
  d.setHours(h || 0, m || 0, 0, 0)
  return d.getTime() / 1000
}
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

function rangeLabel(r: TimeRange) {
  const p = presets.find((x) => x.id === r.preset)
  if (p) return p.label
  const a = new Date(r.from * 1000)
  const b = new Date(r.to * 1000)
  const day = (d: Date) => d.toLocaleDateString([], { month: "short", day: "numeric" })
  return sameDay(a, b) ? `${day(a)}, ${hm(a)} to ${hm(b)}` : `${day(a)} ${hm(a)} to ${day(b)} ${hm(b)}`
}

export function TimeRangePicker({ value, onChange, now }: { value: TimeRange; onChange: (r: TimeRange) => void; now: number }) {
  const [open, setOpen] = useState(false)
  const [days, setDays] = useState<DateRange | undefined>()
  const [fromTime, setFromTime] = useState("00:00")
  const [toTime, setToTime] = useState("23:59")
  const reset = () => {
    const a = new Date(value.from * 1000)
    const b = new Date(value.to * 1000)
    setDays({ from: a, to: b })
    setFromTime(hm(a))
    setToTime(hm(b))
  }
  const custom = days?.from ? { from: at(days.from, fromTime), to: at(days.to ?? days.from, toTime) } : null
  const valid = custom !== null && custom.to > custom.from

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* The common case is one click: a preset. A custom range is the separate button beside it. */}
      <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={value.preset ?? ""} onValueChange={(v) => v && onChange(presetRange(v, now))}>
        {presets.map((p) => (
          <ToggleGroupItem key={p.id} value={p.id} aria-label={p.label} className="px-2.5 tnum data-[state=on]:bg-accent data-[state=on]:text-accent-foreground">
            {p.id}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Popover
        open={open}
        onOpenChange={(o) => {
          if (o) reset()
          setOpen(o)
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-1.5 font-normal", !value.preset && "border-primary/50 bg-accent text-accent-foreground")}>
            <CalendarBlank size={14} />
            {value.preset ? "Custom" : rangeLabel(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto space-y-3 p-3">
          <Calendar mode="range" resetOnSelect selected={days} onSelect={(r, day) => setDays(r?.from ? r : { from: day, to: day })} defaultMonth={days?.from} disabled={{ after: new Date(now * 1000) }} className="p-0" />
          <div className="grid grid-cols-2 gap-2">
            <Input type="time" aria-label="From time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
            <Input type="time" aria-label="To time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={!valid}
            onClick={() => {
              if (!custom) return
              onChange(custom)
              setOpen(false)
            }}
          >
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
