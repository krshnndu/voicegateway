export const dynamic = 'force-static';
import { ImageResponse } from 'next/og';
import BrandMark from '@/components/BrandMark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<div style={{ width: 180, height: 180, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BrandMark size={128} /></div>, size);
}
