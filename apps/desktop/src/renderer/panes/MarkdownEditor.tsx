import React, { useState } from 'react';
import type { PaneComponent } from '../workspace/pane-registry.js';
import Editor from '@monaco-editor/react';
import MarkdownRenderer from '../renderers/MarkdownRenderer.js';

export const MarkdownEditor: PaneComponent = ({ paneId, props }) => {
    const initialContent = (props?.content as string) || '';
    const [content, setContent] = useState(initialContent);
    const [mode, setMode] = useState<'view' | 'edit'>('view');

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-100">
            <div className="flex justify-between items-center bg-gray-800 p-2 border-b border-gray-700">
                <div className="text-sm text-gray-400 font-medium">Markdown Editor</div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('view')}
                        className={`px-3 py-1 rounded text-xs font-medium ${mode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        View
                    </button>
                    <button
                        onClick={() => setMode('edit')}
                        className={`px-3 py-1 rounded text-xs font-medium ${mode === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Edit
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {mode === 'edit' ? (
                    <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        theme="vs-dark"
                        value={content}
                        onChange={(val) => setContent(val || '')}
                        options={{
                            minimap: { enabled: false },
                            wordWrap: 'on'
                        }}
                    />
                ) : (
                    <div className="h-full bg-gray-900 overflow-auto">
                        <MarkdownRenderer content={content} editable={true} onEdit={() => setMode('edit')} />
                    </div>
                )}
            </div>
        </div>
    );
};
