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

let inflightRefresh: Promise<string | null> | null = null;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Exchanges the HttpOnly `fj_rt` cookie for a fresh access token.
 *
 * Concurrent calls all receive the same Promise — only one network request is
 * ever in-flight at a time. The lock resets after the request settles.
 *
 * @returns the new access token if refresh succeeds, otherwise `null`.
 */
export function refreshSession(): Promise<string | null> {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = _doRefresh().finally(() => {
    inflightRefresh = null;
  });

  return inflightRefresh;
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function _doRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${getApiUrl()}/api/refresh`, {
      method:      "POST",
      credentials: "include", // sends the fj_rt cookie
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        _clearStoredAuth();
        _notifyAuthChanged();
      }
      return null;
    }

    // Safe parse — a rare 429 slip-through or gateway response may not be JSON.
    const json = await res.json().catch(() => null);

    if (!json?.ok || !json?.token) {
      return null;
    }

    localStorage.setItem("token", json.token);
    if (json.user) localStorage.setItem("user", JSON.stringify(json.user));

    _notifyAuthChanged();
    return json.token as string;
  } catch {
    // Network error — do not destroy auth state on transient connectivity loss.
    return null;
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
