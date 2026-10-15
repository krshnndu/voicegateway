import { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { Bell, DownloadSimple, HardDrives, Phone, PhoneCall, Robot, UploadSimple } from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { listCalls } from "@/lib/api"
import { BUDGET_MS } from "@/lib/thresholds"
import { cn } from "@/lib/utils"
import egressRaw from "@/mocks/egress.json"
import ingressRaw from "@/mocks/ingress.json"
import sipRaw from "@/mocks/sip.json"
import { buildModel, fmtMs, median } from "@/features/call/call-model"
import { findingsFor } from "@/features/call/call-steps"
import { TEST_AGENTS, agents } from "@/features/agents/agents-model"
import { rules } from "@/features/alerts/alerts-model"
import { data as rooms, regionCity } from "@/features/media-server/room-drawer"
import { type SipData, checks as sipChecks, enc, routes } from "@/features/sip/sip-model"

// The whole stack on one screen: one tile per page, each with the number that matters and its
// state, built from the same data and checks as the page it opens. Failures we caused
// on purpose (our capture agent, the egress and ingress tests) are flagged but never reach the headline.

type Tone = "good" | "warn" | "bad"
type Tile = {
  to: "/calls" | "/alerts" | "/agents" | "/sfu" | "/sip" | "/egress" | "/ingress"
  icon: Icon
  title: string
  value: string
  note: string
  tone: Tone
}
const dot: Record<Tone, string> = {
  good: "bg-good",
  warn: "bg-amber-500",
  bad: "bg-destructive",
}

function useSummary() {
  return useMemo(() => {
    const calls = listCalls().filter((c) => !c.recording?.preview)
    const answers = calls.flatMap((c) =>
      buildModel(c)
        .turns.map((t) => t.responseMs)
        .filter((v): v is number => v !== null),
    )
    const p50 = median(answers)
    const withIssues = calls.filter((c) => findingsFor(c, buildModel(c)).some((f) => f.severity === "high" || f.severity === "medium")).length

    const alertRules = rules()
    const fired = alertRules.reduce((a, r) => a + r.events.length, 0)
    const active = alertRules.filter((r) => r.state).length

    const all = agents()
    const failed = all.flatMap((a) => a.jobs.filter((j) => j.failed).map(() => a.name ?? a.key))
    const failedReal = failed.filter((n) => !TEST_AGENTS.has(n)).length

    const regions = [...new Set(rooms.rooms.flatMap((r) => r.participants.map((p) => p.region)).filter((r): r is string => Boolean(r)))]

    const sip = sipRaw as unknown as SipData
    const sipRooms = rooms.rooms.filter((r) => r.participants.some((p) => p.kind === "sip"))
    const rows = routes(
      sip,
      sipRooms.flatMap((r) =>
        r.participants
          .filter((p) => p.sip)
          .map((p) => ({
            trunkId: p.sip!.trunkId,
            twilio: Boolean(p.sip!.twilio),
          })),
      ),
    )
    const numbers = new Set(rows.filter((r) => !r.wildcard).map((r) => r.number)).size
    const legs = [...sip.inbound.map((t) => enc(t.media.encryption)), ...sip.outbound.map((t) => enc(t.media.encryption))]
    const plain = legs.filter((l) => l === "RTP").length
    const sipHigh = sipChecks(sip, rows).filter((c) => c.severity === "high").length

    const eg = (egressRaw as unknown as { egress: { status: string }[] }).egress
    const lost = eg.filter((e) => e.status === "EGRESS_FAILED").length
    const ing = (ingressRaw as unknown as { ingress: { status: string }[] }).ingress
    const ingErr = ing.filter((i) => i.status === "ENDPOINT_ERROR").length

    const tiles: Tile[] = [
      {
        to: "/calls",
        icon: PhoneCall,
        title: "Calls",
        value: String(calls.length),
        note: p50 === null ? "Answer time unknown" : `median answer ${fmtMs(p50)} · ${withIssues} with issues`,
        tone: p50 !== null && p50 > BUDGET_MS ? "bad" : withIssues ? "warn" : "good",
      },
      {
        to: "/alerts",
        icon: Bell,
        title: "Alerts",
        value: String(fired),
        note: `would have fired · ${active} active now`,
        tone: active ? "warn" : fired ? "warn" : "good",
      },
      {
        to: "/agents",
        icon: Robot,
        title: "Agent workers",
        value: String(all.length),
        note: failed.length ? `${failed.length} failed ${failed.length === 1 ? "job" : "jobs"}${failedReal === 0 ? ", all on our test agent" : ""}` : "no failed jobs",
        tone: failedReal ? "bad" : failed.length ? "warn" : "good",
      },
      {
        to: "/sfu",
        icon: HardDrives,
        title: "Media server",
        value: String(rooms.rooms.length),
        note: `rooms watched · ${regions.map((r) => regionCity[r] ?? r).join(", ") || "region unknown"}`,
        tone: "good",
      },
      {
        to: "/sip",
        icon: Phone,
        title: "Phone bridge",
        value: String(numbers),
        note: `${numbers === 1 ? "number" : "numbers"} · ${legs.length - plain} of ${legs.length} legs encrypted`,
        tone: sipHigh ? "bad" : plain ? "warn" : "good",
      },
      {
        to: "/egress",
        icon: UploadSimple,
        title: "Egress",
        value: String(eg.length),
        note: lost ? `jobs · ${lost} ${lost === 1 ? "recording" : "recordings"} lost, in our test` : "jobs · none lost",
        tone: lost ? "warn" : "good",
      },
      {
        to: "/ingress",
        icon: DownloadSimple,
        title: "Ingress",
        value: String(ing.length),
        note: ingErr ? `endpoints · ${ingErr} in error, in our test` : "endpoints · no errors",
        tone: ingErr ? "warn" : "good",
      },
    ]
    return { calls: calls.length, p50, withIssues, fired, tiles }
  }, [])
}

export function StackSummary() {
  const s = useSummary()
  const bad = s.tiles.filter((t) => t.tone === "bad")
  return (
    <section className="space-y-6 pb-4">
      <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-balance">
        {s.calls} calls{s.p50 !== null ? `, answered in ${fmtMs(s.p50)}.` : "."}{" "}
        <span className="text-muted-foreground">{bad.length ? `${new Intl.ListFormat("en", { type: "conjunction" }).format(bad.map((t) => t.title))} ${bad.length === 1 ? "needs" : "need"} a look.` : "Nothing needs a look."}</span>
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {s.tiles.map((t) => (
          <Link key={t.to} to={t.to} className="group rounded-2xl border bg-background p-4 transition-colors hover:border-foreground/20 hover:bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <t.icon size={16} />
                {t.title}
              </span>
              <span className={cn("size-2 rounded-full", dot[t.tone])} aria-label={t.tone === "good" ? "Healthy" : t.tone === "warn" ? "Worth a look" : "Needs attention"} />
            </div>
            <p className="mt-2 text-[28px] leading-none font-semibold tracking-[-0.02em] tnum">{t.value}</p>
            <p className="mt-2 text-[12px] text-muted-foreground">{t.note}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
