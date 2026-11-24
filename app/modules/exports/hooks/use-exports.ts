"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api/types";
import { getExportCatalog, previewExport, downloadExport } from "../services/exports.service";
import { initialExportRequest } from "../utils/export-config";
import { saveExportWorkbook } from "../utils/download-workbook";
import type { ExportCatalog, ExportPreview, ExportRequest } from "../types/exports.types";

export function useExports() {
  const seed = useSearchParams().toString();
  const [catalog, setCatalog] = useState<ExportCatalog | null>(null);
  const [request, setRequest] = useState<ExportRequest | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [reload, setReload] = useState(0);
  const [preview, setPreview] = useState<{ key: string; value: ExportPreview } | null>(null);
  const [busy, setBusy] = useState<"preview" | "download" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const action = useRef<AbortController | null>(null);
  const revision = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    getExportCatalog(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setCatalog(data);
        setCatalogError(false);
        setRequest(initialExportRequest(data, new URLSearchParams(seed)));
        setPreview(null);
        revision.current++;
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogError(true);
      });
    return () => {
      controller.abort();
      action.current?.abort();
      action.current = null;
    };
  }, [seed, reload]);

  function change(next: ExportRequest) {
    revision.current++;
    action.current?.abort();
    action.current = null;
    setBusy(null);
    setRequest(next);
    setPreview(null);
    setErrorCode(null);
    setNotice(null);
  }

  async function run(kind: "preview" | "download") {
    if (!request || action.current) return;
    const controller = new AbortController();
    action.current = controller;
    const version = revision.current;
    const key = JSON.stringify(request);
    setBusy(kind);
    setErrorCode(null);
    setNotice(null);
    try {
      if (kind === "preview") {
        const value = await previewExport(request, controller.signal);
        if (!controller.signal.aborted && revision.current === version) setPreview({ key, value });
      } else {
        const blob = await downloadExport(request, controller.signal);
        if (!controller.signal.aborted && revision.current === version) {
          saveExportWorkbook(blob, request.locale);
          setNotice("downloaded");
        }
      }
    } catch (error) {
      if (!controller.signal.aborted && revision.current === version) {
        const code = error instanceof ApiError ? error.errorCode : undefined;
        setErrorCode(
          code &&
            [
              "EXPORT_ROW_LIMIT",
              "EXPORT_FILE_LIMIT",
              "EXPORT_TIMEOUT",
              "EXPORT_BUSY",
              "EXPORT_INVALID_CELL",
              "EXPORT_INVALID_PERIOD",
              "EXPORT_INVALID_SELECTION",
            ].includes(code)
            ? code
            : "generic",
        );
      }
    } finally {
      if (action.current === controller) {
        action.current = null;
        setBusy(null);
      }
    }
  }

  function cancel() {
    action.current?.abort();
    action.current = null;
    setBusy(null);
    setNotice("cancelled");
  }
  return {
    catalog,
    request,
    catalogError,
    retry: () => {
      setCatalogError(false);
      setReload((value) => value + 1);
    },
    change,
    preview: preview?.key === JSON.stringify(request) ? preview.value : null,
    busy,
    notice,
    errorCode,
    run,
    cancel,
  };
}
