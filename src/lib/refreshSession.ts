import { getApiUrl } from "@/lib/config";

type SessionSnapshot = Record<string, unknown>;

interface AuthChangedDetail {
  session?: SessionSnapshot | null;
  token?: string | null;
  cleared?: boolean;
}

let inflightRefresh: Promise<SessionSnapshot | null> | null = null;
// AbortController for the current in-flight refresh. Held here so
// logout() can cancel the fetch before it sets a new fj_rt cookie.
let inflightController: AbortController | null = null;

/**
 * Cancels any in-flight refresh immediately.
 * Call this from logout() BEFORE awaiting the /api/logout request so
 * that a concurrent POST /api/refresh cannot set a new cookie that
 * survives the logout cookie-clear.
 */
export function cancelRefresh(): void {
  if (inflightController) {
    inflightController.abort();
    inflightController = null;
  }
}

export function refreshSession(): Promise<SessionSnapshot | null> {
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = _doRefresh().finally(() => {
    inflightRefresh = null;
    inflightController = null;
  });

  return inflightRefresh;
}

async function _doRefresh(): Promise<SessionSnapshot | null> {
  const controller = new AbortController();
  inflightController = controller;
  const { signal } = controller;

  try {
    const refreshRes = await fetch(`${getApiUrl()}/api/refresh`, {
      method: "POST",
      credentials: "include",
      signal,
    });

    if (!refreshRes.ok) {
      if (refreshRes.status === 401 || refreshRes.status === 403) {
        _clearStoredAuth();
        _notifyAuthChanged({ session: null, cleared: true });
      }
      return null;
    }

    const refreshJson = (await refreshRes.json().catch(() => null)) as
      | { ok?: boolean; token?: string; user?: unknown }
      | null;

    if (!refreshJson?.ok || !refreshJson.token) {
      return null;
    }

    localStorage.setItem("token", refreshJson.token);
    if (refreshJson.user) {
      localStorage.setItem("user", JSON.stringify(refreshJson.user));
    }

    const sessionRes = await fetch(`${getApiUrl()}/api/session`, {
      credentials: "include",
      cache: "no-store",
      signal,
    });

    if (!sessionRes.ok) {
      if (sessionRes.status === 401 || sessionRes.status === 403) {
        _clearStoredAuth();
        _notifyAuthChanged({ session: null, cleared: true });
      }
      return null;
    }

    const sessionJson = (await sessionRes.json().catch(() => null)) as
      | SessionSnapshot
      | null;

    if (!sessionJson) {
      return null;
    }

    const sessionUser =
      typeof sessionJson.user === "object" && sessionJson.user !== null
        ? sessionJson.user
        : refreshJson.user ?? null;

    if (sessionUser) {
      localStorage.setItem("user", JSON.stringify(sessionUser));
    }

    _notifyAuthChanged({
      session: sessionJson,
      token: refreshJson.token,
    });

    return sessionJson;
  } catch {
    // AbortError is an intentional cancellation — not an error worth logging.
    return null;
  }
}

function _clearStoredAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function _notifyAuthChanged(detail: AuthChangedDetail): void {
  window.dispatchEvent(new CustomEvent<AuthChangedDetail>("auth:changed", { detail }));
}
