/**
 * Next.js Instrumentation hook — runs once when the server starts.
 *
 * Purpose: intercept every server-side fetch() call and log a full stack trace
 * when the URL is empty / relative / "undefined…" — so you can pinpoint the
 * exact source file instead of hunting through compiled chunks.
 *
 * HOW TO USE
 * ----------
 * 1. Run `next build` (or `next dev`) — the log will appear in the terminal.
 * 2. Once you have identified and fixed the source, you can delete this file
 *    or keep it (it's a no-op in production when no bad URLs are detected).
 *
 * REQUIRES next.config.js:  experimental: { instrumentationHook: true }
 * (Next.js 14.1+ enables this automatically when the file exists.)
 */

export async function register() {
  // Only patch the Node.js runtime (not the Edge runtime, which has its own fetch)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const originalFetch = globalThis.fetch;

  globalThis.fetch = async function patchedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

    // ── Dangerous URL patterns ────────────────────────────────────────────────
    const isDangerous =
      url === "" ||
      url === "undefined" ||
      url.startsWith("undefined/") ||
      (!url.startsWith("http") && !url.startsWith("/_next") && !url.startsWith("/__nextjs"));

    if (isDangerous) {
      const stack = new Error(`[fetch GUARD] Dangerous URL detected: "${url}"`).stack ?? "";
      // Print clearly in the build log so you can find the offending file
      console.error("\n⛔ ─────────────────────────────────────────────────────");
      console.error(`   fetch() called with an invalid URL: ${JSON.stringify(url)}`);
      console.error("   Stack trace:");
      // Skip the first 2 frames (this wrapper + Error constructor)
      stack
        .split("\n")
        .slice(2)
        .forEach((line) => console.error("  ", line.trim()));
      console.error("────────────────────────────────────────────────────────\n");

      // Re-throw so the build still fails fast with the original error
      throw new TypeError(`fetch(): Invalid URL "${url}" — see stack trace above`);
    }

    return originalFetch(input, init);
  };
}
