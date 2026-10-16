import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description: 'VoiceGateway connects the phone line, media server, agent and models of a LiveKit call. Open source, free to self-host, with Cloud planned for V1.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className={styles.page}>
      <h1>A call is one story.<br /><span>Its logs should be, too.</span></h1>
      <p className={styles.lead}>When a voice agent is slow, silent or disconnected, the answer can be anywhere: the phone line, the room, the worker or the model. VoiceGateway brings those layers together around the call.</p>
      <section><h2>Built for the people running LiveKit.</h2><p>Developers need to understand what happened in a test call or production incident without stitching together five different logs. VoiceGateway is an open-source, self-hosted profiler built for that job.</p></section>
      <section><h2>Clear about what the data says.</h2><p>Unknown measurements stay unknown. Inferred values are labeled. Recordings are opt-in, and the observer stays outside the live audio path.</p></section>
      <section><h2>Self-hosted and Cloud, in V1.</h2><p>The console is built; the V1 platform is in development. Free self-hosting and a hosted service are planned for the same release. Cloud signup, Stripe billing and workspace activation will be self-serve.</p></section>
      <a className="btn-ghost" href="https://github.com/mahimailabs/voicegateway/tree/feat/phase01-console">Follow the build</a>
    </main>
  );
}
