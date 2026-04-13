import { useEffect, useState } from 'react';
import type { PaneComponent } from '../workspace/pane-registry.js';
import type { Entity } from '@ramp-glass/shared-types';

export const Today: PaneComponent = ({ paneId }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.glass.invoke('vault:getRecentEntities', 50)
      .then((res) => {
        setEntities(res as Entity[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load recent entities:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Today in Glass</h2>

      {loading ? (
         <p className="text-gray-400">Loading your knowledge base...</p>
      ) : (
         <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">Recent Entities</h3>
            {entities.length === 0 ? (
               <p className="text-gray-500 italic">No recent memory entities found. Connect a Vault or chat to build memory.</p>
            ) : (
               <ul className="space-y-4">
                 {entities.map(ent => (
                   <li key={ent.id} className="bg-gray-800 p-4 rounded border border-gray-700">
                     <div className="font-medium text-lg text-blue-400">{ent.name}</div>
                     <div className="text-sm text-gray-400 capitalize">{ent.kind}</div>
                     {ent.aliases && ent.aliases.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">Aliases: {ent.aliases.join(', ')}</div>
                     )}
                     <div className="text-xs text-gray-500 mt-1">Seen: {new Date(ent.lastSeenAt).toLocaleString()}</div>
                   </li>
                 ))}
               </ul>
            )}
         </div>
      )}
    </div>
  );
};
