import { siDeepgram, siDiscord, siNaver, siOpentelemetry, siOpsgenie, siOvh, siPagerduty } from "simple-icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import anthropic from "@lobehub/icons-static-svg/icons/anthropic.svg"
import assemblyai from "@lobehub/icons-static-svg/icons/assemblyai-color.svg"
import aws from "@lobehub/icons-static-svg/icons/aws.svg"
import azure from "@lobehub/icons-static-svg/icons/azure-color.svg"
import baseten from "@lobehub/icons-static-svg/icons/baseten.svg"
import bedrock from "@lobehub/icons-static-svg/icons/bedrock-color.svg"
import cerebras from "@lobehub/icons-static-svg/icons/cerebras-color.svg"
import deepseek from "@lobehub/icons-static-svg/icons/deepseek-color.svg"
import elevenlabs from "@lobehub/icons-static-svg/icons/elevenlabs.svg"
import fal from "@lobehub/icons-static-svg/icons/fal-color.svg"
import fireworks from "@lobehub/icons-static-svg/icons/fireworks-color.svg"
import fishaudio from "@lobehub/icons-static-svg/icons/fishaudio.svg"
import gemini from "@lobehub/icons-static-svg/icons/gemini-color.svg"
import gemma from "@lobehub/icons-static-svg/icons/gemma-color.svg"
import google from "@lobehub/icons-static-svg/icons/google-color.svg"
import groq from "@lobehub/icons-static-svg/icons/groq.svg"
import kimi from "@lobehub/icons-static-svg/icons/kimi.svg"
import langchain from "@lobehub/icons-static-svg/icons/langchain-color.svg"
import livekit from "@lobehub/icons-static-svg/icons/livekit.svg"
import mcp from "@lobehub/icons-static-svg/icons/mcp.svg"
import claudecode from "@lobehub/icons-static-svg/icons/claudecode-color.svg"
import codex from "@lobehub/icons-static-svg/icons/codex-color.svg"
import cursor from "@lobehub/icons-static-svg/icons/cursor.svg"
import meta from "@lobehub/icons-static-svg/icons/meta-color.svg"
import microsoft from "@lobehub/icons-static-svg/icons/microsoft-color.svg"
import minimax from "@lobehub/icons-static-svg/icons/minimax-color.svg"
import mistral from "@lobehub/icons-static-svg/icons/mistral-color.svg"
import nova from "@lobehub/icons-static-svg/icons/nova-color.svg"
import nvidia from "@lobehub/icons-static-svg/icons/nvidia-color.svg"
import ollama from "@lobehub/icons-static-svg/icons/ollama.svg"
import openai from "@lobehub/icons-static-svg/icons/openai.svg"
import openrouter from "@lobehub/icons-static-svg/icons/openrouter-color.svg"
import perplexity from "@lobehub/icons-static-svg/icons/perplexity-color.svg"
import together from "@lobehub/icons-static-svg/icons/together-color.svg"
import xai from "@lobehub/icons-static-svg/icons/xai.svg"

// Brand logos for every provider in the LiveKit ecosystem (LiveKit Inference and the agent plugins):
// LLM, STT, TTS, realtime, VAD, turn detection and noise cancellation. Sources, in order: LobeHub's
// static SVGs (MIT), Simple Icons (CC0), then each brand's own site icon, saved under
// src/assets/providers. Monochrome marks are drawn as a mask in the text colour so they follow the theme.

const site = import.meta.glob<string>("../assets/providers/*", { eager: true, query: "?url", import: "default" })
const own = (slug: string) => Object.entries(site).find(([p]) => p.split("/").pop()!.startsWith(`${slug}.`))?.[1] ?? ""

