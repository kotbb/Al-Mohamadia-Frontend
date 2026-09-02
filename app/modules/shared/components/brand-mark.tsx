interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Al-Mohamadia system mark — gold tree emblem (square crop).
 */
export function BrandMark({ size = 40, className = "" }: BrandMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/icon-mark.png"
      alt="Al-Mohamadia"
      width={size}
      height={size}
      className={`shrink-0 rounded-lg object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
