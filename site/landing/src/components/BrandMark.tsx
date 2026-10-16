export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden="true">
      <path fill="#1d1d1f" d="M16 24H80L136 80H240V104H128L16 48ZM16 232H80L136 176H240V152H128L16 208Z" />
      <path fill="#1f96aa" d="M16 104H96L128 120H240V136H128L96 152H16Z" />
    </svg>
  );
}
