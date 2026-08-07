interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden
      />
      {message ? (
        <p className="text-base text-text-muted">{message}</p>
      ) : null}
    </div>
  );
}
