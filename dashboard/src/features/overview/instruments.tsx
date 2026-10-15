import { BUDGET_MS } from "@/lib/thresholds"
import { Gauge, GaugeArc, GaugeText, GaugeTrack, GaugeValue } from "@/components/gauge"
import { Panel, Status } from "@/components/page"
import { Badge } from "@/components/ui/badge"
import { overviewData } from "./data"

// Architecture-aware instruments.
// One number true for every LiveKit agent (response latency), then per agent the stages
// its pipeline actually has. A stage that does not exist is not drawn; a stage that exists
// but did not report shows Unknown.

type Pipeline = "cascaded" | "realtime" | "half-cascade" | "text-only"
const pipelineLabel: Record<Pipeline, string> = {
  cascaded: "Cascaded · STT, LLM, TTS",
  realtime: "Realtime · speech to speech",
  "half-cascade": "Half-cascade · realtime model + TTS",
  "text-only": "Text only · LLM",
}
const stagesFor: Record<Pipeline, string[]> = {
  cascaded: ["Turn detection", "Speech to text", "LLM first token", "TTS first audio"],
  realtime: ["Turn detection", "Model first token", "Model response"],
  "half-cascade": ["Turn detection", "Model first token", "TTS first audio"],
  "text-only": ["LLM first token", "LLM response"],
}

// The dial scale is a setting (the turn budget), not a measurement.

function Dial({ value, max, size = "sm", unknownLabel = "Unknown" }: { value: number | null; max: number; size?: "sm" | "lg"; unknownLabel?: string }) {
  const measured = value !== null
  return (
    <Gauge value={measured ? Math.min(value, max) : 0} min={0} max={max} startAngle={50} endAngle={310} padding={20} fit="content" className={size === "lg" ? "w-full max-w-64" : "w-full max-w-36"}>
      <GaugeTrack width={size === "lg" ? 20 : 16} color="var(--muted-foreground)" opacity={0.12} />
      {measured && <GaugeArc width={size === "lg" ? 20 : 16} color="var(--primary)" />}
      {measured ? (
        <GaugeValue y={8} fontSize={size === "lg" ? 72 : 60} format={(v) => (value! > max ? `>${max}` : v.toFixed(0))} className="fill-foreground" />
      ) : (
        <GaugeText y={8} fontSize={size === "lg" ? 44 : 36} className="fill-muted-foreground">{unknownLabel}</GaugeText>
      )}
      <GaugeText y={66} fontSize={24} className="fill-muted-foreground">{measured ? "ms" : "not reported"}</GaugeText>
    </Gauge>
  )
}

function AgentRow({ name, pipeline, values, sessions, metricSessions, note }: { name: string; pipeline: Pipeline; values: Record<string, number | null> | null; sessions: number; metricSessions?: number; note?: string }) {
  const stages = stagesFor[pipeline]
  return (
    <Panel
      title={name}
      description={values ? `${sessions} sessions with agent spans${metricSessions !== undefined && metricSessions < sessions ? `, model metrics from ${metricSessions}` : ""}` : "No sessions captured yet"}
      actions={<Badge variant="outline" className="font-normal">{pipelineLabel[pipeline]}</Badge>}
    >
      {values ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stages.map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <Dial value={values[s] ?? null} max={BUDGET_MS} />
              <p className="text-sm font-medium">{s}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 opacity-60 sm:grid-cols-4">
          {stages.map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <Dial value={null} max={BUDGET_MS} unknownLabel="No data" />
              <p className="text-sm font-medium">{s}</p>
            </div>
          ))}
        </div>
      )}
      {note && <p className="mt-4 text-xs text-muted-foreground">{note}</p>}
    </Panel>
  )
}

export function Instruments() {
  const d = overviewData()
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Panel title="Response latency" description="User stops speaking until the agent starts answering. True for every pipeline.">
          <div className="flex flex-col items-center gap-2">
            <Dial value={null} max={1500} size="lg" />
            <p className="max-w-64 text-center text-xs text-muted-foreground">Not measurable in this capture: the session was text only, so nobody stopped speaking.</p>
          </div>
        </Panel>
        <Panel title="Turn-taking" description="Whether the conversation feels natural">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
            <div><dt className="text-muted-foreground">Calls</dt><dd className="text-2xl font-semibold tnum">{d.calls.length}</dd></div>
            <div><dt className="text-muted-foreground">With agent traces</dt><dd className="text-2xl font-semibold tnum">{d.traced} / {d.calls.length}</dd></div>
            <div><dt className="text-muted-foreground">Interruptions per call</dt><dd className="text-2xl font-semibold text-muted-foreground">Unknown</dd></div>
            <div><dt className="text-muted-foreground">Turn detection delay</dt><dd className="text-2xl font-semibold text-muted-foreground">Unknown</dd></div>
            <div><dt className="text-muted-foreground">Median call length</dt><dd className="text-2xl font-semibold tnum">{d.medianSeconds} s</dd></div>
            <div><dt className="text-muted-foreground">Agent turns</dt><dd className="text-2xl font-semibold tnum">{d.turnCount}</dd></div>
          </dl>
        </Panel>
      </div>

      <div className="space-y-1 pt-2">
        <h2 className="text-lg font-semibold">Agents</h2>
        <p className="text-sm text-muted-foreground">
          Each agent shows only the stages its pipeline has, detected from the metrics it reports. Dials run to the {BUDGET_MS} ms answer budget set in Settings, a setting rather than a measurement.
        </p>
      </div>

      <AgentRow
        name="agent (spike capture)"
        pipeline="text-only"
        sessions={d.traced}
        metricSessions={d.withMetrics}
        values={{ "LLM first token": d.ttftMs, "LLM response": d.llmMs }}
        note="Speech stages are not drawn: this agent ran text-only, so speech to text and text to speech never existed in its sessions."
      />
      <AgentRow name="Realtime agents" pipeline="realtime" sessions={0} values={null} note="Appears when an agent reports RealtimeModelMetrics (for example GPT-Live or Gemini Live). Shows audio and text tokens in and out alongside latency." />
      <AgentRow name="Half-cascade agents" pipeline="half-cascade" sessions={0} values={null} note="Appears when a realtime model is paired with a separate TTS." />

      <Panel title="Transport" description="The same for every pipeline">
        <div className="grid gap-6 text-sm sm:grid-cols-2">
          <div className="space-y-1"><p className="font-medium">Media server</p><Status tone="good">{d.calls.length} rooms from LiveKit webhooks</Status></div>
          <div className="space-y-1"><p className="font-medium">SIP</p><Status tone="neutral">Not connected</Status></div>
        </div>
      </Panel>
    </div>
  )
}
