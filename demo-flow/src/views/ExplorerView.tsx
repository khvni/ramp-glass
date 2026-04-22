import { useState } from "react";
import { SidebarDetailLayout, DetailHeader, SidebarSearch } from "./shared/SidebarDetail";
import { explorerTree, type FileNode } from "../seed/sidebars";
import "./explorer.css";

export function ExplorerView() {
  const [selectedId, setSelectedId] = useState<string>("orb-prep");
  const [query, setQuery] = useState("");
  const selected = findNode(explorerTree, selectedId);

  return (
    <SidebarDetailLayout
      sidebarWidth={288}
      sidebar={
        <>
          <SidebarSearch placeholder="Search vault…" value={query} onChange={setQuery} />
          <div className="exp__tree scroll">
            <FileTree node={explorerTree} depth={0} selectedId={selectedId} onSelect={setSelectedId} query={query} />
          </div>
          <div className="exp__footer mono">
            <span>~/keysight-west</span>
            <span>· git synced · 2m ago</span>
          </div>
        </>
      }
      detail={
        selected && selected.kind === "file" ? (
          <FilePreview node={selected} />
        ) : selected && selected.kind === "folder" ? (
          <FolderView node={selected} onSelect={setSelectedId} />
        ) : (
          <div className="empty">
            <span className="caps">Empty state</span>
            <div className="empty__title">Select a file to preview</div>
          </div>
        )
      }
    />
  );
}

function FileTree({
  node,
  depth,
  selectedId,
  onSelect,
  query,
}: {
  node: FileNode;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
  query: string;
}) {
  if (node.kind === "folder") {
    const kids = node.children ?? [];
    return (
      <div>
        {depth > 0 && (
          <div
            className="exp__row exp__row--folder"
            style={{ paddingLeft: 10 + depth * 14 }}
            onClick={() => onSelect(node.id)}
            data-active={selectedId === node.id}
          >
            <FolderGlyph />
            <span className="exp__name">{node.name}</span>
            <span className="mono exp__count">{kids.length}</span>
          </div>
        )}
        {kids.map((c) => (
          <FileTree key={c.id} node={c} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} query={query} />
        ))}
      </div>
    );
  }

  const hidden = query && !node.name.toLowerCase().includes(query.toLowerCase());
  if (hidden) return null;

  return (
    <div
      className="exp__row"
      style={{ paddingLeft: 10 + depth * 14 }}
      onClick={() => onSelect(node.id)}
      data-active={selectedId === node.id}
    >
      <FileGlyph ext={node.ext} />
      <span className="exp__name">{node.name}</span>
      <span className="mono exp__meta">{node.size}</span>
    </div>
  );
}

function FolderGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M2 4.25c0-.55.45-1 1-1h2.25l1 1H11c.55 0 1 .45 1 1v4.5c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V4.25z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
      />
    </svg>
  );
}

function FileGlyph({ ext }: { ext?: string }) {
  const colors: Record<string, string> = {
    md: "var(--amber-ink)",
    pdf: "var(--err)",
    csv: "var(--ok)",
    jsonl: "var(--skill)",
    txt: "var(--ink-muted)",
  };
  const color = colors[ext ?? ""] ?? "var(--ink-faint)";
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M3 2h5.5L11 4.5V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"
        fill="none"
        stroke={color}
        strokeWidth={1.3}
      />
      <path d="M8.5 2v2.5H11" fill="none" stroke={color} strokeWidth={1.3} />
    </svg>
  );
}

function FilePreview({ node }: { node: FileNode }) {
  const isMd = node.ext === "md";
  const isCsv = node.ext === "csv";
  return (
    <>
      <DetailHeader
        title={node.name}
        subtitle={
          <>
            <span className="mono">{node.size}</span>
            <span>·</span>
            <span>modified {node.modified}</span>
            <span>·</span>
            <span className="mono">vault/{node.name}</span>
          </>
        }
        actions={
          <>
            <button className="sd-btn sd-btn--ghost">open in editor</button>
            <button className="sd-btn">reveal</button>
            <button className="sd-btn sd-btn--primary">share</button>
          </>
        }
      />
      <div className="sd-detail-body">
        {node.preview ? (
          isMd ? (
            <pre className="exp__preview-md">{node.preview}</pre>
          ) : isCsv ? (
            <CsvPreview text={node.preview} />
          ) : (
            <pre className="exp__preview-mono">{node.preview}</pre>
          )
        ) : (
          <div className="exp__no-preview">
            <span className="caps">No preview</span>
            <p>Binary or large file — use “open in editor” to view.</p>
          </div>
        )}
      </div>
    </>
  );
}

function CsvPreview({ text }: { text: string }) {
  const lines = text.trim().split("\n");
  const head = lines[0]?.split(",") ?? [];
  const rows = lines.slice(1).map((l) => l.split(","));
  return (
    <div className="doc__table-wrap">
      <table className="doc__table doc__table--dense">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="caps">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === 4 || j === 6 ? "mono" : ""}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FolderView({ node, onSelect }: { node: FileNode; onSelect: (id: string) => void }) {
  const kids = node.children ?? [];
  return (
    <>
      <DetailHeader
        title={node.name}
        subtitle={
          <>
            <span>{kids.length} items</span>
            <span>·</span>
            <span className="mono">vault/{node.name}</span>
          </>
        }
      />
      <div className="sd-detail-body">
        <div className="exp__grid">
          {kids.map((k) => (
            <button key={k.id} className="exp__grid-item" onClick={() => onSelect(k.id)}>
              {k.kind === "folder" ? <FolderGlyph /> : <FileGlyph ext={k.ext} />}
              <span className="exp__grid-name">{k.name}</span>
              {k.modified && <span className="mono exp__grid-meta">{k.modified}</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function findNode(root: FileNode, id: string): FileNode | null {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const f = findNode(c, id);
    if (f) return f;
  }
  return null;
}
