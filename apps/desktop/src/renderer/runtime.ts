type TauriRuntimeWindow = Window &
  typeof globalThis & {
    __TAURI_INTERNALS__?: {
      invoke?: unknown;
    };
  };

export const isTauriRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const candidate = (window as TauriRuntimeWindow).__TAURI_INTERNALS__;
  return typeof candidate?.invoke === 'function';
};

export const WEB_PREVIEW_NOTICE =
  'Browser preview only. pnpm dev:web does not start Tauri, the OpenCode sidecar, SQLite, native dialogs, or OAuth. Use pnpm dev:desktop to exercise the full app runtime.';
