import { Button } from "./button";

interface ErrorStateProps {
  title: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  message,
  retryLabel,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/30 bg-surface px-6 py-12 text-center"
      role="alert"
    >
      <h3 className="text-lg font-semibold text-danger">{title}</h3>
      {message ? (
        <p className="max-w-md text-base text-text-muted">{message}</p>
      ) : null}
      {onRetry && retryLabel ? (
        <Button variant="primary" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
