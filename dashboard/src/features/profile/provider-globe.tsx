import { useMemo } from "react"
import { type GlobeArc, type GlobePoint, NetworkGlobe } from "@/components/network-globe"
import probe from "@/mocks/network-probe.json"

// Where the call's pieces are: the agent worker, the media server and each model provider, with the
// measured round trip from the agent drawn as an arc (red when far).

const roleName: Record<string, string> = { stt: "Speech to text", llm: "LLM", tts: "Text to speech", sfu: "Media server" }

export function ProviderGlobe({ size = 420 }: { size?: number }) {
  const agent = probe.agent
  const points = useMemo<GlobePoint[]>(() => {
    const seen = new Map<string, GlobePoint & { roles: string[] }>()
    seen.set(`${agent.lat},${agent.lng}`, { lat: agent.lat, lng: agent.lng, label: agent.label, roles: [], tone: "ink" })
    for (const e of probe.endpoints) {
      const k = `${e.lat},${e.lng}`
      const p = seen.get(k) ?? { lat: e.lat, lng: e.lng, label: e.place, roles: [], tone: "accent" as const }
      p.roles.push(roleName[e.role])
      seen.set(k, p)
    }
    return [...seen.values()].map((p) => ({ ...p, detail: p.roles.join(", ") }))
  }, [agent])
  const arcs: GlobeArc[] = probe.endpoints
    .filter((e, k, all) => all.findIndex((x) => x.host === e.host) === k)
    .map((e) => ({ from: agent, to: e, label: `${e.tcpMs} ms round trip to ${e.host}`, tone: e.tcpMs > 50 ? "alert" : "accent" }))
  return <NetworkGlobe points={points} arcs={arcs} size={size} />
}
