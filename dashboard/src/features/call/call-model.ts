import type { Call, SessionEvent, Span } from "@/lib/api"

// One shape for every call, whatever its source: agent session events (the observability upload or the console),
// a recording's speaker segments, or OTLP spans. Times are seconds from the call's first event.

export type Iv = { start: number; end: number }

export type Moment =
  | { kind: "interruption"; at: Iv; inferred: boolean; detectionMs: number }
  | { kind: "backchannel"; at: Iv; detectionMs: number }
  | { kind: "false_interruption"; t: number; resumed: boolean }
  | { kind: "tool"; at: Iv; name: string }

export type TurnModel = {
  i: number
  userText: string | null
  agentText: string | null
  interrupted: boolean
  utterance: Iv | null
  eot: { t: number; probability: number; threshold: number } | null
  wait: Iv | null
  thinking: Iv | null
  speaking: Iv | null
  ttftMs: number | null
  ttsMs: number | null
  eotMs: number | null
  e2eMs: number | null
  // Measured end-to-end latency when the agent reported it; otherwise caller stop to agent speech, derived.
  responseMs: number | null
  responseDerived: boolean
  window: Iv
}

export type Pipeline = "cascaded" | "realtime" | "text" | "unknown"

export type CallModel = {
  duration: number
  pipeline: Pipeline
  models: string[]
  source: "events" | "recording" | "spans" | "none"
  caller: Iv[]
  thinking: Iv[]
  speaking: Iv[]
  turns: TurnModel[]
  moments: Moment[]
}

export function intervals(events: SessionEvent[], type: "user_state" | "agent_state", state: string): Iv[] {
  const out: Iv[] = []
  let open: number | null = null
  for (const e of events) {
    if (e.type !== type) continue
    if (e.to === state && open === null) open = e.t
    else if (e.from === state && open !== null) {
      out.push({ start: open, end: e.t })
      open = null
    }
  }
  if (open !== null && events.length) out.push({ start: open, end: events[events.length - 1].t })
  return out
}

const pad = (iv: Iv, before: number, after: number): Iv => ({ start: Math.max(0, iv.start - before), end: iv.end + after })

function fromEvents(call: Call): Omit<CallModel, "pipeline" | "models" | "source"> {
  const ev = call.events ?? []
  const caller = intervals(ev, "user_state", "speaking")
  const thinking = intervals(ev, "agent_state", "thinking")
  const speaking = intervals(ev, "agent_state", "speaking")
  const raw = call.turns ?? []
  const turns: TurnModel[] = raw.map((t, i) => {
    const prevEnd = i > 0 ? (raw[i - 1].agentItemAt ?? 0) : 0
    const userAt = t.userItemAt ?? null
    const agentAt = t.agentItemAt ?? null
    // The caller's utterance: the last speech run before their message, joined with runs under 1.5 s apart.
    let utterance: Iv | null = null
    if (t.userText !== null && userAt !== null) {
      const runs = caller.filter((s) => s.end <= userAt + 0.05 && s.start >= prevEnd - 3)
      if (runs.length) {
        let k = runs.length - 1
        utterance = { ...runs[k] }
        while (k > 0 && utterance.start - runs[k - 1].end < 1.5) utterance.start = runs[--k].start
      }
    }
    const eotEv = ev.filter((e): e is Extract<SessionEvent, { type: "end_of_turn" }> => e.type === "end_of_turn" && userAt !== null && e.t <= userAt + 0.1 && e.t >= prevEnd)
    const eot = eotEv.length ? { t: eotEv[eotEv.length - 1].t, probability: eotEv[eotEv.length - 1].probability, threshold: eotEv[eotEv.length - 1].threshold } : null
    const think = userAt !== null ? (thinking.find((s) => s.start >= userAt - 0.1 && (agentAt === null || s.start <= agentAt)) ?? null) : null
    const from = think?.end ?? userAt ?? prevEnd
    const speak = speaking.find((s) => s.end >= from - 0.05 && (agentAt === null || s.start <= agentAt + 0.05) && s.start >= prevEnd - 0.05) ?? null
    const eotMs = t.endOfTurnMs ?? null
    const wait = utterance && eotMs !== null ? { start: utterance.end, end: utterance.end + eotMs / 1000 } : null
    const derived = utterance && speak ? Math.round((speak.start - utterance.end) * 1000) : null
    const first = utterance?.start ?? think?.start ?? speak?.start ?? prevEnd
    const last = Math.max(speak?.end ?? 0, agentAt ?? 0, first)
    return {
      i,
      userText: t.userText,
      agentText: t.agentText,
      interrupted: !!t.interrupted,
      utterance,
      eot,
      wait,
      thinking: think,
      speaking: speak,
      ttftMs: t.ttftMs,
      ttsMs: t.ttsMs,
      eotMs,
      e2eMs: t.e2eMs ?? null,
      responseMs: t.e2eMs ?? derived,
      responseDerived: t.e2eMs == null && derived !== null,
      window: pad({ start: first, end: last }, 0.5, t.interrupted ? 1.5 : 0.6),
    }
  })
  const moments: Moment[] = []
  for (const e of ev) {
    if (e.type === "overlapping_speech") {
      const at = { start: e.overlapStartedAt, end: Math.max(e.detectedAt, e.overlapStartedAt + 0.05) }
      moments.push(e.isInterruption ? { kind: "interruption", at, inferred: false, detectionMs: e.detectionDelay * 1000 } : { kind: "backchannel", at, detectionMs: e.detectionDelay * 1000 })
    }
  }
  // Realtime models send no overlapping-speech event; a reply flagged interrupted still shows where it was cut.
  for (const t of turns) {
    if (!t.interrupted || !t.speaking || moments.some((m) => m.kind === "interruption" && m.at.start >= t.speaking!.start && m.at.start <= t.speaking!.end)) continue
    const over = caller.find((s) => s.start > t.speaking!.start && s.start < t.speaking!.end)
    if (over) moments.push({ kind: "interruption", at: { start: over.start, end: t.speaking.end }, inferred: true, detectionMs: (t.speaking.end - over.start) * 1000 })
  }
  const duration = ev.length ? ev[ev.length - 1].t : call.durationSeconds
  return { duration, caller, thinking, speaking, turns, moments }
}

