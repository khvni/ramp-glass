import { useEffect, useState, type JSX } from 'react';
import { Button } from '@tinker/design';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { parseFrontmatter } from '@tinker/memory';
import { getPanelTitleForPath } from './file-utils.js';
import { readTextFile } from '@tauri-apps/plugin-fs';

const renderMarkdown = async (text: string): Promise<string> => {
  const { body } = parseFrontmatter(text);
  const html = await marked.parse(body);
  return DOMPurify.sanitize(html);
};

export type MarkdownRendererProps = {
  path: string;
  vaultRevision: number;
  onEdit?: () => void;
};

export const MarkdownRenderer = ({ path, vaultRevision, onEdit }: MarkdownRendererProps): JSX.Element => {
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setError(null);
        const text = await readTextFile(path);
        const rendered = await renderMarkdown(text);
        if (active) {
          setHtml(rendered);
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
  }, [path, vaultRevision]);

  return (
    <section className="tinker-pane tinker-renderer-pane">
      <header className="tinker-pane-header">
        <div>
          <p className="tinker-eyebrow">Markdown</p>
          <h2>{getPanelTitleForPath(path)}</h2>
        </div>
        {onEdit ? (
          <Button variant="secondary" size="s" onClick={onEdit}>
            Edit note
          </Button>
        ) : null}
      </header>

      {error ? <p className="tinker-muted">{error}</p> : null}
      {!error && html ? <article className="tinker-markdown-body" dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </section>
  );
};
