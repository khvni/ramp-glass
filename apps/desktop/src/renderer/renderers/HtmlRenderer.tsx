import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface HtmlRendererProps {
  content?: string;
  url?: string;
}

export default function HtmlRenderer({ content, url }: HtmlRendererProps) {
  const [data, setData] = useState(content || '');

  useEffect(() => {
    if (url && !content) {
      fetch(url)
        .then(r => r.text())
        .then(t => setData(t))
        .catch(e => setData(`<div>Error loading HTML: ${e}</div>`));
    }
  }, [url, content]);

  const sanitized = DOMPurify.sanitize(data);

  return (
    <div className="w-full h-full bg-white text-black overflow-auto p-4">
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}
