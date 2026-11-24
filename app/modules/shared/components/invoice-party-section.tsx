"use client";
import { Link } from "@/i18n/navigation";
import { SurfaceCard } from "./surface-card";
export function InvoicePartySection({ label, name, href }: { label: string; name: string; href?: string }) {
  return (
    <SurfaceCard padding="sm">
      <p className="text-sm text-text-secondary">{label}</p>
      <h2 className="mt-1 break-words text-xl font-semibold leading-snug">
        {href ? (
          <Link href={href} className="ds-focus-ring rounded text-primary underline-offset-4 hover:underline">
            {name}
          </Link>
        ) : (
          name
        )}
      </h2>
    </SurfaceCard>
  );
}
