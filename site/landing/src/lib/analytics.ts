import type { PostHog } from 'posthog-js';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_s2dddKHsS4kEnJ925VzsKYQh8hYGdohzEadc8CUhkoxV';
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://m.mahimai.ca';
let pending: Promise<PostHog | null> | undefined;
let lastPage: string | undefined;

export function initializeAnalytics(): Promise<PostHog | null> {
  if (typeof window === 'undefined' || !['voicegateway.dev', 'www.voicegateway.dev'].includes(window.location.hostname) || !KEY) return Promise.resolve(null);
  pending ??= import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: HOST,
      ui_host: 'https://us.posthog.com',
      defaults: '2026-05-30',
      persistence: 'memory',
      person_profiles: 'identified_only',
      capture_pageview: false,
      autocapture: false,
      disable_surveys: true,
      disable_session_recording: true,
      before_send: event => {
        if (event) event.properties.site = 'voicegateway';
        return event;
      },
    });
    posthog.register({ site: 'voicegateway' });
    return posthog;
  }).catch(() => null);
  return pending;
}

export async function track(event: string, properties: Record<string, string> = {}): Promise<void> {
  try { (await initializeAnalytics())?.capture(event, { ...properties, site: 'voicegateway' }); } catch { /* Analytics never blocks the product. */ }
}

export async function trackPageview(path: string): Promise<void> {
  const client = await initializeAnalytics();
  if (!client || lastPage === path) return;
  lastPage = path;
  client.capture('$pageview', { $current_url: window.location.origin + path, $pathname: path, site: 'voicegateway' });
}