type Logo = { name: string } & ({ src: string; mono?: boolean; invertDark?: boolean } | { si: { path: string; hex: string } })
export const providers: Record<string, Logo> = {
  openai: { name: "OpenAI", src: openai, mono: true },
  anthropic: { name: "Anthropic", src: anthropic, mono: true },
  google: { name: "Google", src: google },
  gemini: { name: "Google Gemini", src: gemini },
  gemma: { name: "Google Gemma", src: gemma },
  deepseek: { name: "DeepSeek", src: deepseek },
  moonshot: { name: "Moonshot AI (Kimi)", src: kimi, mono: true },
  xai: { name: "xAI", src: xai, mono: true },
  groq: { name: "Groq", src: groq, mono: true },
  mistral: { name: "Mistral AI", src: mistral },
  cerebras: { name: "Cerebras", src: cerebras },
  fireworks: { name: "Fireworks AI", src: fireworks },
  together: { name: "Together AI", src: together },
  ollama: { name: "Ollama", src: ollama, mono: true },
  openrouter: { name: "OpenRouter", src: openrouter },
  perplexity: { name: "Perplexity", src: perplexity },
  baseten: { name: "Baseten", src: baseten, mono: true },
  aws: { name: "Amazon Web Services", src: aws, mono: true },
  bedrock: { name: "Amazon Bedrock", src: bedrock },
  nova: { name: "Amazon Nova", src: nova },
  azure: { name: "Microsoft Azure", src: azure },
  microsoft: { name: "Microsoft", src: microsoft },
  langchain: { name: "LangChain", src: langchain },
  assemblyai: { name: "AssemblyAI", src: assemblyai },
  elevenlabs: { name: "ElevenLabs", src: elevenlabs, mono: true },
  fal: { name: "fal", src: fal },
  nvidia: { name: "NVIDIA", src: nvidia },
  meta: { name: "Meta", src: meta },
  fishaudio: { name: "Fish Audio", src: fishaudio, mono: true },
  minimax: { name: "MiniMax", src: minimax },
  livekit: { name: "LiveKit", src: livekit, mono: true },
  deepgram: { name: "Deepgram", si: siDeepgram },
  mcp: { name: "Model Context Protocol", src: mcp, mono: true },
  claudecode: { name: "Claude Code", src: claudecode },
  codex: { name: "Codex", src: codex },
  cursor: { name: "Cursor", src: cursor, mono: true },
  opentelemetry: { name: "OpenTelemetry", si: siOpentelemetry },
  slack: { name: "Slack", src: own("slack") },
  teams: { name: "Microsoft Teams", src: own("teams") },
  discord: { name: "Discord", si: siDiscord },
  pagerduty: { name: "PagerDuty", si: siPagerduty },
  opsgenie: { name: "Opsgenie", si: siOpsgenie },
  ovhcloud: { name: "OVHcloud", si: siOvh },
  clova: { name: "Naver Clova", si: siNaver },
  cartesia: { name: "Cartesia", src: own("cartesia") },
  rime: { name: "Rime", src: own("rime") },
  inworld: { name: "Inworld", src: own("inworld") },
  speechmatics: { name: "Speechmatics", src: own("speechmatics") },
  sarvam: { name: "Sarvam AI", src: own("sarvam"), mono: true },
  telnyx: { name: "Telnyx", src: own("telnyx") },
  letta: { name: "Letta", src: own("letta") },
  gladia: { name: "Gladia", src: own("gladia") },
  soniox: { name: "Soniox", src: own("soniox") },
  gnani: { name: "Gnani.ai", src: own("gnani"), invertDark: true },
  gradium: { name: "Gradium", src: own("gradium") },
  simplismart: { name: "Simplismart", src: own("simplismart") },
  slng: { name: "SLNG", src: own("slng") },
  smallestai: { name: "Smallest AI", src: own("smallest") },
  spitch: { name: "Spitch", src: own("spitch") },
  lmnt: { name: "LMNT", src: own("lmnt") },
  murf: { name: "Murf AI", src: own("murf") },
  neuphonic: { name: "Neuphonic", src: own("neuphonic") },
  resemble: { name: "Resemble AI", src: own("resemble") },
  respeecher: { name: "Respeecher", src: own("respeecher"), invertDark: true },
  speechify: { name: "Speechify", src: own("speechify") },
  kokoro: { name: "Kokoro (hexgrad)", src: own("kokoro") },
  asyncai: { name: "Async", src: own("async") },
  bland: { name: "Bland AI", src: own("bland") },
  cambai: { name: "CAMB.AI", src: own("camb") },
  ultravox: { name: "Ultravox", src: own("ultravox") },
  phonic: { name: "Phonic", src: own("phonic") },
  hume: { name: "Hume AI", src: own("hume") },
  silero: { name: "Silero", src: own("silero") },
  krisp: { name: "Krisp", src: own("krisp") },
  aicoustics: { name: "ai-coustics", src: own("aicoustics") },
}

