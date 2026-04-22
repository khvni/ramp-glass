import { useEffect, useState, type JSX } from 'react';
import DOMPurify from 'dompurify';
import { readFile } from '@tauri-apps/plugin-fs';
import { open as openExternal } from '@tauri-apps/plugin-shell';
import { Button } from '@tinker/design';
import type mammoth from 'mammoth';
import type { IDockviewPanelProps } from 'dockview-react';
import { getPanelTitleForPath, type FilePaneParams } from '../file-utils.js';

const BYTES_PER_MEGABYTE = 1024 * 1024;

export const MAX_DOCX_PREVIEW_BYTES = 15 * BYTES_PER_MEGABYTE;

type MammothModule = typeof mammoth;
type MammothConversionResult = Awaited<ReturnType<MammothModule['convertToHtml']>>;
type MammothMessage = MammothConversionResult['messages'][number];
export type DocxConverter = Pick<MammothModule, 'convertToHtml' | 'images'>;

type ConvertDocxToHtmlDependencies = {
  mammothModule?: DocxConverter;
  sanitizeHtml?: (html: string) => string;
};

type ConvertDocxToHtmlResult = {
  html: string;
  messages: readonly MammothMessage[];
};

export const sanitizeDocxHtml = (html: string): string => {
  return DOMPurify.sanitize(html);
};

const loadMammoth = async (): Promise<DocxConverter> => {
  const mammothModule = await import('mammoth');
  return mammothModule.default;
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.slice().buffer;
};

export const isDocxPreviewTooLarge = (sizeInBytes: number): boolean => {
  return sizeInBytes > MAX_DOCX_PREVIEW_BYTES;
};

export const convertDocxToHtml = async (
  bytes: Uint8Array,
  dependencies: ConvertDocxToHtmlDependencies = {},
): Promise<ConvertDocxToHtmlResult> => {
  const mammothModule = dependencies.mammothModule ?? (await loadMammoth());
  const sanitizeHtml = dependencies.sanitizeHtml ?? sanitizeDocxHtml;
  const result = await mammothModule.convertToHtml(
    { arrayBuffer: toArrayBuffer(bytes) },
    { convertImage: mammothModule.images.dataUri },
  );

  return {
    html: sanitizeHtml(result.value),
    messages: result.messages,
  };
};

const logDocxMessages = (path: string, messages: readonly MammothMessage[]): void => {
  for (const message of messages) {
    const logger = message.type === 'warning' ? console.warn : console.error;
    logger(`[DocxRenderer] ${path}: ${message.message}`);
  }
};

export const DocxRenderer = ({ params }: IDockviewPanelProps<FilePaneParams>): JSX.Element => {
  const path = params?.path;
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!path) {
      setError('Missing DOCX file path.');
      setHtml('');
      setLoading(false);
      return;
    }

    let active = true;

    void (async () => {
      try {
        setError(null);
        setHtml('');
        setLoading(true);

        const bytes = await readFile(path);
        if (isDocxPreviewTooLarge(bytes.byteLength)) {
          throw new Error('DOCX file too large for inline preview. Open externally.');
        }

        const result = await convertDocxToHtml(bytes);
        if (!active) {
          return;
        }

        logDocxMessages(path, result.messages);
        setHtml(result.html);
      } catch (nextError) {
        if (active) {
          setError(nextError instanceof Error ? nextError.message : String(nextError));
          setHtml('');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [path]);

  const handleOpenExternal = async (): Promise<void> => {
    if (!path) {
      return;
    }

    setOpening(true);
    try {
      await openExternal(path);
    } finally {
      setOpening(false);
    }
  };

  return (
    <section className="tinker-pane tinker-renderer-pane">
      <header className="tinker-pane-header">
        <div>
          <p className="tinker-eyebrow">DOCX preview</p>
          <h2>{path ? getPanelTitleForPath(path) : 'Untitled document'}</h2>
        </div>
      </header>

      {error ? <p className="tinker-muted">{error}</p> : null}
      {error ? (
        <div className="tinker-inline-actions">
          <Button
            variant="secondary"
            size="s"
            onClick={() => void handleOpenExternal()}
            disabled={opening || !path}
          >
            {opening ? 'Opening…' : 'Open externally'}
          </Button>
        </div>
      ) : null}
      {loading ? <p className="tinker-muted">Rendering preview…</p> : null}
      {!error && !loading && html ? (
        <article
          className="tinker-markdown-body tinker-docx-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
      {!error && !loading && !html ? <p className="tinker-muted">Empty document.</p> : null}
    </section>
  );
};
