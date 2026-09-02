import type { ReactNode } from "react";
import { SurfaceCard } from "./surface-card";

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  cardClassName?: string;
  /** When false, children render without an extra card wrapper */
  bordered?: boolean;
}

export function PageSection({
  title,
  description,
  children,
  className = "",
  cardClassName = "",
  bordered = true,
}: PageSectionProps) {
  return (
    <section className={`flex flex-col gap-4 ${className}`}>
      {title || description ? (
        <div className="px-1">
          {title ? (
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-base text-text-secondary">{description}</p>
          ) : null}
        </div>
      ) : null}

      {bordered ? (
        <SurfaceCard className={cardClassName}>{children}</SurfaceCard>
      ) : (
        children
      )}
    </section>
  );
}
