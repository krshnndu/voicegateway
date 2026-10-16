import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GithubLogo, BookOpen, Info, ShieldCheck, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <Link href="/" aria-label="VoiceGateway home"><Image src="/brand/wordmark.svg" width={168} height={28} alt="VoiceGateway" /></Link>
          <p>One call. The whole picture.</p>
        </div>
        <nav aria-label="Footer">
          <Button asChild variant="ghost"><a href="https://docs.voicegateway.dev"><BookOpen data-icon="inline-start" />Documentation<ArrowUpRight data-icon="inline-end" /></a></Button>
          <Button asChild variant="ghost"><a href="https://github.com/mahimailabs/voicegateway"><GithubLogo data-icon="inline-start" weight="fill" />GitHub<ArrowUpRight data-icon="inline-end" /></a></Button>
          <Button asChild variant="ghost"><Link href="/about"><Info data-icon="inline-start" />About</Link></Button>
          <Button asChild variant="ghost"><Link href="/privacy"><ShieldCheck data-icon="inline-start" />Privacy</Link></Button>
        </nav>
      </div>
      <Separator className="mx-auto mt-10 max-w-[1184px]" /><div className={styles.bottom}><span>© 2026 VoiceGateway</span><span>Built in the open.</span></div>
    </footer>
  );
}
