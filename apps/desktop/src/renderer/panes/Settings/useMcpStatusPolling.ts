import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OpencodeConnection } from '../../../bindings.js';
import {
  BUILTIN_MCP_NAMES,
  normalizeMcpRowStatus,
  type BuiltinMcpName,
  type MCPStatus,
} from '../../integrations.js';
import { createWorkspaceClient, getOpencodeDirectory } from '../../opencode.js';

const DEFAULT_POLL_INTERVAL_MS = 4_000;

type McpStatusLike = {
  status?: string;
  error?: string;
};

type McpStatusApiResponse = {
  data?: Record<string, McpStatusLike | undefined> | undefined;
  error?: unknown;
};

/**
 * Calling shape kept tiny so tests can stub it without pulling in the whole
 * OpenCode SDK. Real callers pass `client.mcp.status`.
 */
export type LoadMcpStatus = () => Promise<McpStatusApiResponse>;

export type UseMcpStatusPollingOptions = {
  connection: OpencodeConnection | null;
  vaultPath: string | null;
  memoryPath?: string | null | undefined;
  seedStatuses?: Partial<Record<BuiltinMcpName, MCPStatus>> | undefined;
  intervalMs?: number | undefined;
  loadStatus?: LoadMcpStatus | undefined;
};

export type UseMcpStatusPollingResult = {
  statuses: Record<BuiltinMcpName, MCPStatus>;
  refresh(): Promise<void>;
  setRowStatus(name: BuiltinMcpName, next: MCPStatus): void;
};

const createInitialStatuses = (
  seed?: Partial<Record<BuiltinMcpName, MCPStatus>>,
): Record<BuiltinMcpName, MCPStatus> => {
  const initial = {} as Record<BuiltinMcpName, MCPStatus>;
  for (const name of BUILTIN_MCP_NAMES) {
    initial[name] = seed?.[name] ?? { status: 'checking' };
  }
  return initial;
};

const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'OpenCode MCP status request failed.';
};

export const useMcpStatusPolling = (
  options: UseMcpStatusPollingOptions,
): UseMcpStatusPollingResult => {
  const { connection, vaultPath, memoryPath, seedStatuses, intervalMs, loadStatus } = options;
  const [statuses, setStatuses] = useState<Record<BuiltinMcpName, MCPStatus>>(() =>
    createInitialStatuses(seedStatuses),
  );

  const lastRequestId = useRef(0);
  const activeRef = useRef(true);

  const connectionKey = connection
    ? `${connection.baseUrl}:${connection.username}:${connection.password}`
    : 'none';

  const defaultLoader = useMemo<LoadMcpStatus | null>(() => {
    if (!connection) {
      return null;
    }
    const directory = getOpencodeDirectory(vaultPath);
    return () => {
      const client = createWorkspaceClient(connection, directory);
      return client.mcp.status() as unknown as Promise<McpStatusApiResponse>;
    };
  }, [connection, connectionKey, vaultPath]);

  const loader = loadStatus ?? defaultLoader;

  const mergeStatuses = useCallback(
    (response: McpStatusApiResponse) => {
      setStatuses((current) => {
        const next = { ...current };
        if (response.data === undefined) {
          if (response.error !== undefined) {
            for (const name of BUILTIN_MCP_NAMES) {
              next[name] = { status: 'failed', error: formatError(response.error) };
            }
          }
          return next;
        }
        for (const name of BUILTIN_MCP_NAMES) {
          const raw = response.data[name];
          next[name] = normalizeMcpRowStatus({ name, raw, memoryPath: memoryPath ?? null });
        }
        return next;
      });
    },
    [memoryPath],
  );

  const refresh = useCallback(async (): Promise<void> => {
    if (!loader) {
      return;
    }
    const requestId = lastRequestId.current + 1;
    lastRequestId.current = requestId;
    try {
      const response = await loader();
      if (!activeRef.current || requestId !== lastRequestId.current) {
        return;
      }
      mergeStatuses(response);
    } catch (error) {
      if (!activeRef.current || requestId !== lastRequestId.current) {
        return;
      }
      setStatuses((current) => {
        const next = { ...current };
        for (const name of BUILTIN_MCP_NAMES) {
          next[name] = { status: 'failed', error: formatError(error) };
        }
        return next;
      });
    }
  }, [loader, mergeStatuses]);

  const setRowStatus = useCallback((name: BuiltinMcpName, next: MCPStatus): void => {
    setStatuses((current) => ({ ...current, [name]: next }));
  }, []);

  useEffect(() => {
    activeRef.current = true;
    if (!loader) {
      return () => {
        activeRef.current = false;
      };
    }

    void refresh();
    const handle = window.setInterval(() => {
      void refresh();
    }, intervalMs ?? DEFAULT_POLL_INTERVAL_MS);

    return () => {
      activeRef.current = false;
      window.clearInterval(handle);
    };
  }, [loader, refresh, intervalMs]);

  return { statuses, refresh, setRowStatus };
};
