"use client";

import { useLocale, useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { Button } from "@/app/modules/shared/components/button";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";
import { PageSection } from "@/app/modules/shared/components/page-section";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { CustomDateRangePicker } from "@/app/modules/shared/components/custom-date-range-picker";
import { PeriodDatePicker } from "@/app/modules/invoices/components/period-date-picker";
import { todayIsoDate } from "@/app/modules/invoices/utils/format-invoice-date";
import { ExportColumns } from "../components/export-columns";
import { ExportFilters } from "../components/export-filters";
import { useExports } from "../hooks/use-exports";
import { defaultExportSelection, exportRequestValid } from "../utils/export-config";
import type { ExportLocale, ExportPeriod, ExportSelection } from "../types/exports.types";

const selectClass =
  "ds-focus-ring min-h-11 rounded-xl border border-border bg-surface px-3 text-base text-text-primary";

export function ExportsPage() {
  const t = useTranslations("exports");
  const locale = useLocale() as ExportLocale;
  const state = useExports();
  const { request, catalog } = state;
  if (state.catalogError)
    return (
      <AppShell title={t("title")}>
        <ErrorState title={t("catalogError")} retryLabel={t("retry")} onRetry={state.retry} />
      </AppShell>
    );
  if (!request || !catalog)
    return (
      <AppShell title={t("title")}>
        <LoadingState message={t("loading")} />
      </AppShell>
    );
  const change = (selection: ExportSelection) =>
    state.change({
      ...request,
      selections: request.selections.map((s) => (s.dataset === selection.dataset ? selection : s)),
    });
  const valid = exportRequestValid(request);
  const rowLimit = catalog.limits.rows.toLocaleString(locale);
  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <div className="flex flex-col gap-6">
        <fieldset disabled={state.busy === "download"} className="min-w-0 space-y-6 disabled:opacity-70">
          <PageSection title={t("settings")}>
            <div className="grid items-start gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
                {t("period")}
                <select
                  className={selectClass}
                  value={request.period.kind}
                  onChange={(event) => {
                    const kind = event.target.value as ExportPeriod["kind"];
                    state.change({
                      ...request,
                      period:
                        kind === "all"
                          ? { kind }
                          : kind === "custom"
                            ? { kind, from: todayIsoDate(), to: todayIsoDate() }
                            : { kind, date: todayIsoDate() },
                    });
                  }}
                >
                  {["all", "day", "week", "month", "year", "custom"].map((kind) => (
                    <option key={kind} value={kind}>
                      {t(`periods.${kind}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary">
                {t("language")}
                <select
                  className={selectClass}
                  value={request.locale}
                  onChange={(event) => state.change({ ...request, locale: event.target.value as ExportLocale })}
                >
                  <option value="ar">{t("arabic")}</option>
                  <option value="en">{t("english")}</option>
                </select>
              </label>
              {request.period.kind === "custom" ? (
                <CustomDateRangePicker
                  from={request.period.from ?? ""}
                  to={request.period.to ?? ""}
                  fromLabel={t("from")}
                  toLabel={t("to")}
                  onChange={(from, to) => state.change({ ...request, period: { kind: "custom", from, to } })}
                />
              ) : request.period.kind !== "all" ? (
                <PeriodDatePicker
                  period={request.period.kind}
                  value={request.period.date ?? todayIsoDate()}
                  onChange={(date) => state.change({ ...request, period: { ...request.period, date } })}
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm text-text-secondary">{t("periodHelp")}</p>
          </PageSection>
          <PageSection title={t("datasets")} description={t("datasetsHelp")} bordered={false}>
            <div className="grid gap-3 sm:grid-cols-2">
              {catalog.datasets.map((dataset) => {
                const selected = request.selections.some((s) => s.dataset === dataset.id);
                return (
                  <label
                    key={dataset.id}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 ${selected ? "border-primary bg-primary/5" : "border-border bg-surface"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      className="ds-focus-ring h-5 w-5 accent-primary"
                      onChange={(event) =>
                        state.change({
                          ...request,
                          selections: event.target.checked
                            ? [...request.selections, defaultExportSelection(dataset)]
                            : request.selections.filter((s) => s.dataset !== dataset.id),
                        })
                      }
                    />
                    <span className="font-medium text-text-primary">{dataset.label[locale]}</span>
                  </label>
                );
              })}
            </div>
          </PageSection>
          {request.selections.map((selection) => {
            const dataset = catalog.datasets.find((d) => d.id === selection.dataset)!;
            return (
              <PageSection
                key={dataset.id}
                title={dataset.label[locale]}
                description={t(dataset.transactional ? "transactionHelp" : "currentHelp")}
              >
                <div className="space-y-4">
                  <ExportFilters dataset={dataset} selection={selection} onChange={change} />
                  <ExportColumns
                    columns={dataset.columns}
                    selected={selection.columns}
                    onChange={(columns) => change({ ...selection, columns })}
                  />
                  {dataset.lineColumns ? (
                    <>
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-text-primary">
                        <input
                          type="checkbox"
                          className="ds-focus-ring h-5 w-5 accent-primary"
                          checked={selection.includeLines ?? false}
                          onChange={(event) => {
                            const next = { ...selection };
                            if (event.target.checked) {
                              next.includeLines = true;
                              next.lineColumns = dataset.lineColumns!.filter((c) => c.default).map((c) => c.id);
                            } else {
                              delete next.includeLines;
                              delete next.lineColumns;
                            }
                            change(next);
                          }}
                        />
                        {t("includeLines")}
                      </label>
                      {selection.includeLines ? (
                        <ExportColumns
                          columns={dataset.lineColumns}
                          selected={selection.lineColumns ?? []}
                          lines
                          onChange={(lineColumns) => change({ ...selection, lineColumns })}
                        />
                      ) : null}
                    </>
                  ) : null}
                </div>
              </PageSection>
            );
          })}
        </fieldset>
        <SurfaceCard>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">{t("review")}</h2>
            {state.preview ? (
              <div className="rounded-xl border border-border bg-surface-muted p-4" aria-live="polite">
                {state.preview.sheets.map((sheet) => (
                  <div
                    key={`${sheet.dataset}-${sheet.lines}`}
                    className="flex justify-between gap-4 py-1 text-sm text-text-primary"
                  >
                    <span>
                      {catalog.datasets.find((d) => d.id === sheet.dataset)!.label[locale]}{" "}
                      {sheet.lines ? t("lines") : ""}
                    </span>
                    <bdi className="font-semibold tabular-nums">
                      {sheet.capped ? `${rowLimit}+` : sheet.count.toLocaleString(locale)}
                    </bdi>
                  </div>
                ))}
                {state.preview.overLimit ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {t("errors.EXPORT_ROW_LIMIT", { rows: rowLimit })}
                  </p>
                ) : null}
              </div>
            ) : null}
            {state.errorCode ? (
              <p role="alert" className="text-sm text-danger">
                {t(`errors.${state.errorCode}`, { rows: rowLimit })}
              </p>
            ) : null}
            {state.notice ? (
              <p role="status" className="text-sm text-text-primary">
                {t(state.notice)}
              </p>
            ) : null}
            {!valid ? <p className="text-sm text-text-secondary">{t("invalidSelection")}</p> : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" disabled={!valid || !!state.busy} onClick={() => void state.run("preview")}>
                {t("preview")}
              </Button>
              <Button
                disabled={!valid || !!state.busy || !!state.preview?.overLimit}
                onClick={() => void state.run("download")}
              >
                {t("action")}
              </Button>
              {state.busy ? (
                <>
                  <span role="status" className="flex items-center gap-2 text-sm text-text-secondary">
                    <span
                      aria-hidden
                      className="h-4 w-4 rounded-full border-2 border-border border-t-primary motion-safe:animate-spin"
                    />
                    {t(state.busy === "download" ? "preparing" : "counting")}
                  </span>
                  <Button variant="ghost" onClick={state.cancel}>
                    {t("cancel")}
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </AppShell>
  );
}
