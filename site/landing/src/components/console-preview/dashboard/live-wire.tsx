"use client"
/* eslint-disable @next/next/no-img-element */
// OSS node and edge renderers with an optional presentation sweep over captured evidence.
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, type Node as FlowNode, type Edge as FlowEdge, getBezierPath, type NodeProps } from "@xyflow/react"
import { Cloud, HardDrives, Phone, Robot, Users } from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"
import { motion, useInView } from "motion/react"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { Canvas } from "./canvas"
import { Node } from "./node"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { cn } from "@/lib/utils"
const fmtMs = (ms: number) => ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`
export type WireNode = { id: string; kind: "callers" | "phone" | "media" | "agent" | "provider"; title: string; sub: string; provider?: string; cloud?: boolean; issues?: number; tip?: string; y?: number }
export type WireLink = { id: string; from: string; to: string; calls: number; ms: number | null; msLabel?: string; issues: boolean; live: boolean; tip: string }
export type TrackerRow = { layer: string; blocks: { color: string; tooltip: string }[] }

const kindIcon: Record<WireNode["kind"], Icon> = { callers: Users, phone: Phone, media: HardDrives, agent: Robot, provider: Robot }
const column: Record<WireNode["kind"], number> = { callers: 0, phone: 250, media: 500, agent: 780, provider: 1110 }

const SignalContext = createContext(false)
const nodeDelay: Record<WireNode["kind"], number> = {callers:0,phone:0.8,media:1.6,agent:2.4,provider:3.2}
const edgeDelay: Record<string, number> = {"phone-in":0,"web-media":0,"phone-media":0.8,"media-agent":1.6,"agent-stt":2.4,"agent-model":2.4}
function subscribeVisibility(onChange: () => void) {
 document.addEventListener("visibilitychange",onChange)
 return () => document.removeEventListener("visibilitychange",onChange)
}
const pageVisible = () => document.visibilityState === "visible"
const serverVisible = () => true
function subscribeMotion(onChange: () => void) {
 const query = matchMedia("(prefers-reduced-motion: reduce)")
 query.addEventListener("change",onChange)
 return () => query.removeEventListener("change",onChange)
}
const reducedMotionEnabled = () => matchMedia("(prefers-reduced-motion: reduce)").matches



function WireNodeView({ data }: NodeProps<FlowNode<WireNode>>) {
  const animate = useContext(SignalContext)
  const I = data.kind === "agent" && data.cloud ? Cloud : kindIcon[data.kind]
  return (
    <Node handles={{ target: data.kind !== "callers", source: data.kind !== "provider" }} className={cn("w-48 rounded-xl", data.issues ? "ring-1 ring-destructive/40" : "")}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div className="flex items-center gap-2.5 p-2.5" initial={false}
            animate={{ backgroundColor: animate ? ["rgba(0,0,0,0)", "var(--color-accent-soft)", "rgba(0,0,0,0)"] : "rgba(0,0,0,0)" }}
            transition={animate ? {delay:nodeDelay[data.kind],duration:0.8,repeat:Infinity,repeatDelay:7.2,ease:[0.16,1,0.3,1]} : {duration:0}}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background">{data.provider ? <img src={`/brand/providers/${data.provider}.svg`} alt={data.title} width={17} height={17} /> : <I size={16} />}</span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-semibold">{data.title}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{data.sub}</span>
            </span>
            {data.issues ? <span className="ml-auto rounded-full bg-destructive px-1.5 text-[10px] font-medium text-white tnum">{data.issues}</span> : null}
          </motion.div>
        </TooltipTrigger>
        {data.tip && <TooltipContent className="max-w-72 text-xs leading-relaxed">{data.tip}</TooltipContent>}
      </Tooltip>
    </Node>
  )
}

function WireEdgeView({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<FlowEdge<WireLink>>) {
  const [path, lx, ly] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const animate = useContext(SignalContext)
  const d = data!
  const width = Math.min(1.5 + d.calls * 0.7, 10)
  return (
    <>
      <BaseEdge id={id} path={path} style={{ strokeWidth: width, stroke: d.issues ? "var(--destructive)" : "var(--muted-foreground)", strokeOpacity: d.issues ? 0.55 : 0.28 }} />
      {animate && <AnimatedBeam path={path} sourceX={sourceX} targetX={targetX} color={d.issues ? "var(--destructive)" : "var(--primary)"} delay={edgeDelay[id] ?? 0} />}
      <EdgeLabelRenderer>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "nodrag nopan pointer-events-auto absolute z-10 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap tnum",
                d.issues ? "border-destructive/40 text-destructive" : "text-muted-foreground",
                d.ms === null && !d.msLabel && "font-normal italic",
              )}
              style={{ transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)` }}
            >
              {(d.msLabel ?? (d.ms === null ? "not reported" : fmtMs(d.ms))).split(" · ").map((line, i) => (
                <span key={i} className="block leading-tight">
                  {line}
                </span>
              ))}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-72 text-xs leading-relaxed">{d.tip}</TooltipContent>
        </Tooltip>
      </EdgeLabelRenderer>
    </>
  )
}

const nodeTypes = { wire: WireNodeView }
const edgeTypes = { wire: WireEdgeView }

export function LiveWire({ nodes, links, paused = false }: { nodes: WireNode[]; links: WireLink[]; paused?: boolean }) {
 const container = useRef<HTMLDivElement>(null);
 const [width, setWidth] = useState(0);
 const inView = useInView(container, {amount:0.15});
 const reducedMotion = useSyncExternalStore(subscribeMotion,reducedMotionEnabled,serverVisible);
 const visible = useSyncExternalStore(subscribeVisibility,pageVisible,serverVisible);
 const animate = inView && visible && !reducedMotion && !paused;
 useEffect(() => {
   if (!container.current) return;
   const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
   observer.observe(container.current);
   return () => observer.disconnect();
 }, []);
 const flowNodes = useMemo<FlowNode<WireNode>[]>(() => nodes.map(n => ({id:n.id,type:"wire",position:{x:column[n.kind],y:n.y ?? 0},data:n,draggable:false,selectable:false})),[nodes]);
 const flowEdges = useMemo<FlowEdge<WireLink>[]>(() => links.map(l => ({id:l.id,source:l.from,target:l.to,type:"wire",data:l,selectable:false})),[links]);
 return <SignalContext.Provider value={animate}><div ref={container} className="h-[300px] min-w-[780px]"><Canvas key={width} nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{padding:0.08,minZoom:0.1}} minZoom={0.1} panOnScroll={false} zoomOnScroll={false} zoomOnPinch={false} preventScrolling={false} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} selectionOnDrag={false} deleteKeyCode={null}/></div></SignalContext.Provider>
}
