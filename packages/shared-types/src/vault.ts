export type VaultConfig = {
  path: string;
  isNew: boolean;
};

export type VaultNote = {
  relativePath: string;
  title: string;
  frontmatter: Record<string, unknown>;
  body: string;
  lastModified: string;
};

export type VaultService = {
  init(config: VaultConfig): Promise<void>;
  readNote(relativePath: string): Promise<VaultNote | null>;
  writeNote(relativePath: string, frontmatter: Record<string, unknown>, body: string): Promise<void>;
  listNotes(glob?: string): Promise<string[]>;
  watch(onChange: (path: string) => void): () => void;
};
