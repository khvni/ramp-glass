export type GlassBridgeConfig = {
  openCodeUrl: string;
  memoryTopK?: number;
};

export type StreamEvent =
  | { type: 'token'; text: string }
  | { type: 'tool_call'; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; name: string; output: string }
  | { type: 'file_written'; path: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export type GlassBridge = {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(sessionId: string, text: string): AsyncIterable<StreamEvent>;
  listModels(): Promise<Array<{ id: string; name: string }>>;
  setModel(modelId: string): Promise<void>;
};

export const createGlassBridge = (_config: GlassBridgeConfig): GlassBridge => {
  throw new Error('glass-bridge: not yet implemented — see tasks/glass-bridge.md');
};
