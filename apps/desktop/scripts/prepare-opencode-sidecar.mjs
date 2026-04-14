import { chmod, copyFile, mkdir, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(scriptDir, '..');
const binariesDir = resolve(desktopDir, 'src-tauri', 'binaries');
const opencodePackageDir = dirname(require.resolve('opencode-ai/package.json'));

const targets = [
  {
    packageName: 'opencode-darwin-arm64',
    triple: 'aarch64-apple-darwin',
    binary: 'opencode',
  },
  {
    packageName: 'opencode-darwin-x64',
    triple: 'x86_64-apple-darwin',
    binary: 'opencode',
  },
  {
    packageName: 'opencode-linux-x64',
    triple: 'x86_64-unknown-linux-gnu',
    binary: 'opencode',
  },
  {
    packageName: 'opencode-linux-arm64',
    triple: 'aarch64-unknown-linux-gnu',
    binary: 'opencode',
  },
  {
    packageName: 'opencode-windows-x64',
    triple: 'x86_64-pc-windows-msvc',
    binary: 'opencode.exe',
  },
];

const copiedTargets = [];

await mkdir(binariesDir, { recursive: true });

for (const target of targets) {
  const source = resolve(opencodePackageDir, '..', target.packageName, 'bin', target.binary);

  try {
    await access(source);
  } catch {
    continue;
  }

  const destination = resolve(
    binariesDir,
    `opencode-${target.triple}${target.binary.endsWith('.exe') ? '.exe' : ''}`,
  );

  await copyFile(source, destination);
  if (!destination.endsWith('.exe')) {
    await chmod(destination, 0o755);
  }

  copiedTargets.push(target.triple);
}

if (copiedTargets.length === 0) {
  throw new Error('No OpenCode sidecar binaries were found in node_modules.');
}

process.stdout.write(`Prepared OpenCode sidecar binaries for: ${copiedTargets.join(', ')}\n`);
