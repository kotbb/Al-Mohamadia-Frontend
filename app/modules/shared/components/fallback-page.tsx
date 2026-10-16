import Image from "next/image";

interface FallbackPageProps {
  code: string;
  title: string;
  description: string;
  homeHref: string;
  homeLabel: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function FallbackPage({ code, title, description, homeHref, homeLabel, retryLabel, onRetry }: FallbackPageProps) {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12 font-sans text-text-primary">
    <section className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-shell)] border border-border bg-surface shadow-elevation-2">
      <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-7 py-5 sm:px-10">
        <Image src="/images/icon-mark.png" alt="" width={44} height={44} className="h-11 w-11 rounded-xl bg-surface object-contain p-1" />
        <span lang="ar" dir="rtl" className="text-xl font-bold leading-none text-primary">المحمدية</span>
      </div>
      <div className="px-7 py-10 sm:px-10 sm:py-12">
        <div className="mb-5 flex items-center gap-4">
          <span className="h-10 w-1 rounded-full bg-primary" aria-hidden="true" />
          <p className="text-5xl font-bold leading-none tracking-tight text-primary" aria-hidden="true">{code}</p>
        </div>
        <h1 className="text-2xl font-bold leading-snug">{title}</h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-text-secondary">{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <form action={homeHref} method="get"><button type="submit" className="ds-focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">{homeLabel}</button></form>
          {onRetry && retryLabel && <button type="button" onClick={onRetry} className="ds-focus-ring min-h-11 rounded-xl border border-border px-5 py-2 font-semibold text-text-primary transition-colors hover:bg-surface-muted">{retryLabel}</button>}
        </div>
      </div>
    </section>
  </main>;
}

