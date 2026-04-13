import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeRendererProps {
  content?: string;
  url?: string;
  language?: string;
}

export default function CodeRenderer({ content, url, language = 'javascript' }: CodeRendererProps) {
  const [data, setData] = useState(content || '');

  useEffect(() => {
    if (url && !content) {
      fetch(url)
        .then(r => r.text())
        .then(t => setData(t))
        .catch(e => setData(`// Error loading code: ${e}`));
    }
  }, [url, content]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        theme="vs-dark"
        value={data}
        options={{
          readOnly: true,
          minimap: { enabled: false }
        }}
      />
    </div>
  );
}
