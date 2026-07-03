import { describe, expect, it } from 'vitest';
import { resolve, normalize, sep } from 'node:path';

// Re-implement the guard logic for unit testing, matching apps/desktop/src/main/main.ts
const containsPath = (filePath: string, root: string): boolean => {
  const resolved = resolve(filePath);
  const rootResolved = resolve(root);
  return resolved.startsWith(rootResolved + sep) || resolved === rootResolved;
};

const allowedFsRoots = (_userData: string, _homedir: string): string[] => {
  return [_userData, _homedir];
};

const guardFsPath = (filePath: string): void => {
  if (!filePath || typeof filePath !== 'string') throw new Error('Invalid path');
  const normalized = normalize(filePath);
  if (normalized.includes('..')) throw new Error('Path traversal not allowed');
  const allowed = allowedFsRoots(
    '/Users/khani/Library/Application Support/tinker',
    '/Users/khani',
  );
  if (
    !allowed.some((root) => {
      const resolved = resolve(normalized);
      const rootResolved = resolve(root);
      return resolved.startsWith(rootResolved + sep) || resolved === rootResolved;
    })
  ) {
    throw new Error('Path outside allowed directory');
  }
};

describe('guardFsPath', () => {
  it('accepts a path within homedir', () => {
    expect(() => guardFsPath(resolve('/Users/khani/projects/test.txt'))).not.toThrow();
  });

  it('accepts a path within userData', () => {
    expect(() =>
      guardFsPath(resolve('/Users/khani/Library/Application Support/tinker/config.json')),
    ).not.toThrow();
  });

  it('rejects path traversal with ..', () => {
    expect(() => guardFsPath('/Users/khani/../etc/passwd')).toThrow();
  });

  it('rejects traversal attempt with multiple ..', () => {
    expect(() =>
      guardFsPath('/Users/khani/projects/../../root/.ssh/id_rsa'),
    ).toThrow();
  });

  it('rejects empty path', () => {
    expect(() => guardFsPath('')).toThrow();
  });

  it('rejects null/undefined', () => {
    // @ts-expect-error testing invalid input
    expect(() => guardFsPath(null)).toThrow();
    // @ts-expect-error testing invalid input
    expect(() => guardFsPath(undefined)).toThrow();
  });

  it('rejects path outside allowed roots', () => {
    expect(() => guardFsPath('/etc/nginx/nginx.conf')).toThrow();
    expect(() => guardFsPath('/usr/local/bin/script.sh')).toThrow();
  });
});
