import type { Metadata } from 'next';
import { PostHogProvider } from '@/components/PostHogProvider';
import './globals.css';

const title = 'VoiceGateway · See the whole call';
const description =
  'An open-source profiler for LiveKit voice agents. Follow the phone line, media server, agent and models in one call timeline.';

export const metadata: Metadata = {
  title: {
    default: title,
    template: '%s · VoiceGateway',
  },
  description,
  metadataBase: new URL('https://voicegateway.dev'),
  openGraph: {
    title,
    description,
    url: 'https://voicegateway.dev',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
