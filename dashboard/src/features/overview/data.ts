import { listCalls } from "@/lib/api"

// Everything the overview variants show, derived only from captured calls.
export function overviewData() {
  const calls = listCalls()
  const turns = calls.flatMap((c) => c.turns ?? [])
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  const nums = (xs: (number | null)[]) => xs.filter((v): v is number => v !== null)
  const starts = calls.map((c) => new Date(c.startedAt).getTime())
  const windowStart = Math.min(...starts)
  const windowEnd = Math.max(...calls.map((c) => new Date(c.endedAt).getTime()))
  const durations = calls.map((c) => c.durationSeconds).sort((a, b) => a - b)
  return {
    calls,
    turns,
    traced: calls.filter((c) => c.spans).length,
    // Turns counted from agent_turn spans; metrics exist only for calls whose spans carried them.
    turnCount: calls.reduce((a, c) => a + (c.spans ?? []).filter((s) => s.name === "agent_turn").length, 0),
    withMetrics: calls.filter((c) => c.turns?.length).length,
    ttftMs: avg(nums(turns.map((t) => t.ttftMs))),
    llmMs: avg(nums(turns.map((t) => t.llmMs))),
    medianSeconds: durations[Math.floor(durations.length / 2)],
    windowStart,
    windowEnd,
  }
}
