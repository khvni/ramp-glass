/**
 * Shared security utilities for Electron main process entry points.
 *
 * These functions are imported by all three entry points:
 *   - apps/desktop/electron/main.ts
 *   - apps/desktop/src/main/main.ts
 *   - apps/electron/src/main.ts
 *
 * Inline definitions drift silently across sessions — this module
 * ensures guardUrl and guardFsPath are identical everywhere.
 */

import { resolve, normalize, sep } from 'node:path';

// ---------------------------------------------------------------------------
// URL guard
// ---------------------------------------------------------------------------

const ALLOWED_URL_SCHEMES = new Set(['https:', 'http:']);

/**
 * Validates that a URL uses an allowed scheme before passing to
 * shell.openExternal or setWindowOpenHandler. Throws if the URL is
 * invalid or uses a disallowed protocol (e.g. javascript:, file:, etc.).
 */
export const guardUrl = (url: string): void => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }
  if (!ALLOWED_URL_SCHEMES.has(parsed.protocol)) {
    throw new Error(`URL scheme "${parsed.protocol}" not allowed`);
  }
};

// ---------------------------------------------------------------------------
// FS path guard
// ---------------------------------------------------------------------------

const containsPath = (filePath: string, root: string): boolean => {
  const resolved = resolve(filePath);
  const rootResolved = resolve(root);
  return resolved.startsWith(rootResolved + sep) || resolved === rootResolved;
};

/**
 * Validates that a file path stays within allowed directories and
 * contains no path-traversal sequences (".."). Throws on traversal
 * or paths outside the allowedRoots (userData + home directory).
 */
export const guardFsPath = (
  filePath: string,
  allowedRoots: string[],
): void => {
  if (!filePath || typeof filePath !== 'string')
    throw new Error('Invalid path');
  const normalized = normalize(filePath);
  if (normalized.includes('..')) throw new Error('Path traversal not allowed');
  if (!allowedRoots.some((root) => containsPath(normalized, root))) {
    throw new Error('Path outside allowed directory');
  }
};
