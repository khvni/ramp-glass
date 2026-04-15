import { describe, expect, it } from 'vitest';
import { countSkippedRuns, getFutureRunAfter, parseScheduleInput } from './schedule.js';

describe('parseScheduleInput', () => {
  it('parses weekday natural language into cron', () => {
    const parsed = parseScheduleInput('every weekday at 8am', 'America/Los_Angeles', new Date('2026-04-15T12:00:00Z'));
    expect(parsed.expression).toBe('0 8 * * 1-5');
    expect(parsed.source).toBe('natural-language');
  });

  it('accepts alias expressions', () => {
    const parsed = parseScheduleInput('@daily', 'UTC', new Date('2026-04-15T12:00:00Z'));
    expect(parsed.expression).toBe('@daily');
    expect(parsed.source).toBe('cron');
  });
});

describe('countSkippedRuns', () => {
  it('skips missed daily runs without stacking', () => {
    const result = countSkippedRuns(
      '0 8 * * *',
      'UTC',
      new Date('2026-04-10T08:00:00.000Z'),
      new Date('2026-04-13T10:00:00.000Z'),
    );

    expect(result.skippedCount).toBe(4);
    expect(result.nextRunAt).toBe(getFutureRunAfter('0 8 * * *', 'UTC', new Date('2026-04-13T08:00:00.000Z')));
  });
});
