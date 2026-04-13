import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface CsvRendererProps {
  content?: string;
  url?: string;
}

export default function CsvRenderer({ content, url }: CsvRendererProps) {
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    if (content) {
      Papa.parse(content, {
        complete: (results) => setData(results.data as string[][])
      });
    } else if (url) {
      fetch(url)
        .then(r => r.text())
        .then(t => Papa.parse(t, { complete: (results) => setData(results.data as string[][]) }))
        .catch(e => console.error('Failed to load CSV:', e));
    }
  }, [url, content]);

  if (data.length === 0) return <div className="p-4">Loading CSV...</div>;

  return (
    <div className="overflow-auto h-full w-full bg-white text-black p-4">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            {data[0]?.map((h, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.slice(1).map((row, r) => (
            <tr key={r}>
              {row.map((c, cIdx) => (
                <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
