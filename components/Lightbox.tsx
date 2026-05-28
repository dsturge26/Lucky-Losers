"use client";

import { useEffect } from "react";

interface Props {
  src: string;
  caption: string;
  onClose: () => void;
}

export default function Lightbox({ src, caption, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6"
      onClick={onClose}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption}
        className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-4 flex items-center gap-3 text-zinc-200">
        <span className="text-lg font-medium">{caption}</span>
        <a
          href={src}
          download={`${caption.replace(/\s+/g, "-").toLowerCase()}.png`}
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg border border-zinc-600 px-3 py-1 text-sm hover:border-zinc-400"
        >
          Download
        </a>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-600 px-3 py-1 text-sm hover:border-zinc-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}
