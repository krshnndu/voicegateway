import type { Call } from "@/lib/api"

export function CallMeta({ call }: { call: Call }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 tnum">
      <span>{new Date(call.startedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "medium" })}</span>
      <span>{call.participantCount} participant{call.participantCount === 1 ? "" : "s"}</span>
    </span>
  )
}