// The provider behind a model name. LiveKit Inference ids carry it ("deepgram/nova-3"); plugin model
// names do not, so known model families map to their maker. No match stays unknown, never a guess.
const prefix: Record<string, string> = { "deepseek-ai": "deepseek", moonshotai: "moonshot", google: "gemini", spacexai: "xai", smallest: "smallestai" }
const families: [RegExp, string][] = [
  [/^gemma/, "gemma"],
  [/^(gemini|chirp)/, "gemini"],
  [/^(gpt|o\d|whisper|tts-1|chatgpt|davinci)/, "openai"],
  [/^claude/, "anthropic"],
  [/^grok/, "xai"],
  [/^(nova-\d|aura|flux)/, "deepgram"],
  [/^amazon\.nova|nova-sonic/, "nova"],
  [/^(sonic|ink)/, "cartesia"],
  [/^(universal|best|nano|slam)/, "assemblyai"],
  [/^(eleven|scribe)/, "elevenlabs"],
  [/^inworld/, "inworld"],
  [/^(s1|s2|speech-1\.)/, "fishaudio"],
  [/^(llama|meta-llama)/, "meta"],
  [/^(mistral|ministral|voxtral|codestral)/, "mistral"],
  [/^(mistv?\d*$|arcana|coda)/, "rime"],
  [/^(deepseek)/, "deepseek"],
  [/^(kimi|moonshot)/, "moonshot"],
  [/^kokoro/, "kokoro"],
  [/^(saarika|saaras|bulbul|sarvam)/, "sarvam"],
  [/^(fixie|ultravox)/, "ultravox"],
  [/^(aurora|blizzard)/, "lmnt"],
  [/^lightning/, "smallestai"],
]
export function providerOfModel(model: string | null | undefined): string | null {
  if (!model) return null
  const m = model.toLowerCase()
  if (m.includes("/")) {
    const p = m.split("/")[0]
    const key = prefix[p] ?? p
    if (key === "gemini" && m.includes("gemma")) return "gemma"
    if (providers[key]) return key
  }
  const bare = m.split("/").pop()!
  return families.find(([re]) => re.test(bare))?.[1] ?? null
}

// A provider's logo at a given size, with the brand (and the model, when given) in a tooltip.
export function ProviderLogo({ provider, model, size = 16, className }: { provider: string | null; model?: string | null; size?: number; className?: string }) {
  const logo = provider ? providers[provider] : undefined
  if (!logo) return model ? <span className={cn("text-[12px] text-muted-foreground", className)}>{model}</span> : null
  const mark =
    "si" in logo ? (
      <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={logo.name} className={className}>
        <path d={logo.si.path} fill={`#${logo.si.hex}`} />
      </svg>
    ) : logo.mono ? (
      <span
        role="img"
        aria-label={logo.name}
        className={cn("inline-block shrink-0 bg-foreground", className)}
        style={{ width: size, height: size, mask: `url("${logo.src}") center / contain no-repeat`, WebkitMask: `url("${logo.src}") center / contain no-repeat` }}
      />
    ) : (
      <img src={logo.src} alt={logo.name} width={size} height={size} className={cn("shrink-0 rounded-[3px] object-contain", logo.invertDark && "dark:invert", className)} />
    )
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help items-center">{mark}</span>
      </TooltipTrigger>
      <TooltipContent className="text-xs">{model ? `${logo.name} · ${model}` : logo.name}</TooltipContent>
    </Tooltip>
  )
}
