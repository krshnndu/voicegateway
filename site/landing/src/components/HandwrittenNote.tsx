'use client';

import type { ReactNode } from 'react';
import { ArrowBendRightDown } from '@phosphor-icons/react';
import { Highlighter } from '@/components/ui/highlighter';
import { cn } from '@/lib/utils';

export function HandwrittenNote({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-3 whitespace-nowrap font-handwriting text-2xl leading-none text-foreground', className)}>
    <Highlighter action="circle" color="var(--muted-foreground)" strokeWidth={1} iterations={1} padding={6} animationDuration={700} isView>{children}</Highlighter>
    <ArrowBendRightDown size={23} weight="light" aria-hidden="true" />
  </span>;
}
