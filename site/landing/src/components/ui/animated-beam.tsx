"use client"

// Adapted from Magic UI's Animated Beam. Reuses the React Flow edge path rather
// than measuring a second set of node anchors, so resizing keeps the beam aligned.
import { useId } from "react"
import { motion } from "motion/react"
import { BaseEdge } from "@xyflow/react"

export function AnimatedBeam({ path, sourceX, targetX, color, delay = 0 }: {
  path: string
  sourceX: number
  targetX: number
  color: string
  delay?: number
}) {
  const id = `signal-${useId().replace(/:/g, "")}`
  return <g aria-hidden="true" data-signal-beam>
    <BaseEdge path={path} interactionWidth={0} style={{ stroke: `url(#${id})`, strokeWidth: 2.5, strokeLinecap: "round", pointerEvents: "none" }} />
    <defs>
      <motion.linearGradient
        id={id}
        gradientUnits="userSpaceOnUse"
        y1="0" y2="0"
        initial={{ x1: sourceX - 90, x2: sourceX - 30 }}
        animate={{ x1: targetX + 30, x2: targetX + 90 }}
        transition={{ delay, duration: 1.1, repeat: Infinity, repeatDelay: 6.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <stop stopColor={color} stopOpacity="0" />
        <stop offset="45%" stopColor={color} stopOpacity="0.9" />
        <stop offset="65%" stopColor={color} />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </motion.linearGradient>
    </defs>
  </g>
}
