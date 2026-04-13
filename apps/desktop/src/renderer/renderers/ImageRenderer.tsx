import React from 'react';

interface ImageRendererProps {
  url: string;
  alt?: string;
}

export default function ImageRenderer({ url, alt = 'Rendered Image' }: ImageRendererProps) {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-900 p-4">
      <img src={url} alt={alt} className="max-w-full max-h-full object-contain" />
    </div>
  );
}
