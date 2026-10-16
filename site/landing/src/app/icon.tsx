export const dynamic = 'force-static';
import { ImageResponse } from 'next/og';
import BrandMark from '@/components/BrandMark';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<div style={{ width: 32, height: 32, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BrandMark size={28} /></div>, size);
}
