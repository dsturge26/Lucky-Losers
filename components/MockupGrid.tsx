"use client";

import { useState } from "react";
import type { Hairstyle } from "@/lib/hairstyles";
import Lightbox from "./Lightbox";

export type CellState =
  | { status: "pending" }
  | { status: "ok"; dataUrl: string }
  | { status: "error"; error: string };

interface Props {
  styles: Hairstyle[];
  cells: Record<string, CellState>;
  onRetry?: (styleId: string) => void;
}

export default function MockupGrid({ styles, cells, onRetry }: Props) {
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {styles.map((style) => {
          const cell = cells[style.id] ?? { status: "pending" };
          return (
            <div
              key={style.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
            >
              <div className="relative aspect-square w-full bg-zinc-950">
                {cell.status === "pending" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-400" />
                  </div>
                )}
                {cell.status === "ok" && (
                  <button
                    type="button"
                    onClick={() => setLightbox({ src: cell.dataUrl, caption: style.name })}
                    className="absolute inset-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cell.dataUrl}
                      alt={style.name}
                      className="h-full w-full object-cover transition hover:opacity-90"
                    />
                  </button>
                )}
                {cell.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
                    <div className="text-sm text-red-400">Failed</div>
                    <div className="line-clamp-3 text-xs text-zinc-500">{cell.error}</div>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={() => onRetry(style.id)}
                        className="rounded-md border border-zinc-700 px-2 py-1 text-xs hover:border-zinc-500"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-medium">{style.name}</span>
                {cell.status === "pending" && <span className="text-xs text-zinc-500">Generating…</span>}
              </div>
            </div>
          );
        })}
      </div>
      {lightbox && (
        <Lightbox src={lightbox.src} caption={lightbox.caption} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
