import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content?: string;
  url?: string;
  onEdit?: () => void;
  editable?: boolean;
}

export default function MarkdownRenderer({ content, url, onEdit, editable = false }: MarkdownRendererProps) {
  const [data, setData] = useState(content || '');

  useEffect(() => {
    if (url && !content) {
      fetch(url)
        .then(r => r.text())
        .then(t => setData(t))
        .catch(e => setData(`Error loading markdown: ${e}`));
    } else if (content) {
      setData(content);
    }
  }, [url, content]);

  return (
    <div className="relative group w-full h-full">
      {editable && onEdit && (
         <button
           onClick={onEdit}
           className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
         >
           Edit Source
         </button>
      )}
      <div className="prose prose-invert max-w-none p-4 h-full overflow-y-auto">
        <ReactMarkdown>{data}</ReactMarkdown>
      </div>
    </div>
  );
}
