"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/* ── TypingAnimation ── */

interface TypingAnimationProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  /** ms per character while typing */
  charDelay?: number;
  onDone?: () => void;
}

export function TypingAnimation({
  children,
  className,
  delay = 0,
  charDelay = 28,
  onDone,
}: TypingAnimationProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(children.slice(0, i));
      if (i >= children.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, charDelay);
    return () => clearInterval(interval);
  }, [started, children, charDelay, onDone]);

  return (
    <span className={cn("font-mono", className)}>
      {displayed}
      {displayed.length < children.length && started && (
        <span
          className="inline-block w-[2px] h-[1em] bg-current align-middle"
          style={{ animation: "vg-blink 0.75s step-end infinite" }}
        />
      )}
    </span>
  );
}

/* ── AnimatedSpan ── */

interface AnimatedSpanProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSpan({ children, className, delay = 0 }: AnimatedSpanProps) {
  return (
    <motion.span
      className={cn("block font-mono", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.3 }}
    >
      {children}
    </motion.span>
  );
}

/* ── Terminal ── */

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Terminal({ children, className, title = "bash" }: TerminalProps) {
  return (
    <div
      className={cn("rounded-xl overflow-hidden", className)}
      style={{
        border: "1px solid rgba(20,184,196,0.18)",
        boxShadow:
          "0 1px 3px rgba(10,13,16,0.06), 0 12px 32px -16px rgba(20,184,196,0.18)",
        background: "#0c1f24",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "#0f2b30",
        }}
      >
        <span style={{ display: "inline-flex", gap: 6 }}>
          {(["#ff6b5c", "#f4c152", "#3dd68c"] as const).map((c) => (
            <span
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
                flexShrink: 0,
              }}
            />
          ))}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "rgba(207,238,242,0.45)",
            marginLeft: 4,
          }}
        >
          {title}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "18px 20px",
          display: "grid",
          gap: 4,
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes vg-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
