"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

export default function CodeSearchInput() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/p/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="mt-7">
      <p className="mb-2 text-[9px] tracking-[0.24em] text-white/40 uppercase md:text-[10px]">
        {tr("home.codePrompt")}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex max-w-[360px] items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={tr("home.codePlaceholder")}
            spellCheck={false}
            autoComplete="off"
            aria-label={tr("home.codeLabel")}
            className="w-full rounded-md border border-white/15 bg-white/10 px-4 py-[11px] pr-3 font-mono text-sm tracking-wider text-white transition-colors duration-150 outline-none placeholder:text-white/30 hover:bg-white/[0.14] focus:border-white/30 focus:bg-white/[0.14]"
          />
        </div>

        <button
          type="submit"
          disabled={!code.trim()}
          className="flex-shrink-0 rounded-md bg-white px-5 py-[11px] text-[11px] font-semibold tracking-[0.18em] text-[#0d0d0b] uppercase transition-all duration-150 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {tr("home.codeButton")}
        </button>
      </form>

      <p className="mt-2 text-[9px] tracking-wide text-white/25">
        {tr("home.codeHint")}
      </p>
    </div>
  );
}
