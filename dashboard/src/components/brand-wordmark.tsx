import wordmark from "@/assets/brand/wordmark.svg"
import wordmarkDark from "@/assets/brand/wordmark-dark.svg"
import "./brand-wordmark.css"

export function BrandWordmark() {
  return (
    <span className="brand-wordmark inline-block group-data-[collapsible=icon]:hidden">
      <img src={wordmark} alt="VoiceGateway" width={168} height={28} className="block size-full dark:hidden" />
      <img src={wordmarkDark} alt="VoiceGateway" width={168} height={28} className="hidden size-full dark:block" />
      <span aria-hidden="true" className="brand-wordmark__energy" style={{ maskImage: `url("${wordmark}")` }} />
    </span>
  )
}
