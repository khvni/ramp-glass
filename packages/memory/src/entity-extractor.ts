import type { Entity } from '@ramp-glass/shared-types';

/**
 * A lightweight heuristic to extract entities without calling an LLM.
 * Looks for simple patterns like @person, #project, or basic named patterns.
 */
export function extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];
    const now = new Date().toISOString();

    // 1. Mentions (@name) -> person
    const mentions = new Set(text.match(/@([A-Za-z0-9_]+)/g));
    for (const match of mentions) {
        const name = match.slice(1);
        entities.push({
            id: `person-${name.toLowerCase()}`,
            kind: 'person',
            name: name,
            aliases: [name],
            sources: [],
            attributes: {},
            lastSeenAt: now
        });
    }

    // 2. Hashtags (#project) -> project
    const hashtags = new Set(text.match(/#([A-Za-z0-9_]+)/g));
    for (const match of hashtags) {
        const name = match.slice(1);
        entities.push({
            id: `project-${name.toLowerCase()}`,
            kind: 'project',
            name: name,
            aliases: [name],
            sources: [],
            attributes: {},
            lastSeenAt: now
        });
    }

    return entities;
}
