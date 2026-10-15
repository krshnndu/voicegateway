import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { Brain, HardDrives, Microphone, PhoneCall, SpeakerHigh, Waveform } from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Unknown } from "@/components/unknown"
import { listCalls } from "@/lib/api"
import { cn } from "@/lib/utils"
import probe from "@/mocks/network-probe.json"
import workers from "@/mocks/workers.json"
import { buildModel, fmtMs } from "@/features/call/call-model"
import { ProviderGlobe } from "./provider-globe"
import { TtfaWaterfall } from "./ttfa-waterfall"
import { StackSummary } from "@/features/overview/stack-summary"

// Where a number came from, one click away instead of a paragraph on the page.
function Source({ text, label }: { text: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-xs text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground">
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-96 text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  )
}

// The voice stack profiled layer by layer, as it is: the models and how far away they are, the agent
// workers and how full they get, the media server, and the phone bridge. Nothing is optimised or
// estimated here; every number comes from a captured call, a worker's metrics or a network probe.

function Layer({ n, icon: I, title, lede, children, aside }: { n: number; icon: Icon; title: string; lede: React.ReactNode; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t py-10 first:border-t-0 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-[-0.01em]" data-layer={n}>
          <I size={20} className="text-muted-foreground" />
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{lede}</p>
        {aside}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

const roleIcon: Record<string, Icon> = {
  stt: Microphone,
  llm: Brain,
  tts: SpeakerHigh,
  sfu: HardDrives,
}
const roleName: Record<string, string> = {
  stt: "Speech to text",
  llm: "LLM",
  tts: "Text to speech",
  sfu: "Media server",
}

function ModelsLayer() {
  const call = listCalls().find((c) => c.room === "vg-capture-1791864362")
  const model = useMemo(() => (call ? buildModel(call) : null), [call])
  const answered = model?.turns.filter((t) => t.userText !== null && t.e2eMs !== null) ?? []
  const slowest = answered.reduce((a, t) => ((t.e2eMs ?? 0) > (a?.e2eMs ?? 0) ? t : a), answered[0])
  const [turn, setTurn] = useState<number | null>(null)
  const shown = turn ?? slowest?.i ?? 1
  const far = probe.endpoints.filter((e) => e.tcpMs > 50)
  const near = probe.endpoints.filter((e) => e.tcpMs <= 50)
  const nearMax = Math.max(...near.map((e) => e.tcpMs))

  return (
    <Layer
      n={1}
      icon={Brain}
      title="Models"
      lede={
        <>
          Where each model runs, how far it is from the agent, and how a turn spends its time getting to first audio.
          {far.length > 0 && (
            <span className="mt-3 block text-foreground">
              {far.map((e) => `${roleName[e.role]} (${e.provider}) answers from ${e.place.split(",")[0]}`).join(", ")}, a {Math.round(far[0].tcpMs)} ms round trip. Everything else is within {Math.round(nearMax)} ms.
            </span>
          )}
        </>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-muted/40">
          <ProviderGlobe size={420} />
          <p className="absolute bottom-3 left-4 text-[11px] text-muted-foreground">Arcs: measured round trip from the agent's machine</p>
        </div>
        <div className="min-w-0 space-y-6">
          <ul className="divide-y rounded-2xl border">
            {probe.endpoints.map((e) => {
              const I = roleIcon[e.role]
              return (
                <li key={e.role} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                  <I size={18} className="text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {roleName[e.role]}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {e.provider}
                        {e.model ? ` ${e.model}` : ""}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.place} · {e.host}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-[15px] font-semibold tnum", e.tcpMs > 50 && "text-destructive")}>{fmtMs(e.tcpMs)}</p>
                    <p className="text-[11px] text-muted-foreground">round trip</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <Source label="How these were measured" text={probe.source} />
        </div>
      </div>

      {call && model && (
        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold">Time to first audio, turn by turn</h3>
              <p className="text-sm text-muted-foreground">
                From the captured call{" "}
                <Link to="/calls" className="text-primary hover:underline">
                  {call.room}
                </Link>
                . Hatching is the network round trip inside each model's time.
              </p>
            </div>
            <ToggleGroup type="single" variant="outline" size="sm" value={String(shown)} onValueChange={(v) => v && setTurn(Number(v))} aria-label="Turn">
              {answered.map((t) => (
                <ToggleGroupItem key={t.i} value={String(t.i)} className="px-2.5 text-xs tnum">
                  Turn {t.i + 1}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <TtfaWaterfall call={call} model={model} turn={shown} />
        </div>
      )}
    </Layer>
  )
}

const callsConfig = {
  calls: { label: "Calls running", color: "var(--chart-1)" },
} satisfies ChartConfig

function WorkersLayer() {
  const ws = workers.workers as {
    id: string
    samples: { t: string; activeJobs: number; load: number }[]
    loadThreshold: number
  }[]
  const n = Math.min(...ws.map((w) => w.samples.length))
  const series = Array.from({ length: n }, (_, i) => ({
    time: new Date(ws[0].samples[i].t).toLocaleTimeString([], {
      minute: "2-digit",
      second: "2-digit",
    }),
    calls: ws.reduce((a, w) => a + w.samples[i].activeJobs, 0),
  }))
  const peak = Math.max(...series.map((s) => s.calls))
  return (
    <Layer
      n={2}
      icon={Waveform}
      title="Agent workers"
      lede="How many calls the workers carry at once, and how close they are to refusing new ones."
      aside={
        <Link to="/agents" className="text-sm text-primary hover:underline">
          Open agent workers
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <dl className="space-y-5">
          <div>
            <dt className="text-xs text-muted-foreground">Workers</dt>
            <dd className="text-[28px] leading-tight font-semibold tnum">{ws.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Peak calls at once</dt>
            <dd className="text-[28px] leading-tight font-semibold tnum">{peak}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Capacity</dt>
            <dd className="text-[28px] leading-tight font-semibold">
              <Unknown why="On this shared machine the load did not follow the calls, so a capacity estimate would be a guess. A load test on a dedicated worker measures it." />
            </dd>
          </div>
        </dl>
        <ChartContainer config={callsConfig} className="h-56 w-full">
          <AreaChart data={series} margin={{ left: -16, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey="calls" type="stepAfter" stroke="var(--color-calls)" fill="var(--color-calls)" fillOpacity={0.12} isAnimationActive={false} />
          </AreaChart>
        </ChartContainer>
      </div>
      <div className="mt-3">
        <Source label="Where this comes from" text={workers.source} />
      </div>
    </Layer>
  )
}

function SfuLayer() {
  const sfu = probe.endpoints.find((e) => e.role === "sfu")
  const rows = [
    {
      name: "LiveKit Cloud",
      host: sfu?.host ?? "",
      kind: "Cloud",
      where: sfu?.place ?? "Unknown",
      hop: sfu?.tcpMs ?? null,
      state: "Reachable",
      ok: true,
    },
    {
      name: "Self-hosted",
      host: "livekit.mahimai.ca",
      kind: "Self-hosted",
      where: "Unknown",
      hop: null,
      state: "Unreachable: connection timed out (2026-10-13)",
      ok: false,
    },
  ]
  return (
    <Layer n={3} icon={HardDrives} title="Media server" lede="The SFU that carries the audio between the caller and the agent: where it runs and whether it answers. Rooms, participants and server load come with its webhooks and metrics.">
      <ul className="divide-y rounded-2xl border">
        {rows.map((r) => (
          <li key={r.name} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-6 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {r.name} <span className="font-normal text-muted-foreground">· {r.kind}</span>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {r.host} · {r.where}
              </p>
            </div>
            <p className={cn("flex items-center gap-1.5 text-sm", r.ok ? "" : "text-destructive")}>
              <span className={cn("size-2 rounded-full", r.ok ? "bg-good" : "bg-destructive")} />
              {r.state}
            </p>
            <div className="w-20 text-right">
              <p className="text-[15px] font-semibold tnum">{r.hop !== null ? fmtMs(r.hop) : <Unknown why="No response to measure" />}</p>
              <p className="text-[11px] text-muted-foreground">from the agent</p>
            </div>
          </li>
        ))}
      </ul>
    </Layer>
  )
}

function SipLayer() {
  return (
    <Layer n={4} icon={PhoneCall} title="Phone bridge" lede="SIP brings phone calls in from a carrier (Twilio, Telnyx, Asterisk) through LiveKit's SIP bridge. Each call gets a leg with its own setup time and end reason.">
      <p className="text-sm text-muted-foreground">
        Numbers, trunks, dispatch rules and their checks are on the{" "}
        <Link to="/sip" className="text-foreground underline-offset-4 hover:underline">
          Phone bridge
        </Link>{" "}
        page.
      </p>
    </Layer>
  )
}

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <StackSummary />
      <ModelsLayer />
      <WorkersLayer />
      <SfuLayer />
      <SipLayer />
    </div>
  )
}
