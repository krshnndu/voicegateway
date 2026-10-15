import { Robot as Bot, HardDrives as Server } from "@phosphor-icons/react"
import type { ComponentType } from "react"
import { PageHeader } from "@/components/page"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

function Placeholder(props: { title: string; tail: string; icon: ComponentType; heading: string; body: string }) {
  return (
    <>
      <PageHeader title={props.title.replace(/\.$/, "")} description={props.tail.replace(/\.$/, "")} />
      <Empty className="rounded-xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <props.icon />
          </EmptyMedia>
          <EmptyTitle>{props.heading}</EmptyTitle>
          <EmptyDescription>{props.body}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  )
}

export const SfuPage = () => (
  <Placeholder title="Media server." tail="Rooms, tracks and nodes." icon={Server} heading="Media server metrics come next"
    body="CPU, memory and packet stats from your LiveKit nodes, lined up with the calls they served. Coming in the SFU phase." />
)
export const AgentsPage = () => (
  <Placeholder title="Agent workers." tail="Who is answering your calls." icon={Bot} heading="Agent workers come next"
    body="Registered LiveKit Agents workers, their jobs, load and memory, and which calls each one served. Coming in the agents phase." />
)
