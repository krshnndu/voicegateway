import { useState, useSyncExternalStore } from "react"
import { Plus, Tag, X } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Tags group calls ("refund flow", "regression", "demo"). Until the Phase 2 server stores them they live
// in this browser only, keyed by room; the UI says so. Reading storage can fail (private windows), so
// every access is guarded and the tags simply start empty.

const KEY = "vg.call-tags"
type Store = Record<string, string[]>
let cache: Store | null = null
const listeners = new Set<() => void>()

function read(): Store {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store
  } catch {
    cache = {}
  }
  return cache
}
function write(next: Store) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage is unavailable; the tags last for this page view only.
  }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l))

export function useCallTags() {
  const store = useSyncExternalStore(subscribe, read, read)
  const all = [...new Set(Object.values(store).flat())].sort((a, b) => a.localeCompare(b))
  return {
    of: (room: string) => store[room] ?? [],
    all,
    add: (room: string, tag: string) => {
      const t = tag.trim().toLowerCase()
      if (!t || (store[room] ?? []).includes(t)) return
      write({ ...store, [room]: [...(store[room] ?? []), t] })
    },
    remove: (room: string, tag: string) => write({ ...store, [room]: (store[room] ?? []).filter((x) => x !== tag) }),
    count: (tag: string) => Object.values(store).filter((ts) => ts.includes(tag)).length,
    // Renaming onto an existing tag merges the two.
    rename: (from: string, to: string) => {
      const t = to.trim().toLowerCase()
      if (!t || t === from) return
      write(Object.fromEntries(Object.entries(store).map(([room, ts]) => [room, [...new Set(ts.map((x) => (x === from ? t : x)))]])))
    },
    // A copy of every call's tags, so a change can be undone.
    snapshot: (): Store => JSON.parse(JSON.stringify(store)) as Store,
    restore: (s: Store) => write(s),
    drop: (tag: string) => write(Object.fromEntries(Object.entries(store).map(([room, ts]) => [room, ts.filter((x) => x !== tag)]))),
  }
}

export function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-muted pr-1.5 pl-2 text-[12px] text-muted-foreground">
      <Tag size={11} />
      {tag}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove tag ${tag}`} className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 hover:text-foreground">
          <X size={10} weight="bold" />
        </button>
      )}
    </span>
  )
}

// The call's tags with a picker that reuses existing tags or creates a new one.
export function CallTags({ room }: { room: string }) {
  const tags = useCallTags()
  const mine = tags.of(room)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const fresh = q.trim().toLowerCase()
  const add = (t: string) => {
    tags.add(room, t)
    setQ("")
    setOpen(false)
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {mine.map((t) => (
        <TagChip
          key={t}
          tag={t}
          onRemove={() => {
            const before = tags.snapshot()
            tags.remove(room, t)
            toast(`Removed tag "${t}"`, { action: { label: "Undo", onClick: () => tags.restore(before) } })
          }}
        />
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 gap-1 rounded-full px-2 text-[12px] text-muted-foreground">
            <Plus size={11} weight="bold" /> {mine.length ? "Tag" : "Add tag"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-60 p-0">
          <Command>
            <CommandInput placeholder="Find or create a tag" value={q} onValueChange={setQ} />
            <CommandList>
              <CommandEmpty>{fresh ? "No tag yet. Press Enter to create it." : "No tags yet."}</CommandEmpty>
              {tags.all.filter((t) => !mine.includes(t)).length > 0 && (
                <CommandGroup heading="Tags">
                  {tags.all
                    .filter((t) => !mine.includes(t))
                    .map((t) => (
                      <CommandItem key={t} value={t} onSelect={() => add(t)}>
                        <Tag size={13} /> {t}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {fresh && !tags.all.includes(fresh) && (
                <CommandGroup>
                  <CommandItem value={`create ${fresh}`} onSelect={() => add(fresh)}>
                    <Plus size={13} /> Create "{fresh}"
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
          <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">Saved in this browser until the server stores tags (Phase 2).</p>
        </PopoverContent>
      </Popover>
    </div>
  )
}
