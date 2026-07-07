/**
 * Re-exports shared security utilities so the electron entry point
 * can import them via a path within its own src/ tree.
 * The actual implementation lives in apps/shared/security-utils/index.ts.
 */
export { guardUrl } from '../../../shared/security-utils/index.js';
