type Props = { title: string; note?: string };

/** Temporary stub — replaced by full per-view implementations in a follow-up. */
export function Stub({ title, note }: Props) {
  return (
    <div className="empty" style={{ height: "100%" }}>
      <span className="caps">Preview</span>
      <div className="empty__title">{title}</div>
      {note && <p style={{ maxWidth: 420 }}>{note}</p>}
    </div>
  );
}
