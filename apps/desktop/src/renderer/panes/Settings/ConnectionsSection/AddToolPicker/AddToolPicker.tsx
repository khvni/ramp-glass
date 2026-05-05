import { useCallback, useState, type ChangeEvent, type JSX } from 'react';
import { Button, Modal, TextInput } from '@tinker/design';
import type { CustomMcpEntry } from '@tinker/shared-types';
import { CATALOG_MCPS, type CatalogMcp } from './available-mcps.js';
import './AddToolPicker.css';

export type AddToolPickerProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: CustomMcpEntry) => void;
  existingIds: ReadonlyArray<string>;
};

type View = 'catalog' | 'custom';

const generateId = (): string => `mcp-${Date.now().toString(36)}`;

const useField = (initial = ''): [string, (e: ChangeEvent<HTMLInputElement>) => void, () => void] => {
  const [value, setValue] = useState(initial);
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value), []);
  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, onChange, reset];
};

export const AddToolPicker = ({
  open,
  onClose,
  onAdd,
  existingIds,
}: AddToolPickerProps): JSX.Element => {
  const [view, setView] = useState<View>('catalog');
  const [label, onLabelChange, resetLabel] = useField();
  const [url, onUrlChange, resetUrl] = useField();
  const [headerName, onHeaderNameChange, resetHeaderName] = useField();
  const [headerValue, onHeaderValueChange, resetHeaderValue] = useField();

  const resetForm = useCallback(() => {
    setView('catalog');
    resetLabel();
    resetUrl();
    resetHeaderName();
    resetHeaderValue();
  }, [resetLabel, resetUrl, resetHeaderName, resetHeaderValue]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleAddCustom = useCallback(() => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    let hostname = trimmedUrl;
    try {
      hostname = new URL(trimmedUrl).hostname;
    } catch {
      // keep raw URL as label fallback
    }

    const entry: CustomMcpEntry = {
      id: generateId(),
      label: label.trim() || hostname,
      url: trimmedUrl,
      headerName: headerName.trim(),
      headerValue: headerValue.trim(),
      enabled: true,
    };
    onAdd(entry);
    handleClose();
  }, [url, label, headerName, headerValue, onAdd, handleClose]);

  const handleAddCatalog = useCallback(
    (catalog: CatalogMcp, secret: string) => {
      const entry: CustomMcpEntry = {
        id: catalog.id,
        label: catalog.label,
        url: catalog.url,
        headerName: catalog.headerName,
        headerValue: secret.trim(),
        enabled: true,
      };
      onAdd(entry);
      handleClose();
    },
    [onAdd, handleClose],
  );

  const isCustomValid = url.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a tool"
      contentClassName="tinker-add-tool-picker"
    >
      {view === 'catalog' ? (
        <CatalogView
          existingIds={existingIds}
          onAddCatalog={handleAddCatalog}
          onSwitchToCustom={() => setView('custom')}
        />
      ) : (
        <div className="tinker-add-tool-picker__custom-form">
          <p className="tinker-add-tool-picker__intro tinker-muted">
            Enter any MCP server URL. Add an auth header if the server requires one.
          </p>

          <div className="tinker-add-tool-picker__fields">
            <label className="tinker-add-tool-picker__field">
              <span className="tinker-add-tool-picker__field-label">Label (optional)</span>
              <TextInput value={label} onChange={onLabelChange} placeholder="My MCP server" />
            </label>
            <label className="tinker-add-tool-picker__field">
              <span className="tinker-add-tool-picker__field-label">MCP URL</span>
              <TextInput value={url} onChange={onUrlChange} placeholder="https://example.com/mcp" />
            </label>
            <label className="tinker-add-tool-picker__field">
              <span className="tinker-add-tool-picker__field-label">Header name (optional)</span>
              <TextInput value={headerName} onChange={onHeaderNameChange} placeholder="Authorization" />
            </label>
            <label className="tinker-add-tool-picker__field">
              <span className="tinker-add-tool-picker__field-label">Header value (optional)</span>
              <TextInput value={headerValue} onChange={onHeaderValueChange} placeholder="Bearer sk-…" />
            </label>
          </div>

          <div className="tinker-add-tool-picker__actions">
            <Button variant="ghost" size="s" onClick={() => setView('catalog')}>
              Back
            </Button>
            <Button
              variant="primary"
              size="s"
              disabled={!isCustomValid}
              onClick={handleAddCustom}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

type CatalogViewProps = {
  existingIds: ReadonlyArray<string>;
  onAddCatalog: (catalog: CatalogMcp, secret: string) => void;
  onSwitchToCustom: () => void;
};

const CatalogView = ({
  existingIds,
  onAddCatalog,
  onSwitchToCustom,
}: CatalogViewProps): JSX.Element => (
  <>
    <p className="tinker-add-tool-picker__intro tinker-muted">
      Pick a pre-configured integration or add any MCP server by URL.
    </p>

    <ul className="tinker-add-tool-picker__grid" role="list">
      {CATALOG_MCPS.map((mcp) => {
        const alreadyAdded = existingIds.includes(mcp.id);
        return (
          <CatalogCard
            key={mcp.id}
            mcp={mcp}
            alreadyAdded={alreadyAdded}
            onAdd={onAddCatalog}
          />
        );
      })}

      <li className="tinker-add-tool-picker__card tinker-add-tool-picker__card--custom">
        <div className="tinker-add-tool-picker__card-body">
          <p className="tinker-add-tool-picker__card-title">Custom MCP</p>
          <p className="tinker-add-tool-picker__card-blurb">
            Connect any MCP server by URL
          </p>
        </div>
        <Button variant="secondary" size="s" onClick={onSwitchToCustom}>
          Add
        </Button>
      </li>
    </ul>
  </>
);

type CatalogCardProps = {
  mcp: CatalogMcp;
  alreadyAdded: boolean;
  onAdd: (catalog: CatalogMcp, secret: string) => void;
};

const CatalogCard = ({ mcp, alreadyAdded, onAdd }: CatalogCardProps): JSX.Element => {
  const [expanded, setExpanded] = useState(false);
  const [secret, onSecretChange] = useField();

  const handleAdd = useCallback(() => {
    onAdd(mcp, secret);
  }, [mcp, secret, onAdd]);

  if (alreadyAdded) {
    return (
      <li className="tinker-add-tool-picker__card" aria-disabled="true" data-available="false">
        <div className="tinker-add-tool-picker__card-body">
          <p className="tinker-add-tool-picker__card-title">{mcp.label}</p>
          <p className="tinker-add-tool-picker__card-blurb">Already added</p>
        </div>
      </li>
    );
  }

  return (
    <li className="tinker-add-tool-picker__card" data-available="true">
      <div className="tinker-add-tool-picker__card-body">
        <p className="tinker-add-tool-picker__card-title">{mcp.label}</p>
        <p className="tinker-add-tool-picker__card-blurb">{mcp.description}</p>
      </div>
      {expanded ? (
        <div className="tinker-add-tool-picker__card-secret">
          <TextInput
            value={secret}
            onChange={onSecretChange}
            placeholder={mcp.headerPlaceholder}
            aria-label={mcp.headerName}
          />
          <Button variant="primary" size="s" onClick={handleAdd}>
            Connect
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="s" onClick={() => setExpanded(true)}>
          Set up
        </Button>
      )}
    </li>
  );
};
