import { useEffect, useState, type JSX } from 'react';
import DOMPurify from 'dompurify';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { getPanelTitleForPath } from './file-utils.js';

export type HtmlRendererProps = {
  path: string;
};

export const HtmlRenderer = ({ path }: HtmlRendererProps): JSX.Element => {
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setError(null);
        const text = await readTextFile(path);
        if (active) {
          setHtml(DOMPurify.sanitize(text));
        }
      } catch (nextError) {
        if (active) {
          setError(nextError instanceof Error ? nextError.message : String(nextError));
          setHtml('');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [path]);

  return (
    <section className="tinker-pane tinker-renderer-pane">
      <header className="tinker-pane-header">
        <div>
          <p className="tinker-eyebrow">HTML preview</p>
          <h2>{getPanelTitleForPath(path)}</h2>
        </div>
      </header>

      {error ? <p className="tinker-muted">{error}</p> : null}
      {!error ? <iframe className="tinker-preview-frame" sandbox="allow-scripts" srcDoc={html} title={path} /> : null}
    </section>
  );
};
