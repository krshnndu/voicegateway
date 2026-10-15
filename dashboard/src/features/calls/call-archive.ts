import { useSyncExternalStore } from "react"

// Archived calls leave the default list and its counts but stay one tab away; nothing is deleted.
// Kept in this browser until the Phase 2 server stores it.

const KEY = "vg.call-archive"
let archived: string[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]
  } catch {
    return []
  }
})()
const listeners = new Set<() => void>()
export function setArchived(next: string[]) {
  archived = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage is unavailable; the choice lasts for this page view.
  }
  listeners.forEach((l) => l())
}
export const useArchived = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => archived, () => archived)
