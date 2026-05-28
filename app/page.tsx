"use client";

import { useMemo, useState } from "react";
import LengthSelector from "@/components/LengthSelector";
import PhotoUpload from "@/components/PhotoUpload";
import MockupGrid, { type CellState } from "@/components/MockupGrid";
import ApiKeyForm, { useApiKey } from "@/components/ApiKeyGate";
import { buildPrompt, getHairstyles, type Length, type Hairstyle } from "@/lib/hairstyles";
import { editHairstyle, fileToBase64 } from "@/lib/gemini";

type Phase = "setup" | "generating" | "done";

export default function Page() {
  const { apiKey, hydrated, save, clear } = useApiKey();
  const [length, setLength] = useState<Length | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [cells, setCells] = useState<Record<string, CellState>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [encoded, setEncoded] = useState<{ base64: string; mimeType: string } | null>(null);

  const styles = useMemo(() => (length ? getHairstyles(length) : []), [length]);
  const canGenerate = !!apiKey && !!length && !!file && phase !== "generating";

  const runStyle = async (
    style: Hairstyle,
    input: { base64: string; mimeType: string },
  ): Promise<CellState> => {
    try {
      const out = await editHairstyle({
        apiKey: apiKey!,
        imageBase64: input.base64,
        mimeType: input.mimeType,
        prompt: buildPrompt(style),
      });
      return { status: "ok", dataUrl: `data:${out.mimeType};base64,${out.imageBase64}` };
    } catch (err) {
      return { status: "error", error: err instanceof Error ? err.message : "Unknown error" };
    }
  };

  const generate = async () => {
    if (!length || !file || !apiKey) return;
    setTopError(null);
    setPhase("generating");
    const pending: Record<string, CellState> = {};
    for (const s of styles) pending[s.id] = { status: "pending" };
    setCells(pending);

    let input = encoded;
    try {
      if (!input) {
        const { base64, mimeType } = await fileToBase64(file);
        input = { base64, mimeType };
        setEncoded(input);
      }
    } catch (err) {
      setTopError(err instanceof Error ? err.message : "Failed to read image.");
      setPhase("setup");
      return;
    }

    await Promise.all(
      styles.map(async (style) => {
        const result = await runStyle(style, input!);
        setCells((prev) => ({ ...prev, [style.id]: result }));
      }),
    );
    setPhase("done");
  };

  const retry = async (styleId: string) => {
    if (!length || !apiKey) return;
    const style = styles.find((s) => s.id === styleId);
    if (!style) return;

    let input = encoded;
    if (!input && file) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        input = { base64, mimeType };
        setEncoded(input);
      } catch {
        return;
      }
    }
    if (!input) return;

    setCells((prev) => ({ ...prev, [styleId]: { status: "pending" } }));
    const result = await runStyle(style, input);
    setCells((prev) => ({ ...prev, [styleId]: result }));
  };

  const reset = () => {
    setLength(null);
    setFile(null);
    setCells({});
    setPhase("setup");
    setTopError(null);
    setEncoded(null);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Barber AI Mockups</h1>
          <p className="text-sm text-zinc-400">
            Upload a client photo, pick a length, and see nine hairstyles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {apiKey && (
            <button
              type="button"
              onClick={clear}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:border-zinc-500"
              title="Replace stored Gemini API key"
            >
              Change key
            </button>
          )}
          {phase !== "setup" && (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      {!hydrated ? null : !apiKey ? (
        <ApiKeyForm onSave={save} />
      ) : (
        <>
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
              1 · Choose length
            </h2>
            <LengthSelector value={length} onChange={(l) => setLength(l)} />
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
              2 · Upload photo
            </h2>
            <PhotoUpload
              file={file}
              onChange={(f) => {
                setFile(f);
                setEncoded(null);
              }}
              disabled={phase === "generating"}
            />
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
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
                3 · Mockups
              </h2>
              <MockupGrid styles={styles} cells={cells} onRetry={retry} />
            </section>
          )}
        </>
      )}
    </main>
  );
}
