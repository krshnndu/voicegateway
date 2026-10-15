import { IssuesPage } from "@/features/issues/issues-page"
import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router"
import { AppShell } from "@/components/app-shell"
import { CallsPage } from "@/features/calls/calls-page"
import { OverviewPage } from "@/features/overview/overview"
import { ProjectPage } from "@/features/project/project-page"
import { AgentsPage } from "@/features/agents/agents-page"
import { LivePage } from "@/features/live/live-page"
import { AlertsPage } from "@/features/alerts/alerts-page"
import { IngressPage } from "@/features/ingress/ingress-page"
import { EgressPage } from "@/features/egress/egress-page"
import { SipPage } from "@/features/sip/sip-page"
import { MediaServerPage } from "@/features/media-server/media-server-page"

const root = createRootRoute({ component: AppShell })
const index = createRoute({
  getParentRoute: () => root,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/overview" })
  },
})
const project = createRoute({ getParentRoute: () => root, path: "/project", component: ProjectPage })
const overview = createRoute({ getParentRoute: () => root, path: "/overview", component: OverviewPage })
const agents = createRoute({ getParentRoute: () => root, path: "/agents", component: AgentsPage })
const egress = createRoute({ getParentRoute: () => root, path: "/egress", component: EgressPage })
const ingress = createRoute({ getParentRoute: () => root, path: "/ingress", component: IngressPage })
const calls = createRoute({ getParentRoute: () => root, path: "/calls", component: CallsPage })
const callRoute = createRoute({ getParentRoute: () => root, path: "/calls/$room", component: CallsPage })
const issues = createRoute({ getParentRoute: () => root, path: "/issues", component: IssuesPage })
const alerts = createRoute({ getParentRoute: () => root, path: "/alerts", component: AlertsPage })
const live = createRoute({ getParentRoute: () => root, path: "/live", component: LivePage })
const sfu = createRoute({ getParentRoute: () => root, path: "/sfu", component: MediaServerPage })
const sip = createRoute({ getParentRoute: () => root, path: "/sip", component: SipPage })
const settings = createRoute({ getParentRoute: () => root, path: "/settings", component: OverviewPage })

export const router = createRouter({
  routeTree: root.addChildren([index, project, overview, calls, callRoute, live, issues, alerts, agents, sfu, sip, egress, ingress, settings]),
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
