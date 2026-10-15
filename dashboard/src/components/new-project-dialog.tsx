import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// A project is one LiveKit project, added with its URL, API key and secret (decision 0016).
// The secret goes to VoiceGateway's server and is never kept in the browser; this form holds it only
// until it closes. Connecting needs the backend, which arrives in Phase 2.

export function NewProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate()
  const [url, setUrl] = useState("")
  const [key, setKey] = useState("")
  const [secret, setSecret] = useState("")
  const [observe, setObserve] = useState(false)
  const close = (o: boolean) => {
    if (!o) {
      setUrl("")
      setKey("")
      setSecret("")
      setObserve(false)
    }
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a LiveKit project</DialogTitle>
          <DialogDescription>
            Paste the URL and keys of a LiveKit Cloud project or your own server.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <Label htmlFor="lk-url">LiveKit URL</Label>
            <Input id="lk-url" placeholder="wss://your-project.livekit.cloud" value={url} onChange={(e) => setUrl(e.target.value)} autoComplete="off" spellCheck={false} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lk-key">API key</Label>
              <Input id="lk-key" placeholder="From Settings → Keys" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" spellCheck={false} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lk-secret">API secret</Label>
              <Input id="lk-secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="lk-observe">Observe live rooms</Label>
              <p className="text-xs text-muted-foreground">Reads each agent's models from live rooms as a hidden participant.</p>
            </div>
            <Switch id="lk-observe" checked={observe} onCheckedChange={setObserve} />
          </div>
        </form>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:items-stretch">
          <Button disabled title="Connecting needs the VoiceGateway backend (Phase 2)">Connect project</Button>
          <p className="text-center text-xs text-muted-foreground">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                close(false)
                navigate({ to: "/project" })
              }}
            >
              See an example project
            </button>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
