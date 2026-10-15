import { useEffect, useMemo, useRef, useState } from "react"
import Globe, { type GlobeMethods } from "react-globe.gl"
import { MeshPhongMaterial } from "three"

// A pale dotted globe with labelled points and moving arcs, in the Clean Room palette. react-globe.gl
// draws it; this wrapper fixes the look so every page that shows geography shows it the same way.

export type GlobePoint = { lat: number; lng: number; label: string; detail?: string; tone?: "ink" | "accent" | "quiet" }
export type GlobeArc = { from: { lat: number; lng: number }; to: { lat: number; lng: number }; label: string; tone?: "accent" | "alert" | "quiet" }

const pointColor = { ink: "#1d1d1f", accent: "#0071e3", quiet: "#8e8e93" }
const arcColor = { accent: "#0071e3", alert: "#d70015", quiet: "#8e8e93" }

export function NetworkGlobe({ points, arcs, size = 420, view = { lat: 41, lng: -98, altitude: 1.9 } }: { points: GlobePoint[]; arcs: GlobeArc[]; size?: number; view?: { lat: number; lng: number; altitude: number } }) {
  const ref = useRef<GlobeMethods | undefined>(undefined)
  const [land, setLand] = useState<object[]>([])
  useEffect(() => {
    fetch("/globe/countries.geojson")
      .then((r) => r.json())
      .then((d) => setLand(d.features))
      .catch(() => setLand([]))
  }, [])
  const material = useMemo(() => new MeshPhongMaterial({ color: "#f5f5f7", emissive: "#ffffff", emissiveIntensity: 0.35, shininess: 0 }), [])
  const arcData = arcs.map((a) => ({ startLat: a.from.lat, startLng: a.from.lng, endLat: a.to.lat, endLng: a.to.lng, label: a.label, color: arcColor[a.tone ?? "accent"] }))
  const setView = () => {
    const g = ref.current
    if (!g) return
    g.pointOfView(view, 0)
    const c = g.controls() as { autoRotate: boolean; enableZoom: boolean }
    c.autoRotate = false
    c.enableZoom = false
  }
  useEffect(setView, [land.length])

  return (
    <Globe
      ref={ref}
      width={size}
      height={size}
      backgroundColor="rgba(0,0,0,0)"
      showAtmosphere
      atmosphereColor="#d2d2d7"
      atmosphereAltitude={0.12}
      globeMaterial={material}
      hexPolygonsData={land}
      hexPolygonResolution={3}
      hexPolygonMargin={0.45}
      hexPolygonUseDots
      hexPolygonColor={() => "#c7c7cc"}
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointColor={(p: object) => pointColor[(p as GlobePoint).tone ?? "accent"]}
      pointAltitude={0.012}
      pointRadius={0.55}
      pointLabel={(p: object) => {
        const x = p as GlobePoint
        return `<div style="font:12px -apple-system,system-ui;padding:4px 6px;background:#fff;color:#1d1d1f;border-radius:6px;box-shadow:0 2px 8px rgb(0 0 0/.12)"><b>${x.label}</b>${x.detail ? `<br/>${x.detail}` : ""}</div>`
      }}
      arcsData={arcData}
      arcColor={(a: object) => [(a as { color: string }).color, (a as { color: string }).color]}
      arcStroke={0.6}
      arcAltitudeAutoScale={0.35}
      arcDashLength={0.35}
      arcDashGap={0.15}
      arcDashAnimateTime={1600}
      arcLabel={(a: object) => (a as { label: string }).label}
      onGlobeReady={setView}
    />
  )
}
