export const dynamic = 'force-static';
import { ImageResponse } from 'next/og';
import BrandMark from '@/components/BrandMark';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'VoiceGateway. See the whole call. The open-source profiler for LiveKit voice agents.';

export default function OgImage() {
  return new ImageResponse(
    <div style={{ width: 1200, height: 630, background: '#ffffff', display: 'flex', flexDirection: 'column', padding: '56px 68px', fontFamily: 'sans-serif', color: '#1d1d1f' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><BrandMark size={40} /><span style={{ fontSize: 28, fontWeight: 600 }}>VoiceGateway</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 66, fontSize: 82, lineHeight: 1.04, letterSpacing: '-3px', fontWeight: 600 }}>
        <span>See the</span><span>whole call.</span>
      </div>
      <div style={{ display: 'flex', marginTop: 32, fontSize: 24, color: '#6e6e73' }}>Phone line. Media server. Agent. Models. One call timeline.</div>
      <div style={{ display: 'flex', marginTop: 'auto', justifyContent: 'space-between', borderTop: '1px solid #d2d2d7', paddingTop: 24, fontSize: 18, color: '#6e6e73' }}><span>Open source · V1 in development</span><span>voicegateway.dev</span></div>
    </div>,
    { ...size },
  );
}
