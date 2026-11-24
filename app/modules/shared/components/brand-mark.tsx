interface BrandMarkProps {
  size?: number;
  className?: string;
  alt?: string;
}

/**
 * Al-Mohamadia system mark — gold tree emblem (square crop).
 */
export function BrandMark({ size = 40, className = "", alt = "Al-Mohamadia" }: BrandMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/icon-mark.png"
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