function fromRecording(call: Call): Omit<CallModel, "pipeline" | "models" | "source"> {
  const rec = call.recording!
  const caller = rec.segments.filter((s) => s.speaker === "caller").map((s) => ({ start: s.start, end: s.end }))
  const speaking = rec.segments.filter((s) => s.speaker === "agent").map((s) => ({ start: s.start, end: s.end }))
  const turns: TurnModel[] = (call.turns ?? []).map((t, i) => {
    const utterance = caller[i] ?? null
    const speak = speaking[i] ?? null
    const derived = utterance && speak ? Math.round((speak.start - utterance.end) * 1000) : null
    const first = utterance?.start ?? speak?.start ?? 0
    return {
      i, userText: t.userText, agentText: t.agentText, interrupted: !!t.interrupted, utterance, eot: null, wait: null, thinking: null, speaking: speak,
      ttftMs: t.ttftMs, ttsMs: t.ttsMs, eotMs: t.endOfTurnMs, e2eMs: t.e2eMs ?? null, responseMs: t.e2eMs ?? derived, responseDerived: t.e2eMs == null && derived !== null,
      window: pad({ start: first, end: speak?.end ?? first }, 0.5, 0.6),
    }
  })
  return { duration: rec.duration, caller, thinking: [], speaking, turns, moments: [] }
}

function fromSpans(call: Call): Omit<CallModel, "pipeline" | "models" | "source"> {
  const spans = call.spans ?? []
  const s = (x: Span): Iv => ({ start: x.startMs / 1000, end: (x.startMs + x.durationMs) / 1000 })
  const agentTurns = spans.filter((x) => x.name === "agent_turn")
  const speakingSpans = spans.filter((x) => x.name === "agent_speaking")
  const speaking = speakingSpans.map(s)
  const thinking = agentTurns.map((t, k) => ({ start: t.startMs / 1000, end: speaking[k]?.start ?? s(t).end }))
  const tools = spans.filter((x) => x.name === "function_tool")
  const turns: TurnModel[] = agentTurns.map((at, i) => {
    const t = call.turns?.[i]
    return {
      i, userText: t?.userText ?? null, agentText: t?.agentText ?? null, interrupted: !!t?.interrupted, utterance: null, eot: null, wait: null,
      thinking: thinking[i] ?? null, speaking: speaking[i] ?? null, ttftMs: t?.ttftMs ?? null, ttsMs: t?.ttsMs ?? null, eotMs: t?.endOfTurnMs ?? null,
      e2eMs: t?.e2eMs ?? null, responseMs: t?.e2eMs ?? null, responseDerived: false, window: pad(s(at), 0.3, 0.3),
    }
  })
  const duration = Math.max(0, ...spans.map((x) => (x.startMs + x.durationMs) / 1000))
  return { duration, caller: [], thinking, speaking, turns, moments: tools.map((x) => ({ kind: "tool" as const, at: s(x), name: x.attrs?.["lk.function_tool.name"] ?? x.name })) }
}

export function buildModel(call: Call): CallModel {
  const source: CallModel["source"] = call.events?.length ? "events" : call.recording ? "recording" : call.spans?.length ? "spans" : "none"
  const base =
    source === "events" ? fromEvents(call) : source === "recording" ? fromRecording(call) : source === "spans" ? fromSpans(call) : { duration: call.durationSeconds, caller: [], thinking: [], speaking: [], turns: [], moments: [] }
  // Tool calls come from function_tool spans whatever the main source is.
  if (source !== "spans") {
    for (const x of (call.spans ?? []).filter((x) => x.name === "function_tool")) {
      base.moments.push({ kind: "tool", at: { start: x.startMs / 1000, end: (x.startMs + x.durationMs) / 1000 }, name: x.attrs?.["lk.function_tool.name"] ?? x.name })
    }
  }
  const models = [...new Set((call.turns ?? []).map((t) => t.model).filter((m): m is string => !!m))]
  const turns = call.turns ?? []
  const pipeline: Pipeline = models.some((m) => m.includes("realtime"))
    ? "realtime"
    : turns.some((t) => t.ttsMs !== null || t.endOfTurnMs !== null)
      ? "cascaded"
      : turns.length
        ? "text"
        : "unknown"
  return { ...base, pipeline, models, source }
}

// Replies cut off by the caller: detected overlaps, or the reply's own interrupted flag when the model sent none.
export const interruptionCount = (m: CallModel) => Math.max(m.moments.filter((x) => x.kind === "interruption").length, m.turns.filter((t) => t.interrupted).length)

// The call's one length on screen: the room's, the same number the Calls list shows.
export const callLength = (call: Call, model: { duration: number }) => call.durationSeconds || model.duration

export const pipelineLabel: Record<Pipeline, string> = {
  cascaded: "Cascaded · STT, LLM, TTS",
  realtime: "Realtime · speech to speech",
  text: "Text only · LLM",
  unknown: "Pipeline unknown",
}

export const fmtSec = (s: number) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(2)} s`)
export const fmtMs = (v: number) => (v < 0.1 ? "<0.1 ms" : v >= 1000 ? `${(v / 1000).toFixed(2)} s` : `${v < 10 ? v.toFixed(1) : Math.round(v)} ms`)
export const median = (xs: number[]) => {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}
