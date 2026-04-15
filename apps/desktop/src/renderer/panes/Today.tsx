import { useEffect, useState, type JSX } from 'react';
import type { Entity, MemoryStore, ScheduledJobStore, ScheduledTodayEntry } from '@tinker/shared-types';

type TodayProps = {
  memoryStore: MemoryStore;
  schedulerStore: ScheduledJobStore;
  vaultPath: string | null;
  vaultRevision: number;
  schedulerRevision: number;
};

export const Today = ({ memoryStore, schedulerStore, vaultPath, vaultRevision, schedulerRevision }: TodayProps): JSX.Element => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [scheduledEntries, setScheduledEntries] = useState<ScheduledTodayEntry[]>([]);

  useEffect(() => {
    let active = true;

    void (async () => {
      const [nextEntities, nextEntries] = await Promise.all([
        memoryStore.recentEntities(8),
        schedulerStore.listTodayEntries(4),
      ]);
      if (active) {
        setEntities(nextEntities);
        setScheduledEntries(nextEntries);
      }
    })();

    return () => {
      active = false;
    };
  }, [memoryStore, schedulerStore, vaultPath, vaultRevision, schedulerRevision]);

  return (
    <section className="tinker-pane">
      <header className="tinker-pane-header">
        <div>
          <p className="tinker-eyebrow">Today</p>
          <h2>Recent local memory</h2>
        </div>
        <span className="tinker-pill">{vaultPath ? 'Vault connected' : 'No vault yet'}</span>
      </header>

      <div className="tinker-list">
        {scheduledEntries.length > 0 ? (
          <>
            <article className="tinker-list-item">
              <h3>Scheduled outputs</h3>
              <p className="tinker-muted">Latest jobs routed into Today.</p>
            </article>

            {scheduledEntries.map((entry) => (
              <article key={entry.runId} className="tinker-list-item">
                <h3>{entry.jobName}</h3>
                <p className="tinker-muted">
                  {entry.section} • {new Date(entry.finishedAt).toLocaleString()}
                </p>
                <p className="tinker-today-output">{entry.outputText}</p>
              </article>
            ))}
          </>
        ) : null}

        {entities.length === 0 ? (
          <div className="tinker-list-item">
            <h3>No indexed notes yet</h3>
            <p className="tinker-muted">
              Connect a vault or create the default one. Tinker will surface recent notes and entities here.
            </p>
          </div>
        ) : null}

        {entities.map((entity) => (
          <article key={entity.id} className="tinker-list-item">
            <h3>{entity.name}</h3>
            <p className="tinker-muted">
              {entity.kind} • {new Date(entity.lastSeenAt).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};
