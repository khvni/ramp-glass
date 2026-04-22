import type { MemoryEntryBucket, MemoryMarkdownFile } from '@tinker/memory';

const PREVIEW_ROOT = '/memory/demo';
const PREVIEW_PENDING_PATH = `${PREVIEW_ROOT}/Pending/writing-articles.md`;

const createFile = (
  relativePath: string,
  name: string,
  modifiedAt: string,
): MemoryMarkdownFile => ({
  absolutePath: `${PREVIEW_ROOT}/${relativePath}`,
  relativePath,
  name,
  modifiedAt,
});

export const PREVIEW_MEMORY_REFERENCE_TIME_MS = Date.parse('2026-04-22T14:00:00.000Z');

export const PREVIEW_MEMORY_BUCKETS: Record<MemoryEntryBucket, MemoryMarkdownFile[]> = {
  Pending: [
    createFile('Pending/glass-scheduled-doc.md', 'Glass Scheduled Doc', '2026-04-21T16:00:00.000Z'),
    createFile('Pending/writing-articles.md', 'Writing Articles on AI Agents', '2026-04-21T14:00:00.000Z'),
    createFile('Pending/project-glass.md', 'Project Glass', '2026-04-21T12:00:00.000Z'),
  ],
  People: new Array(27).fill(null).map((_, index) =>
    createFile(`People/person-${index + 1}.md`, `Person ${index + 1}`, '2026-04-20T12:00:00.000Z'),
  ),
  'Active Work': new Array(9).fill(null).map((_, index) =>
    createFile(
      `Active Work/work-${index + 1}.md`,
      `Active Work ${index + 1}`,
      '2026-04-20T12:00:00.000Z',
    ),
  ),
  Capabilities: new Array(2).fill(null).map((_, index) =>
    createFile(
      `Capabilities/capability-${index + 1}.md`,
      `Capability ${index + 1}`,
      '2026-04-20T12:00:00.000Z',
    ),
  ),
  Preferences: new Array(7).fill(null).map((_, index) =>
    createFile(
      `Preferences/preference-${index + 1}.md`,
      `Preference ${index + 1}`,
      '2026-04-20T12:00:00.000Z',
    ),
  ),
  Organization: new Array(2).fill(null).map((_, index) =>
    createFile(
      `Organization/organization-${index + 1}.md`,
      `Organization ${index + 1}`,
      '2026-04-20T12:00:00.000Z',
    ),
  ),
};

export const PREVIEW_MEMORY_SELECTION = {
  bucket: 'Pending' as const,
  file: PREVIEW_MEMORY_BUCKETS.Pending[1]!,
};

export const PREVIEW_MEMORY_MARKDOWN: Record<string, string> = {
  [PREVIEW_PENDING_PATH]: `---
kind: Active Work
---

# Writing Articles on AI Agents

- Publish long-form essays about agent workflows
- Capture examples from Tinker sessions
- Keep memory notes actionable and concise
`,
};

export const PREVIEW_MEMORY_DIFF: Record<string, string> = {
  [PREVIEW_PENDING_PATH]: `diff --git a/Pending/writing-articles.md b/Pending/writing-articles.md
@@
- Publish occasional notes about AI agents
+ Publish long-form essays about agent workflows
+ Capture examples from Tinker sessions
+ Keep memory notes actionable and concise
`,
};
