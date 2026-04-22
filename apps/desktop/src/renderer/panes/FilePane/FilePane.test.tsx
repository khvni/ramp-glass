import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { getRenderer, resetPaneRegistry } from '../../workspace/pane-registry.js';
import { FilePane, MARKDOWN_EDITOR_MIME, mimeToRenderer, registerFilePane } from './index.js';

describe('FilePane', () => {
  afterEach(() => {
    resetPaneRegistry();
  });

  it('registers file pane kind with the dispatch component', () => {
    registerFilePane();

    const element = getRenderer('file')({
      kind: 'file',
      path: '/tmp/note.md',
      mime: 'text/markdown',
    });

    expect(isValidElement(element)).toBe(true);
    if (!isValidElement(element)) {
      throw new Error('registerFilePane did not return a React element.');
    }

    expect(element.type).toBe(FilePane);
    expect(element.props).toMatchObject({
      data: {
        kind: 'file',
        path: '/tmp/note.md',
        mime: 'text/markdown',
      },
    });
  });

  it('dispatches known MIME types through mimeToRenderer', () => {
    const markup = renderToStaticMarkup(
      <FilePane
        data={{
          kind: 'file',
          path: '/tmp/table.csv',
          mime: 'text/csv',
        }}
      />,
    );

    expect(mimeToRenderer['text/csv']).toBeDefined();
    expect(markup).toContain('CSV');
    expect(markup).toContain('table.csv');
  });

  it('supports the temporary markdown editor MIME until the editor flow is replaced', () => {
    expect(mimeToRenderer[MARKDOWN_EDITOR_MIME]).toBeDefined();
  });

  it('renders unsupported fallback UI for unknown MIME types', () => {
    const markup = renderToStaticMarkup(
      <FilePane
        data={{
          kind: 'file',
          path: '/tmp/archive.bin',
          mime: 'application/octet-stream',
        }}
      />,
    );

    expect(markup).toContain('Unsupported file');
    expect(markup).toContain('Unsupported, open externally.');
    expect(markup).toContain('Open externally');
    expect(markup).toContain('application/octet-stream');
  });
});
