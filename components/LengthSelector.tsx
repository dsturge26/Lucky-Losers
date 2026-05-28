"use client";

import type { Length } from "@/lib/hairstyles";

const OPTIONS: { value: Length; label: string; blurb: string }[] = [
  { value: "short", label: "Short", blurb: "Buzz, fade, crew, crop" },
  { value: "medium", label: "Medium", blurb: "Quiff, slick back, curtains" },
  { value: "long", label: "Long", blurb: "Bun, ponytail, surfer" },
];

interface Props {
  value: Length | null;
  onChange: (length: Length) => void;
}

export default function LengthSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-2xl border px-5 py-6 text-left transition",
              selected
                ? "border-amber-400 bg-amber-400/10"
                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500",
            ].join(" ")}
          >
            <div className="text-xl font-semibold">{opt.label}</div>
            <div className="mt-1 text-sm text-zinc-400">{opt.blurb}</div>
          </button>
        );
      })}
    </div>
  );
}
