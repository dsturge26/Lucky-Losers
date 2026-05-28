"use client";

import { useMemo, useState } from "react";
import LengthSelector from "@/components/LengthSelector";
import PhotoUpload from "@/components/PhotoUpload";
import MockupGrid, { type CellState } from "@/components/MockupGrid";
import { getHairstyles, type Length } from "@/lib/hairstyles";

type Phase = "setup" | "generating" | "done";

interface ApiResultItem {
  id: string;
  name: string;
  status: "ok" | "error";
  imageBase64?: string;
  mimeType?: string;
  error?: string;
}

function toDataUrl(item: ApiResultItem): string | null {
  if (item.status !== "ok" || !item.imageBase64) return null;
  return `data:${item.mimeType ?? "image/png"};base64,${item.imageBase64}`;
}

export default function Page() {
  const [length, setLength] = useState<Length | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const styles = useMemo(() => (length ? getHairstyles(length) : []), [length]);

  const canGenerate = length !== null && file !== null && phase !== "generating";

  const initialCells = (ids: string[]): Record<string, CellState> => {
    const next: Record<string, CellState> = {};
    for (const id of ids) next[id] = { status: "pending" };
    return next;
  };

  const generate = async () => {
    if (!length || !file) return;
    setTopError(null);
    setPhase("generating");
    setCells(initialCells(styles.map((s) => s.id)));

    const form = new FormData();
    form.append("length", length);
    form.append("image", file);

    try {
      const res = await fetch("/api/generate", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { results: ApiResultItem[] };
      const next: Record<string, CellState> = {};
      for (const item of data.results) {
        const url = toDataUrl(item);
        next[item.id] = url
          ? { status: "ok", dataUrl: url }
          : { status: "error", error: item.error ?? "Unknown error" };
      }
      setCells(next);
      setPhase("done");
    } catch (err) {
      setTopError(err instanceof Error ? err.message : "Failed to generate.");
      setPhase("setup");
      setCells({});
    }
  };

  const retry = async (styleId: string) => {
    if (!length || !file) return;
    setCells((prev) => ({ ...prev, [styleId]: { status: "pending" } }));

    const form = new FormData();
    form.append("length", length);
    form.append("styleId", styleId);
    form.append("image", file);

    try {
      const res = await fetch("/api/generate/single", { method: "POST", body: form });
      const item = (await res.json()) as ApiResultItem;
      const url = toDataUrl(item);
      setCells((prev) => ({
        ...prev,
        [styleId]: url
          ? { status: "ok", dataUrl: url }
          : { status: "error", error: item.error ?? "Unknown error" },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Retry failed.";
      setCells((prev) => ({ ...prev, [styleId]: { status: "error", error: message } }));
    }
  };

  const reset = () => {
    setLength(null);
    setFile(null);
    setCells({});
    setPhase("setup");
    setTopError(null);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Barber AI Mockups</h1>
          <p className="text-sm text-zinc-400">
            Upload a client photo, pick a length, and see nine hairstyles.
          </p>
        </div>
        {phase !== "setup" && (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500"
          >
            Start over
          </button>
        )}
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">1 · Choose length</h2>
        <LengthSelector value={length} onChange={(l) => setLength(l)} />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">2 · Upload photo</h2>
        <PhotoUpload file={file} onChange={setFile} disabled={phase === "generating"} />
      </section>

      <section className="mb-8">
        <button
          type="button"
          onClick={generate}
          disabled={!canGenerate}
          className="w-full rounded-2xl bg-amber-400 px-6 py-4 text-lg font-semibold text-zinc-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {phase === "generating" ? "Generating 9 mockups…" : "Generate mockups"}
        </button>
        {topError && <div className="mt-3 text-sm text-red-400">{topError}</div>}
        {phase === "generating" && (
          <div className="mt-2 text-center text-xs text-zinc-500">
            This usually takes 10–30 seconds.
          </div>
        )}
      </section>

      {(phase === "generating" || phase === "done") && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">3 · Mockups</h2>
          <MockupGrid styles={styles} cells={cells} onRetry={retry} />
        </section>
      )}
    </main>
  );
}
