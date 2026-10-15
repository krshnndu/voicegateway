import { PageHeader } from "@/components/page"
import { Instruments } from "./instruments"

export function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" description="Default project · capture of 11 Oct 2026" />
      <Instruments />
    </>
  )
}
