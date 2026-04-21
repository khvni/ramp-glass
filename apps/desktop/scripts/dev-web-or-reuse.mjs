import { execFile, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const desktopDir = resolve(scriptDir, '..');
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const host = '127.0.0.1';
const port = 1420;
const devUrl = `http://${host}:${port}`;
const requestTimeoutMs = 1_500;
const execFileAsync = promisify(execFile);

await import('./prepare-opencode-sidecar.mjs');

const getListeningProcess = async () => {
  if (process.platform === 'win32') {
    return null;
  }

  try {
    const { stdout } = await execFileAsync('lsof', ['-n', `-iTCP:${port}`, '-sTCP:LISTEN']);
    const listenerLine = stdout
      .split('\n')
      .slice(1)
      .map((line) => line.trim())
      .find((line) => line.length > 0);

    if (!listenerLine) {
      return null;
    }

    const [command, pid] = listenerLine.split(/\s+/, 3);
    return { command, pid };
  } catch {
    return null;
  }
};

const inspectHttpServer = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(devUrl, {
      headers: { accept: 'text/html' },
      signal: controller.signal,
    });
    const html = await response.text();
    const looksLikeTinker =
      html.includes('<title>Tinker</title>') ||
      html.includes('id="root"') ||
      html.includes('/@vite/client');

    return looksLikeTinker
      ? { state: 'reusable' }
      : {
          state: 'occupied',
          detail: `Port ${port} is already in use by an HTTP server that does not look like Tinker.`,
        };
  } catch (error) {
    return {
      state: 'unknown',
      detail: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
};

const inspectExistingServer = async () => {
  const listener = await getListeningProcess();
  if (!listener) {
    return { state: 'missing' };
  }

  const httpInspection = await inspectHttpServer();
  if (httpInspection.state === 'reusable' || httpInspection.state === 'occupied') {
    return httpInspection;
  }

  const command = listener.command.toLowerCase();
  if (command === 'node' || command === 'pnpm' || command === 'bun' || command === 'deno') {
    return {
      state: 'reusable',
      detail: `Reusing existing ${listener.command} listener on ${devUrl}; HTTP validation was unavailable (${httpInspection.detail}).`,
    };
  }

  return {
    state: 'occupied',
    detail: `Port ${port} is already in use by ${listener.command} (pid ${listener.pid}) and could not be validated as a Tinker dev server (${httpInspection.detail}).`,
  };
};

const existing = await inspectExistingServer();
if (existing.state === 'reusable') {
  process.stdout.write(`${existing.detail ?? `Reusing existing Tinker dev server at ${devUrl}`}\n`);
  process.exit(0);
}

if (existing.state === 'occupied') {
  throw new Error(existing.detail);
}

const child = spawn(pnpmCommand, ['exec', 'vite', '--host', host, '--port', String(port)], {
  cwd: desktopDir,
  stdio: 'inherit',
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
const signalHandlers = new Map();
for (const signal of signals) {
  const handler = () => forwardSignal(signal);
  signalHandlers.set(signal, handler);
  process.on(signal, handler);
}

const exitCode = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', (code, signal) => {
    if (signal) {
      resolve(1);
      return;
    }

    resolve(code ?? 0);
  });
});

for (const signal of signals) {
  const handler = signalHandlers.get(signal);
  if (handler) {
    process.off(signal, handler);
  }
}

process.exit(exitCode);
