'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track, trackPageview } from '@/lib/analytics';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => { void trackPageview(pathname); }, [pathname]);
  useEffect(() => {
    function click(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      const target = new URL(link.href);
      const name = target.hostname === 'github.com' ? 'github_click'
        : target.hostname === 'docs.voicegateway.dev' ? 'docs_click'
        : target.origin === location.origin && target.hash === '#console' ? 'console_preview_click'
        : target.origin === location.origin && target.hash === '#cloud' ? 'cloud_interest_click' : null;
      if (name) void track(name, { destination: target.origin + target.pathname });
    }
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);
  return children;
}
export default PostHogProvider;
