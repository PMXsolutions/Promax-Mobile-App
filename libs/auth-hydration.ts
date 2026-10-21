export interface AuthPersistApi {
  hasHydrated: () => boolean;
  onFinishHydration: (callback: () => void) => () => void;
}

/**
 * Zustand persist can finish before React subscribes. Check the current flag
 * and still subscribe, or startup stays on the loader forever.
 */
export function bindAuthHydration(
  persistApi: AuthPersistApi,
  markHydrated: () => void
): () => void {
  if (persistApi.hasHydrated()) {
    markHydrated();
  }

  return persistApi.onFinishHydration(() => {
    markHydrated();
  });
}
