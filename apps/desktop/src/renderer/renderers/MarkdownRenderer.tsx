import { useEffect, useState, type JSX } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import type { IDockviewPanelProps } from 'dockview-react';
import { parseFrontmatter } from '@tinker/memory';
import { getPanelTitleForPath, type FilePaneParams } from './file-utils.js';
import { readTextFile } from '@tauri-apps/plugin-fs';

const renderMarkdown = async (text: string): Promise<string> => {
  const { body } = parseFrontmatter(text);
  const html = await marked.parse(body);
  return DOMPurify.sanitize(html);
};

type MarkdownRendererProps = IDockviewPanelProps<FilePaneParams> & {
  vaultRevision: number;
};

export const MarkdownRenderer = ({ api, params, vaultRevision }: MarkdownRendererProps): JSX.Element => {
  void api;
  const path = params?.path;
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setError('Missing markdown file path.');
      setHtml('');
      return;
    }

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
          <h2>{path ? getPanelTitleForPath(path) : 'Untitled note'}</h2>
        </div>
      </header>

      {error ? <p className="tinker-muted">{error}</p> : null}
      {!error && html ? <article className="tinker-markdown-body" dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </section>
  );
};
