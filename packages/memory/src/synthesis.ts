import fs from 'node:fs/promises';
import path from 'node:path';
import type { MemoryStore } from '@ramp-glass/shared-types';

/**
 * Stub for daily synthesis running on a background worker.
 * Mines the last 24h, updates vault markdown, writes a daily note.
 */
export async function runDailySynthesis(vaultPath: string, store: MemoryStore): Promise<void> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const summaryFileName = `daily-summary-${dateStr}.md`;
    const fullPath = path.join(vaultPath, summaryFileName);

    const recents = await store.recentEntities(50);

    let content = `---\n`;
    content += `title: Daily Summary ${dateStr}\n`;
    content += `date: ${dateStr}\n`;
    content += `---\n\n`;

    content += `# Daily Synthesis\n\n`;
    content += `Entities touched today:\n`;

    for (const ent of recents) {
        content += `- **${ent.name}** (${ent.kind})\n`;
    }

    if (recents.length === 0) {
        content += `_No major activities observed today._\n`;
    }

    try {
      await fs.writeFile(fullPath, content, 'utf8');
    } catch (err: any) {
        // If directory doesn't exist, ignore or fail gracefully
        if (err.code !== 'ENOENT') throw err;
    }
}
