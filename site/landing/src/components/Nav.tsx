'use client';

import Image from 'next/image';
import Link from 'next/link';
import { GithubLogo, BookOpen, List, Graph, Cloud, ArrowUpRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import styles from './Nav.module.css';

const links = [
  { href: '/#console', label: 'Console', icon: Graph },
  { href: '/#cloud', label: 'Cloud', icon: Cloud },
  { href: 'https://docs.voicegateway.dev', label: 'Docs', icon: BookOpen },
];
const github = 'https://github.com/mahimailabs/voicegateway';

export default function Nav() {
  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#main-content">Skip to content</a>
      <div className={styles.inner}>
        <Link href="/" aria-label="VoiceGateway home" className={styles.wordmark}>
          <Image src="/brand/wordmark.svg" width={168} height={28} alt="VoiceGateway" priority />
          <span className={styles.energy} aria-hidden="true" />
        </Link>
        <div className="min-[701px]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline"><List data-icon="inline-start" />Menu</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>{links.map(({ href, label, icon: Icon }) => <DropdownMenuItem asChild key={href}><Link href={href}><Icon />{label}</Link></DropdownMenuItem>)}</DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup><DropdownMenuItem asChild><a href={github}><GithubLogo />GitHub<ArrowUpRight className="ml-auto" /></a></DropdownMenuItem></DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <nav aria-label="Primary" className="hidden min-[701px]:flex items-center gap-1">
          {links.map(({ href, label }) => <Button asChild variant="ghost" key={href}><Link href={href}>{label}</Link></Button>)}
          <Button asChild variant="outline" className="ml-3"><a href={github}><GithubLogo weight="fill" data-icon="inline-start" />GitHub<ArrowUpRight data-icon="inline-end" /></a></Button>
        </nav>
      </div>
    </header>
  );
}
