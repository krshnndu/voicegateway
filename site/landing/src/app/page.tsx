import type { Metadata } from 'next';
import { AnswerPreview, CallPathPreview, CapacityPreview, OutcomeIcons } from '@/components/console-preview/ProductVisuals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, GithubLogo, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import Nav from '@/components/Nav';
import SiteFooter from '@/components/SiteFooter';
import WaitlistForm from '@/components/WaitlistForm';
import styles from './page.module.css';

const V1_SOURCE = 'https://github.com/mahimailabs/voicegateway/tree/feat/phase01-console';
const title = 'VoiceGateway · See the whole call';
const description = 'The open-source profiler for LiveKit voice agents. Connect the phone line, media server, agent and models. Explore the interactive V1 console preview.';

export const metadata: Metadata = {
  title: { absolute: title }, description,
  alternates: { canonical: 'https://voicegateway.dev' },
  openGraph: { title, description, url: 'https://voicegateway.dev', type: 'website', siteName: 'VoiceGateway' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <h1 id="hero-title">Less guessing.<br /><span>Better calls.</span></h1>
            <p className={styles.heroLead}>Find what’s slowing down your <strong>LiveKit voice agents.</strong> See the whole call, understand the delay, and know where to look next.</p>
            <div className={styles.actions}>
              <Button asChild size="lg"><a href="#console">Explore the call path<ArrowRight data-icon="inline-end" /></a></Button>
              <Button asChild variant="ghost" size="lg"><a href={V1_SOURCE}><GithubLogo data-icon="inline-start" />Explore the source<ArrowUpRight data-icon="inline-end" /></a></Button>
            </div>
            <p className={styles.releaseNote}>Free to self-host. V1 in development.</p>
          </div>
          <div className={styles.heroStage}>
            <AnswerPreview />

          </div>
        </section>

        <div className={styles.principles}><OutcomeIcons /></div>

        <section className={styles.investigation} id="console" aria-labelledby="turn-title">
          <div className={styles.sectionCopy}>
            <h2 id="turn-title">One call.<br /><span>The whole picture.</span></h2>
            <p>A slow model? A phone connection? An agent that never joined? Follow the call across every layer and see where the evidence points.</p>
          </div>
          <CallPathPreview />
        </section>

        <section className={styles.capacitySection} aria-labelledby="capacity-title">
          <div className={styles.sectionCopy}>
            <h2 id="capacity-title">Know when<br /><span>your agent struggles.</span></h2>
            <p>See how answer times and missed joins change as calls increase. Make capacity decisions with a measured run in front of you.</p>
            <p className={styles.smallNote}>Explore the captured steps. Capacity testing is part of the V1 build.</p>
          </div>
          <CapacityPreview />
        </section>

        <section className={styles.delivery} id="cloud" aria-labelledby="delivery-title">
          <div className={styles.deliveryIntro}>
            <h2 id="delivery-title">Your calls.<br />Your choice.</h2>
            <p>Keep control with self-hosting.<br />Get a hosted workspace with Cloud.</p>
          </div>
          <div className={styles.deliveryOptions}>
            <article className={styles.selfHost}>
              <div className={styles.optionHeading}><h3>Self-hosted</h3><Badge variant="secondary">Free</Badge></div>
              <p>Keep your calls, traces and recordings on your infrastructure.</p>
              <ul><li>Your data stays with you</li><li>Source you can inspect and contribute to</li><li>Your team, one view of every call</li></ul>
              <Button asChild variant="outline" size="lg"><a href={V1_SOURCE}><GithubLogo data-icon="inline-start" />Follow the V1 build<ArrowUpRight data-icon="inline-end" /></a></Button>
              <p className={styles.optionNote}>The console is ready to explore. The backend is in development.</p>
            </article>
            <article className={styles.cloud}>
              <div className={styles.optionHeading}><h3>VoiceGateway Cloud</h3><Badge variant="secondary">With V1</Badge></div>
              <p>Spend your time improving your agents. Give your team a shared place to understand every call.</p>
              <ul><li>Follow problems across the whole call</li><li>Investigate with the same evidence</li><li>Keep your focus on the caller experience</li></ul>
              <WaitlistForm />
              <p className={styles.optionNote}>Coming with V1. Signup and pricing are not live yet.</p>
            </article>
          </div>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title">Before you dive in.</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="faq-1"><AccordionTrigger>What can I try today?</AccordionTrigger><AccordionContent>The interactive examples use captured LiveKit sessions. Select a turn, a call layer or a capacity step to inspect it, or run the console from the V1 source branch. The backend and hosted service are still in development.</AccordionContent></AccordionItem>
            <AccordionItem value="faq-2"><AccordionTrigger>Does it change how my agent runs?</AccordionTrigger><AccordionContent>VoiceGateway collects observability data alongside your stack. It is never in the live audio path, so your agent’s call can carry on if VoiceGateway is unavailable.</AccordionContent></AccordionItem>
            <AccordionItem value="faq-3"><AccordionTrigger>Does it record every call?</AccordionTrigger><AccordionContent>No. V1 recordings are opt-in per project. Self-hosted data stays on your infrastructure. Cloud stores data in your hosted workspace.</AccordionContent></AccordionItem>
            <AccordionItem value="faq-4"><AccordionTrigger>Why LiveKit first?</AccordionTrigger><AccordionContent>A useful call trace reaches beyond model requests. V1 focuses on LiveKit so SIP, rooms, agent jobs and conversation turns can be understood together.</AccordionContent></AccordionItem>
          </Accordion>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
