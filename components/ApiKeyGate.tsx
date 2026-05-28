"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "barber-ai-gemini-key";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setApiKey(stored);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const save = (key: string) => {
    const trimmed = key.trim();
    if (!trimmed) return;
    window.localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKey(trimmed);
  };

  const clear = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
  };

  return { apiKey, hydrated, save, clear };
}

interface Props {
  onSave: (key: string) => void;
}

export default function ApiKeyForm({ onSave }: Props) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold">Add your Gemini API key</h2>
      <p className="mt-1 text-sm text-zinc-400">
        The key is saved only in your browser (localStorage) and sent directly to Google to generate
        mockups. It never goes through any server.
      </p>
      <p className="mt-2 text-sm text-zinc-400">
        Get one at{" "}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-amber-400 underline"
        >
          aistudio.google.com/app/apikey
        </a>
        . Image generation requires a paid-tier project.
      </p>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(value);
        }}
      >
        <input
          type={show ? "text" : "password"}
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza..."
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500"
        >
          {show ? "Hide" : "Show"}
        </button>
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-amber-300 disabled:opacity-50"
        >
          Save key
        </button>
      </form>
    </div>
  );
}
