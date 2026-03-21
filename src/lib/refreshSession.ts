/**
 * src/lib/refreshSession.ts
 *
 * Silent session renewal via the HttpOnly refresh-token cookie.
 *
 * Design notes:
 *
 *  - Singleton lock  — `inflightRefresh` collapses concurrent 401 failures into
 *    one network call. All waiters share the same promise and act on its result
 *    together, preventing "refresh storms" when many requests expire at once.
 *
 *  - No React imports — this module is intentionally plain TypeScript. It
 *    communicates state changes to React (AuthContext) by dispatching the custom
 *    "auth:changed" DOM event, which AuthContext listens to. This prevents a
 *    circular dependency between the fetch layer and the context layer.
 *
 *  - localStorage only — access token and user are mirrored in localStorage so
 *    that apiFetch can read the new token before the React tree re-renders.
 */

import { getApiUrl } from "@/lib/config";

// ─── Singleton promise lock ──────────────────────────────────────────────────

let inflightRefresh: Promise<boolean> | null = null;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Exchanges the HttpOnly `fj_rt` cookie for a fresh access token.
 *
 * Concurrent calls all receive the same Promise — only one network request is
 * ever in-flight at a time. The lock resets after the request settles.
 *
 * @returns `true` if a new token was obtained and stored, `false` otherwise.
 */
export function refreshSession(): Promise<boolean> {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = _doRefresh().finally(() => {
    inflightRefresh = null;
  });

  return inflightRefresh;
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function _doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiUrl()}/api/refresh`, {
      method:      "POST",
      credentials: "include", // sends the fj_rt cookie
    });

    if (!res.ok) {
      // 429 = rate limited. This is NOT a session invalidation — the cookie
      // may still be valid. Preserve stored auth and just signal "not refreshed".
      if (res.status === 429) return false;

      _clearStoredAuth();
      _notifyAuthChanged();
      return false;
    }

    // Safe parse — a rare 429 slip-through or gateway response may not be JSON.
    const json = await res.json().catch(() => null);

    if (!json?.ok || !json?.token) {
      _clearStoredAuth();
      _notifyAuthChanged();
      return false;
    }

    localStorage.setItem("token", json.token);
    if (json.user) localStorage.setItem("user", JSON.stringify(json.user));

    _notifyAuthChanged();
    return true;
  } catch {
    // Network error — treat as refresh failure
    _clearStoredAuth();
    _notifyAuthChanged();
    return false;
  }
}

function _clearStoredAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Notifies AuthContext (and any other listeners) that localStorage auth state
 * has changed. AuthContext's useEffect re-reads localStorage on this event.
 */
function _notifyAuthChanged(): void {
  window.dispatchEvent(new Event("auth:changed"));
}
