"use client"

// Adapted from Magic UI Highlighter: https://magicui.design/docs/components/highlighter
import { useLayoutEffect, useRef } from "react"
import type React from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"
import { type RoughAnnotation } from "rough-notation/lib/model"

type AnnotationAction =
  | "highlight"
  | "underline"
  | "box"
  | "circle"
  | "strike-through"
  | "crossed-off"
  | "bracket"

interface HighlighterProps {
  children: React.ReactNode
  action?: AnnotationAction
  color?: string
  strokeWidth?: number
  animationDuration?: number
  iterations?: number
  padding?: number
  multiline?: boolean
  isView?: boolean
}

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation: RoughAnnotation | null = null
    let resizeObserver: ResizeObserver | null = null

    let active = true
    if (shouldShow && element) {
      const annotationConfig = {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
        animate: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      }

      // Measure after the handwriting face loads; resizing repositions the mark
      // without replaying its entrance or interrupting the surrounding controls.
      document.fonts.ready.then(() => {
        if (!active) return
        const currentAnnotation = annotate(element, annotationConfig)
        annotation = currentAnnotation
        currentAnnotation.show()
        let lastBounds = JSON.stringify(element.getBoundingClientRect())
        resizeObserver = new ResizeObserver(() => {
          const bounds = JSON.stringify(element.getBoundingClientRect())
          if (bounds === lastBounds) return
          lastBounds = bounds
          currentAnnotation.animate = false
          currentAnnotation.hide()
          currentAnnotation.show()
        })
        resizeObserver.observe(element)
        resizeObserver.observe(document.body)
      })
    }

    return () => {
      active = false
      annotation?.remove()
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ])

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  )
}
