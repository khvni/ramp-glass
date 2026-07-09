/**
 * Re-exports shared security utilities so the desktop/electron entry point
 * can import them via a path within its own tree.
 * The actual implementation lives in apps/shared/security-utils/index.ts.
 */
export { guardUrl, guardFsPath } from '../../../shared/security-utils/index.js';
