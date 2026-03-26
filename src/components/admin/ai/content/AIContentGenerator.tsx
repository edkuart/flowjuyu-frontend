"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ── Types ──────────────────────────────────────────────────────────────────────

type Product = {
  id:               string;
  nombre:           string;
  codigo?:          string;  // FJ-... code
  code?:            string;
  precio?:          number;
  categoria_custom?: string;
};

type ContentType = "caption" | "product_description" | "image_prompt_brief";

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "caption",             label: "Caption"             },
  { value: "product_description", label: "Product Description" },
  { value: "image_prompt_brief",  label: "Image Prompt Brief"  },
];

type GenResult = {
  ok:                boolean;
  code:              string;
  variant_id?:       string;
  item_id?:          string;
  generation_score?: number;
  queue_flag?:       string;
  rejection_reason?: string;
  failures?:         string[];
  message?:          string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function productCode(p: Product): string | null {
  return p.codigo ?? p.code ?? null;
}

function Spinner({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
}

// ── Result banner ──────────────────────────────────────────────────────────────

function ResultBanner({ result }: { result: GenResult }) {
  const base = result.ok
    ? "border-green-200 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
    : "border-red-200 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400";

  return (
    <div className={`p-3 rounded-md border text-sm space-y-1 ${base}`}>
      <p className="font-medium">{result.code}</p>
      {result.variant_id && (
        <p className="text-xs opacity-80 font-mono">Variant: {result.variant_id}</p>
      )}
      {result.generation_score != null && (
        <p className="text-xs opacity-80">
          Score: {(result.generation_score * 100).toFixed(1)}
          {result.queue_flag && <span className="ml-2 opacity-70">· {result.queue_flag}</span>}
        </p>
      )}
      {result.rejection_reason && (
        <p className="text-xs opacity-80">Rejected: {result.rejection_reason.replace(/_/g, " ")}</p>
      )}
      {result.failures && result.failures.length > 0 && (
        <p className="text-xs opacity-80">Guardrail: {result.failures.join(", ")}</p>
      )}
      {result.message && <p className="text-xs opacity-80">{result.message}</p>}
    </div>
  );
}

// ── Product search input ───────────────────────────────────────────────────────

function ProductSearch({
  selected,
  onSelect,
  onClear,
}: {
  selected:  Product | null;
  onSelect:  (p: Product) => void;
  onClear:   () => void;
}) {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [open,      setOpen]      = useState(false);
  const [noResults, setNoResults] = useState(false);

  const wrapperRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      setNoResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setNoResults(false);
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(
          `${API_BASE}/api/admin/products?search=${encodeURIComponent(trimmed)}`,
          { headers: { Authorization: `Bearer ${token ?? ""}` } },
        );
        const body     = await res.json();
        const products: Product[] = body.products ?? body.data ?? body.items ?? [];
        setResults(products);
        setNoResults(products.length === 0);
        setOpen(true);
      } catch {
        setResults([]);
        setNoResults(false);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function handleSelect(p: Product) {
    onSelect(p);
    setQuery("");
    setResults([]);
    setOpen(false);
    setNoResults(false);
  }

  function handleClearClick() {
    onClear();
    setQuery("");
    setResults([]);
    setOpen(false);
    setNoResults(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); setQuery(""); }
  }

  // ── If a product is already selected ────────────────────────────────────────

  if (selected) {
    const code = productCode(selected);
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-md border bg-background">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{selected.nombre}</p>
          <p className="text-xs text-muted-foreground">
            {code && <span className="mr-2">{code}</span>}
            {selected.precio != null && <span>Q {Number(selected.precio).toFixed(2)}</span>}
          </p>
        </div>
        <button
          onClick={handleClearClick}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
          aria-label="Clear selection"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    );
  }

  // ── Search input + dropdown ──────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search by product name or code…"
          autoComplete="off"
          className="w-full pl-9 pr-4 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors placeholder:text-muted-foreground/60"
        />

        {/* Left icon: search or spinner */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {searching
            ? <Spinner className="h-3.5 w-3.5" />
            : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
            )
          }
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
          {noResults ? (
            <div className="px-3 py-2.5 text-sm text-muted-foreground">
              No products found for "{query}"
            </div>
          ) : (
            <ul className="max-h-56 overflow-y-auto divide-y divide-border">
              {results.map((p) => {
                const code = productCode(p);
                return (
                  <li key={p.id}>
                    {/* onMouseDown prevents blur from firing before click */}
                    <button
                      onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        {code && <span className="font-mono">{code}</span>}
                        {p.precio != null && <span>Q {Number(p.precio).toFixed(2)}</span>}
                        {p.categoria_custom && (
                          <span className="capitalize">{p.categoria_custom}</span>
                        )}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AIContentGenerator({
  preselectedProductId,
  preselectedContentType,
  onDone,
}: {
  preselectedProductId?:    string;
  preselectedContentType?:  ContentType;
  onDone?:                  (result: GenResult) => void;
} = {}) {
  const [selected,    setSelected]    = useState<Product | null>(null);
  const [contentType, setContentType] = useState<ContentType>(
    preselectedContentType ?? "caption"
  );
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<GenResult | null>(null);

  // If a preselected product ID is provided (e.g. from priority queue),
  // fetch its details so we can show the name instead of a UUID.
  useEffect(() => {
    if (!preselectedProductId) return;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API_BASE}/api/admin/products/${preselectedProductId}`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        });
        if (!res.ok) return;
        const body = await res.json();
        const p: Product = body.product ?? body.data ?? body;
        if (p?.id) setSelected(p);
      } catch { /* silently ignore — user can search manually */ }
    })();
  }, [preselectedProductId]);

  const handleGenerate = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/api/admin/ai/content/generate`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
        body:    JSON.stringify({
          subject_type: "product",
          subject_id:   selected.id,
          content_type: contentType,
        }),
      });
      const body = await res.json();
      setResult(body);
      onDone?.(body);
    } catch (err: any) {
      const r = { ok: false, code: "FETCH_ERROR", message: err.message };
      setResult(r);
      onDone?.(r);
    } finally {
      setLoading(false);
    }
  }, [selected, contentType, onDone]);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Generate Content</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Triggers the full pipeline: guardrails → scoring → review queue. Human review required before publish.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Product selector — 2 cols */}
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-muted-foreground">Select Product</label>
          <ProductSearch
            selected={selected}
            onSelect={(p) => { setSelected(p); setResult(null); }}
            onClear={() => { setSelected(null); setResult(null); }}
          />
        </div>

        {/* Content type */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Content Type</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as ContentType)}
            className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !selected}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded bg-foreground text-background font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
      >
        {loading && <Spinner />}
        {loading ? "Generating…" : "Generate"}
      </button>

      {/* Result */}
      {result && <ResultBanner result={result} />}
    </div>
  );
}
