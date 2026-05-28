"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoUpload({ file, onChange, disabled }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = useCallback(
    (f: File | undefined | null) => {
      if (!f) return;
      if (!ACCEPTED.includes(f.type)) {
        setError("Please use a JPEG, PNG, or WebP image.");
        return;
      }
      if (f.size > MAX_BYTES) {
        setError("Image must be 10 MB or smaller.");
        return;
      }
      setError(null);
      const url = URL.createObjectURL(f);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      onChange(f);
    },
    [onChange],
  );

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          accept(e.dataTransfer.files?.[0]);
        }}
        className={[
          "rounded-2xl border-2 border-dashed p-6 text-center transition",
          dragOver ? "border-amber-400 bg-amber-400/5" : "border-zinc-700 bg-zinc-900",
          disabled ? "opacity-50" : "",
        ].join(" ")}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected client photo" className="max-h-64 rounded-xl object-contain" />
            <div className="text-sm text-zinc-400">{file?.name}</div>
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500 disabled:opacity-50"
            >
              Choose a different photo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="text-lg font-medium">Drop a client photo here</div>
            <div className="text-sm text-zinc-400">JPEG, PNG, or WebP · up to 10 MB · a clear front-facing shot works best</div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="mt-1 rounded-lg bg-amber-400 px-4 py-2 font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-50"
            >
              Choose photo
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>
      {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
    </div>
  );
}
