import { useSyncExternalStore } from "react"

// What a person decided about an issue: resolved or ignored, and when. Kept in this browser until the
// Phase 2 server stores it. An issue resolved before it was last seen comes back as regressed.

export type IssueState = { state: "resolved" | "ignored"; at: number }
type Store = Record<string, IssueState>
const KEY = "vg.issue-state"
let store: Store = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store
  } catch {
    return {}
  }
})()
const listeners = new Set<() => void>()
export function setIssueStates(next: Store) {
  store = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage is unavailable; the choice lasts for this page view.
  }
  listeners.forEach((l) => l())
}
export const useIssueStates = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => store, () => store)

// Open unless resolved or ignored; resolved turns back to open (regressed) when seen again after.
export function statusOf(s: Store, id: string, lastSeen: number | null): { status: "open" | "resolved" | "ignored"; regressed: boolean; at?: number } {
  const x = s[id]
  if (!x) return { status: "open", regressed: false }
  if (x.state === "resolved" && lastSeen !== null && lastSeen * 1000 > x.at) return { status: "open", regressed: true, at: x.at }
  return { status: x.state, regressed: false, at: x.at }
}
