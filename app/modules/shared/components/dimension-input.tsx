"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useApiErrorMessage } from "@/lib/api/use-api-error-message";
import { parsePositive } from "../utils/form-numbers";
import { Input } from "./input";
import { Button } from "./button";
import { DashedAddButton } from "./dashed-add-button";

interface DimensionInputProps {
  name: string;
  label: string;
  value: string;
  defaults?: number[];
  required: boolean;
  onChange: (value: string) => void;
  onAddDefault: (value: number) => Promise<void>;
}

export function DimensionInput({
  name,
  label,
  value,
  defaults = [],
  required,
  onChange,
  onAddDefault,
}: DimensionInputProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  const t = useTranslations("items");
  const describeError = useApiErrorMessage();
  const parsed = parsePositive(draft);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  async function saveDefault() {
    if (saving) return;
    if (parsed === null) {
      setError(t("validationDimensionValue"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onAddDefault(parsed);
      if (!alive.current) return;
      setAdding(false);
      setDraft("");
      setOpen(false);
    } catch (cause: unknown) {
      if (alive.current)
        setError(describeError(cause, t("dimensionDefaultSaveFailed")));
    } finally {
      if (alive.current) setSaving(false);
    }
  }

  return (
    <div
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-end gap-1">
        <Input
          name={name}
          label={label}
          density="compact"
          type="number"
          min={0}
          step="any"
          value={value}
          required={required}
          disabled={saving}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-label={t("chooseDimensionDefault", { dimension: label })}
          aria-expanded={open}
          aria-controls={listId}
          className="ds-focus-ring flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-muted"
          onClick={() => setOpen(!open)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      {open ? (
        <ul
          id={listId}
          className="absolute start-0 z-30 mt-1 max-h-64 w-full min-w-48 overflow-auto rounded-xl border border-border bg-surface p-1 shadow-lg"
        >
          {defaults.map((entry) => (
            <li key={entry}>
              <button
                type="button"
                disabled={saving}
                className="ds-focus-ring min-h-11 w-full rounded-lg px-3 text-start text-sm text-text-primary hover:bg-surface-muted disabled:opacity-50"
                onClick={() => {
                  onChange(String(entry));
                  setOpen(false);
                }}
              >
                {entry}
              </button>
            </li>
          ))}
          <li className="border-t border-border p-2">
            {adding ? (
              <div className="flex flex-col gap-2" aria-busy={saving}>
                <Input
                  name={`${name}-new-default`}
                  label={t("newDimensionValue")}
                  hint={t("dimensionDefaultHint")}
                  type="number"
                  min={0}
                  step="any"
                  density="compact"
                  value={draft}
                  disabled={saving}
                  autoFocus
                  error={
                    error ??
                    (draft.trim() && parsed === null
                      ? t("validationDimensionValue")
                      : null)
                  }
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveDefault();
                    }
                  }}
                />
                <div className="flex flex-col items-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-11"
                    disabled={saving || parsed === null}
                    onClick={() => void saveDefault()}
                  >
                    {saving ? t("saving") : t("addDimensionDefault")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="min-h-11"
                    disabled={saving}
                    onClick={() => {
                      setAdding(false);
                      setDraft("");
                      setError(null);
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <DashedAddButton
                className="w-full"
                label={t("addDimensionDefault")}
                onClick={() => setAdding(true)}
              />
            )}
          </li>
        </ul>
      ) : null}
    </div>
  );
}
