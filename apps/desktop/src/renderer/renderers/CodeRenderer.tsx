import { useEffect, useMemo, useState, type JSX } from 'react';
import DOMPurify from 'dompurify';
import { Badge } from '@tinker/design';
import { readTextFile } from '../electron-shims-fs.js';
import { getCodeLanguage, getPanelTitleForPath, type FilePaneParams } from './file-utils.js';
import { highlightCode, MAX_HIGHLIGHTABLE_CODE_LENGTH } from './code-highlighter.js';

export const CodeRenderer = ({ params }: { params?: FilePaneParams }): JSX.Element => {
  const path = params?.path;
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [rawHighlighted, setRawHighlighted] = useState<string | null>(null);
  const sanitizedHighlighted = useMemo(
    () => (rawHighlighted ? DOMPurify.sanitize(rawHighlighted) : null),
    [rawHighlighted],
  );
  const language = path ? getCodeLanguage(path, params?.mime) : 'plaintext';

  useEffect(() => {
    if (!path) {
      setError('Missing file path.');
      setContent('');
      setRawHighlighted(null);
      return;
    }

    let active = true;

    void (async () => {
      try {
        setError(null);
        setContent('');
        setRawHighlighted(null);
        const text = await readTextFile(path);
        if (active) {
          setContent(text);
          if (text.length <= MAX_HIGHLIGHTABLE_CODE_LENGTH) {
            const html = await highlightCode(text, language);
            if (active) {
              setRawHighlighted(html);
            }
          }
        }
      } catch (nextError) {
        if (active) {
          setError(nextError instanceof Error ? nextError.message : String(nextError));
          setContent('');
          setRawHighlighted(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [language, path]);

  return (
    <section className="tinker-pane tinker-renderer-pane">
      <header className="tinker-pane-header">
        <div>
          <p className="tinker-eyebrow">Code</p>
          <h2>{path ? getPanelTitleForPath(path) : 'Untitled file'}</h2>
        </div>
        {path ? <Badge variant="default" size="small">{language}</Badge> : null}
      </header>

      {error ? <p className="tinker-muted">{error}</p> : null}
      {!error ? (
        <pre className={`tinker-code-block${sanitizedHighlighted ? ' tinker-code-block--highlighted' : ''}`}>
          {sanitizedHighlighted ? (
            <code
              className={`tinker-code-content hljs language-${language}`}
              dangerouslySetInnerHTML={{ __html: sanitizedHighlighted }}
            />
          ) : (
            <code className={`tinker-code-content language-${language}`}>{content}</code>
          )}
        </pre>
      ) : null}
    </section>
  );
};
